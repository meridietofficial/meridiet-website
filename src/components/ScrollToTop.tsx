import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      // small delay lets the new page render before we scroll
      const timer = setTimeout(() => {
        const el = document.getElementById(hash.slice(1))
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 80)
      return () => clearTimeout(timer)
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [pathname, hash])

  return null
}

export default ScrollToTop
