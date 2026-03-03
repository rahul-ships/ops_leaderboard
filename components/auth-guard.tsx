"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const AUTH_KEY = "9089opiulkj89IU"
const STORAGE_KEY = "ops_leaderboard_auth"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [inputKey, setInputKey] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const storedAuth = localStorage.getItem(STORAGE_KEY)
    if (storedAuth === AUTH_KEY) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (inputKey === AUTH_KEY) {
      localStorage.setItem(STORAGE_KEY, AUTH_KEY)
      setIsAuthenticated(true)
    } else {
      setError("Invalid access key. Please try again.")
      setInputKey("")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Operations Leaderboard
            </CardTitle>
            <CardDescription className="text-center">
              Enter your access key to view the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter access key"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full"
                  autoFocus
                />
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
