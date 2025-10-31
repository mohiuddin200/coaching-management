"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export interface UserData {
  name: string
  email: string
  avatar: string
}

export function useUserData() {
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUserData({
          name: user?.user_metadata?.first_name 
            ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
            : user?.email?.split('@')[0] || 'User',
          email: user?.email || '',
          avatar: user?.user_metadata?.avatar_url || '',
        })
      }
    }

    fetchUser()
  }, [])

  return userData
}
