"use client"

import { useSession, signIn, signOut } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()

  const isAuthenticated = status === "authenticated"
  const isLoading = status === "loading"
  const user = session?.user

  const login = async (provider: string = "google") => {
    await signIn(provider, { callbackUrl: "/" })
  }

  const logout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    accessToken: (session as any)?.accessToken,
  }
}
