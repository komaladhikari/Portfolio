import { useEffect } from 'react'

export function useScrollReveal(route: string) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]')

    if (reduced) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })

    elements.forEach((element) => {
      element.classList.add('reveal-ready')
      observer.observe(element)
    })

    return () => observer.disconnect()
  }, [route])
}
