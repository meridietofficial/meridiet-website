import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function FestiveConfetti() {
  useEffect(() => {
    const end = Date.now() + 2800

    const colors = ['#1E8E3E', '#f4842c', '#FFD700', '#ffffff', '#27a34d']

    // Party poppers from both corners
    function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors,
        zIndex: 9999,
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors,
        zIndex: 9999,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    // Small delay so page has painted before confetti fires
    const timer = setTimeout(frame, 300)
    return () => clearTimeout(timer)
  }, [])

  return null
}
