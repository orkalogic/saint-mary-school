// src/hooks/useCurrentUser.ts
// Fetches the current user from our API (Supabase-backed)

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { api, type CurrentUser } from '../lib/api'

export function useCurrentUser() {
  const [convexUser, setConvexUser] = useState<CurrentUser | null | undefined>(undefined)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Listen to auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session)
      if (session) {
        // Fetch user profile from our API
        api.auth.getCurrentUser().then(setConvexUser).catch(() => setConvexUser(null))
      } else {
        setConvexUser(null)
      }
      setIsLoading(false)
    })

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSignedIn(!!session)
      if (session) {
        api.auth.getCurrentUser().then(setConvexUser).catch(() => setConvexUser(null))
      } else {
        setConvexUser(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    convexUser,
    isLoading,
    isSignedIn,
  }
}
