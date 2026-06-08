import { createContext, useContext, useState, ReactNode } from 'react'

interface ActiveCall {
  id: number
  clientName: string
}

interface VideoCallCtx {
  activeCall: ActiveCall | null
  startCall: (id: number, clientName: string) => void
  clearCall: () => void
}

const VideoCallContext = createContext<VideoCallCtx>({
  activeCall: null,
  startCall: () => {},
  clearCall: () => {},
})

export function VideoCallProvider({ children }: { children: ReactNode }) {
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null)
  return (
    <VideoCallContext.Provider value={{
      activeCall,
      startCall: (id, clientName) => setActiveCall({ id, clientName }),
      clearCall: () => setActiveCall(null),
    }}>
      {children}
    </VideoCallContext.Provider>
  )
}

export const useVideoCall = () => useContext(VideoCallContext)
