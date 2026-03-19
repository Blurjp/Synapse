"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { Mail, Lock, ArrowRight } from "lucide-react"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [authMethod, setAuthMethod] = useState<"choice" | "credentials" | "google">("choice")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error("Sign in error:", error)
      setIsLoading(false)
    }
  }

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/dashboard",
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setIsLoading(false)
      } else {
        window.location.href = "/dashboard"
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/icon.jpg" alt="Synapse" className="inline-block w-16 h-16 rounded-2xl mb-4 shadow-xl" />
          <h1 className="text-3xl font-bold text-secondary-900">Welcome to Synapse</h1>
          <p className="mt-2 text-secondary-600">Sign in to continue</p>
        </div>

        {/* Auth Card */}
        <div className="card shadow-xl">
          {authMethod === "choice" && (
            <div className="space-y-4">
              <button
                onClick={() => setAuthMethod("credentials")}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-md"
              >
                <Mail className="w-5 h-5" />
                Sign in with Email
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-secondary-500">or</span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-secondary-200 rounded-lg bg-white text-secondary-700 hover:bg-secondary-50 transition-colors font-medium disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-secondary-900" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </div>
          )}

          {authMethod === "credentials" && (
            <form onSubmit={handleCredentialsSignIn} className="space-y-4">
              <button
                type="button"
                onClick={() => setAuthMethod("choice")}
                className="text-sm text-secondary-500 hover:text-primary-500 mb-4 transition-colors"
              >
                ← Back
              </button>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="demo@synapse.app"
                    className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-lg text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-lg text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-danger-500 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-md disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="mt-4 p-3 bg-gradient-primary-light rounded-lg border border-primary-100">
                <p className="text-xs text-secondary-600 text-center">
                  <strong className="text-primary-700">Demo accounts:</strong><br />
                  demo@synapse.app / demo123<br />
                  test@synapse.app / test123
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
