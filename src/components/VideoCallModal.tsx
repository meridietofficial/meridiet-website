import { useState, useEffect, useRef } from 'react'
import type {
  IAgoraRTCClient,
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
  IRemoteVideoTrack,
} from 'agora-rtc-sdk-ng'
import appointmentApi, { RecordingData } from '../api/appointment'

type Phase = 'connecting' | 'in-call' | 'ended' | 'error'

interface Props {
  appointmentId: number
  clientName: string
  onClose: () => void
}

function fmt(secs: number) {
  return `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function defaultPipPos() {
  return { x: Math.max(0, window.innerWidth - 330), y: Math.max(0, window.innerHeight - 230) }
}

export default function VideoCallModal({ appointmentId, clientName, onClose }: Props) {
  const [phase, setPhase]               = useState<Phase>('connecting')
  const [errorMsg, setErrorMsg]         = useState('')
  const [micOn, setMicOn]               = useState(true)
  const [camOn, setCamOn]               = useState(true)
  const [elapsed, setElapsed]           = useState(0)
  const [hasRemote, setHasRemote]       = useState(false)
  const [recording, setRecording]       = useState<RecordingData | null>(null)
  const [recordingPending, setRecordingPending] = useState(false)
  const [maximized, setMaximized]       = useState(false)
  const [pip, setPip]                   = useState(false)
  const [pipPos, setPipPos]             = useState(defaultPipPos)

  const localRef       = useRef<HTMLDivElement>(null)
  const remoteRef      = useRef<HTMLDivElement>(null)
  const clientRef      = useRef<IAgoraRTCClient | null>(null)
  const audioRef       = useRef<IMicrophoneAudioTrack | null>(null)
  const videoRef       = useRef<ICameraVideoTrack | null>(null)
  const remoteVideoRef = useRef<IRemoteVideoTrack | null>(null)
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedAt      = useRef(0)
  const mountedRef     = useRef(true)
  const drag           = useRef({ active: false, startX: 0, startY: 0, startLeft: 0, startTop: 0 })

  // ── Agora init ──────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true

    async function init() {
      try {
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default
        const creds = await appointmentApi.joinCall(appointmentId)
        if (!mountedRef.current) return

        const agora = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
        clientRef.current = agora

        agora.on('user-published', async (user, mediaType) => {
          await agora.subscribe(user, mediaType)
          if (mediaType === 'video') {
            setHasRemote(true)
            remoteVideoRef.current = user.videoTrack ?? null
            if (remoteRef.current) user.videoTrack?.play(remoteRef.current)
          }
          if (mediaType === 'audio') user.audioTrack?.play()
        })

        agora.on('user-unpublished', (_u, mediaType) => {
          if (mediaType === 'video') { setHasRemote(false); remoteVideoRef.current = null }
        })
        agora.on('user-left', () => { setHasRemote(false); remoteVideoRef.current = null })

        await agora.join(creds.app_id, creds.channel_name, creds.token, creds.uid)

        const [audio, video] = await AgoraRTC.createMicrophoneAndCameraTracks()
        if (!mountedRef.current) { audio.close(); video.close(); return }

        audioRef.current = audio
        videoRef.current = video
        if (localRef.current) video.play(localRef.current)
        await agora.publish([audio, video])

        // Sync timer from server if call_started_at is provided
        startedAt.current = creds.call_started_at
          ? new Date(creds.call_started_at).getTime()
          : Date.now()

        timerRef.current = setInterval(() => {
          if (mountedRef.current)
            setElapsed(Math.floor((Date.now() - startedAt.current) / 1000))
        }, 1000)

        if (mountedRef.current) setPhase('in-call')
      } catch (e: any) {
        if (mountedRef.current) {
          setErrorMsg(e?.message ?? 'Could not start video call')
          setPhase('error')
        }
      }
    }

    init()
    return () => { mountedRef.current = false; doCleanup() }
  }, [appointmentId])

  // Re-play video when switching between PiP / full modes
  useEffect(() => {
    const tick = setTimeout(() => {
      if (videoRef.current && localRef.current) {
        videoRef.current.stop()
        videoRef.current.play(localRef.current)
      }
      if (remoteVideoRef.current && remoteRef.current) {
        remoteVideoRef.current.stop()
        remoteVideoRef.current.play(remoteRef.current)
      }
    }, 60)
    return () => clearTimeout(tick)
  }, [pip])

  // ── PiP drag ────────────────────────────────────────────────
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!drag.current.active) return
      const x = Math.max(0, Math.min(window.innerWidth  - 300, drag.current.startLeft + e.clientX - drag.current.startX))
      const y = Math.max(0, Math.min(window.innerHeight - 200, drag.current.startTop  + e.clientY - drag.current.startY))
      setPipPos({ x, y })
    }
    function onUp() { drag.current.active = false }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
  }, [])

  function startDrag(e: React.MouseEvent) {
    e.preventDefault()
    drag.current = { active: true, startX: e.clientX, startY: e.clientY, startLeft: pipPos.x, startTop: pipPos.y }
  }

  // ── Cleanup ─────────────────────────────────────────────────
  function doCleanup() {
    if (timerRef.current)     { clearInterval(timerRef.current); timerRef.current = null }
    if (pollTimerRef.current) { clearTimeout(pollTimerRef.current); pollTimerRef.current = null }
    audioRef.current?.stop(); audioRef.current?.close(); audioRef.current = null
    videoRef.current?.stop(); videoRef.current?.close(); videoRef.current = null
    clientRef.current?.leave(); clientRef.current = null
  }

  // ── End call ────────────────────────────────────────────────
  async function endCall() {
    doCleanup()
    setPip(false)
    setPhase('ended')

    // 1. Tell server the call ended — get authoritative duration
    try {
      const leave = await appointmentApi.leaveCall(appointmentId)
      if (!mountedRef.current) return
      setRecording({
        video_call_status: 'ended',
        recording_url: null,
        call_started_at: null,
        call_ended_at: leave.call_ended_at,
        call_duration_seconds: leave.call_duration_seconds,
      })
    } catch {
      // Fallback: use local elapsed time
      if (!mountedRef.current) return
      setRecording({
        video_call_status: 'ended',
        recording_url: null,
        call_started_at: null,
        call_ended_at: null,
        call_duration_seconds: elapsed,
      })
    }

    // 2. Poll for recording URL (webhook fires ~30s after call ends)
    setRecordingPending(true)
    pollRecording()
  }

  function pollRecording() {
    let attempts = 0
    async function tryFetch() {
      if (!mountedRef.current) return
      attempts++
      try {
        const rec = await appointmentApi.getRecording(appointmentId)
        if (!mountedRef.current) return
        if (rec.recording_url) {
          setRecording(rec)
          setRecordingPending(false)
          return
        }
      } catch { /* recording not ready yet */ }
      if (attempts < 30 && mountedRef.current) {
        pollTimerRef.current = setTimeout(tryFetch, 10_000)
      } else {
        setRecordingPending(false)
      }
    }
    pollTimerRef.current = setTimeout(tryFetch, 10_000) // first poll after 10s
  }

  function toggleMic() { audioRef.current?.setEnabled(!micOn); setMicOn(v => !v) }
  function toggleCam() { videoRef.current?.setEnabled(!camOn); setCamOn(v => !v) }
  function enterPip()  { setPipPos(defaultPipPos()); setMaximized(false); setPip(true) }
  function exitPip()   { setPip(false) }

  // ════════════════════════════════════════════════════════════
  // PiP floating box
  // ════════════════════════════════════════════════════════════
  if (pip) {
    return (
      <div
        className="vc-pip"
        style={{ left: pipPos.x, top: pipPos.y }}
        onMouseDown={startDrag}
      >
        <div ref={remoteRef} className="vc-pip-remote">
          {!hasRemote && <div className="vc-pip-avatar">{getInitials(clientName)}</div>}
        </div>
        <div ref={localRef} className="vc-pip-self" />

        <div className="vc-pip-topbar">
          <span className="vc-pip-dot" />
          <span className="vc-pip-name">{clientName}</span>
          <span className="vc-pip-timer">{fmt(elapsed)}</span>
        </div>

        <div className="vc-pip-footer">
          <button className="vc-pip-btn" title="Mute" onMouseDown={e => e.stopPropagation()} onClick={toggleMic}>
            <i className={micOn ? 'fa-solid fa-microphone' : 'fa-solid fa-microphone-slash'} />
          </button>
          <button className="vc-pip-btn vc-pip-btn--end" title="End call" onMouseDown={e => e.stopPropagation()} onClick={endCall}>
            <i className="fa-solid fa-phone-slash" />
          </button>
          <button className="vc-pip-btn" title="Expand" onMouseDown={e => e.stopPropagation()} onClick={exitPip}>
            <i className="fa-solid fa-expand" />
          </button>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // Full modal
  // ════════════════════════════════════════════════════════════
  return (
    <div
      className={`vc-overlay${maximized ? ' vc-overlay--maximized' : ''}`}
      onClick={e => { if (e.target === e.currentTarget && phase !== 'in-call') onClose() }}
    >
      <div className="vc-modal">

        {/* ── Stage ── */}
        <div className="vc-stage">
          <div ref={remoteRef} className="vc-remote">
            {!hasRemote && phase === 'in-call' && (
              <div className="vc-waiting">
                <div className="vc-waiting-avatar">{getInitials(clientName)}</div>
                <p className="vc-waiting-text">Waiting for {clientName} to join…</p>
              </div>
            )}
          </div>
          <div ref={localRef} className="vc-local" />
        </div>

        {/* ── Header ── */}
        {(phase === 'in-call' || phase === 'connecting') && (
          <div className="vc-header">
            <div className="vc-header-left">
              <span className="vc-dot" />
              <span className="vc-client-name">{clientName}</span>
            </div>
            <div className="vc-header-right">
              <span className="vc-timer">{fmt(elapsed)}</span>
              <button className="vc-header-btn" title="Float to corner" onClick={enterPip}>
                <i className="fa-solid fa-down-left-and-up-right-to-center" />
              </button>
              <button className="vc-header-btn" title={maximized ? 'Restore' : 'Maximize'} onClick={() => setMaximized(v => !v)}>
                <i className={maximized ? 'fa-solid fa-compress' : 'fa-solid fa-expand'} />
              </button>
            </div>
          </div>
        )}

        {/* ── Controls ── */}
        {(phase === 'in-call' || phase === 'connecting') && (
          <div className="vc-controls">
            <button className={`vc-ctrl${micOn ? '' : ' vc-ctrl--off'}`} title={micOn ? 'Mute' : 'Unmute'} onClick={toggleMic}>
              <i className={micOn ? 'fa-solid fa-microphone' : 'fa-solid fa-microphone-slash'} />
            </button>
            <button className={`vc-ctrl${camOn ? '' : ' vc-ctrl--off'}`} title={camOn ? 'Camera off' : 'Camera on'} onClick={toggleCam}>
              <i className={camOn ? 'fa-solid fa-video' : 'fa-solid fa-video-slash'} />
            </button>
            <button className="vc-ctrl vc-ctrl--end" title="End call" onClick={endCall}>
              <i className="fa-solid fa-phone-slash" />
            </button>
          </div>
        )}

        {/* ── Connecting ── */}
        {phase === 'connecting' && (
          <div className="vc-overlay-panel">
            <div className="vc-spinner" />
            <p className="vc-overlay-text">Connecting to call…</p>
          </div>
        )}

        {/* ── Error ── */}
        {phase === 'error' && (
          <div className="vc-overlay-panel">
            <div className="vc-overlay-icon vc-overlay-icon--red">
              <i className="fa-solid fa-triangle-exclamation" />
            </div>
            <p className="vc-overlay-title">Connection Failed</p>
            <p className="vc-overlay-text">{errorMsg}</p>
            <button className="vc-close-btn" onClick={onClose}>Close</button>
          </div>
        )}

        {/* ── Ended ── */}
        {phase === 'ended' && (
          <div className="vc-overlay-panel">
            <div className="vc-overlay-icon">
              <i className="fa-solid fa-phone-slash" />
            </div>
            <p className="vc-overlay-title">Call Ended</p>

            {recording && (
              <p className="vc-overlay-text">
                Duration: <strong>{fmt(recording.call_duration_seconds)}</strong>
              </p>
            )}

            {recording?.recording_url ? (
              <a className="vc-recording-link" href={recording.recording_url} target="_blank" rel="noreferrer">
                <i className="fa-solid fa-circle-play" /> Watch Recording
              </a>
            ) : recordingPending ? (
              <div className="vc-recording-processing">
                <div className="vc-spinner vc-spinner--sm" />
                <span>Processing recording…</span>
              </div>
            ) : null}

            <button className="vc-close-btn" onClick={onClose}>Close</button>
          </div>
        )}

      </div>
    </div>
  )
}
