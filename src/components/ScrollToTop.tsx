import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // The target section may be lazy-loaded, so retry until it exists
      let timer: ReturnType<typeof setTimeout>
      let attempts = 0
      const tryScroll = () => {
        const el = document.getElementById(hash.slice(1))
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        } else if (attempts < 40) {
          attempts++
          timer = setTimeout(tryScroll, 60)
        }
      }
      timer = setTimeout(tryScroll, 60)
      return () => clearTimeout(timer)
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [pathname, hash])

  return null
}

export default ScrollToTop
