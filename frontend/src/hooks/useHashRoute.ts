import { useEffect, useState } from 'react'

export type RouteName = 'home' | 'about' | 'projects' | 'more-building' | 'research' | 'writing' | 'shared-sky' | 'contact'

function readRoute(): RouteName {
  const route = window.location.hash.replace(/^#\/?/, '').split('?')[0] || 'home'
  const routes: RouteName[] = ['home', 'about', 'projects', 'more-building', 'research', 'writing', 'shared-sky', 'contact']
  return routes.includes(route as RouteName) ? route as RouteName : 'home'
}

export function useHashRoute() {
  const [route, setRoute] = useState<RouteName>(readRoute)

  useEffect(() => {
    const update = () => {
      setRoute(readRoute())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])

  return route
}
