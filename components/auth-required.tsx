"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LockIcon } from "lucide-react"

interface AuthRequiredProps {
  children: ReactNode
  requireAuth?: boolean // If true, requires login to view content
  requireAIAccess?: boolean // If true, requires AI access to view content
  fallback?: ReactNode // Optional custom fallback component
}

export function AuthRequired({ children, requireAuth = true, requireAIAccess = false, fallback }: AuthRequiredProps) {
  const { isAuthenticated, hasAIFeatures } = useAuth()

  // If authentication is not required, just render children
  if (!requireAuth) {
    return <>{children}</>
  }

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold tracking-tight">Login Required</h1>
          <p className="text-muted-foreground">Please login to access this feature</p>
          <LoginForm />
        </div>
      </div>
    )
  }

  // If AI access is required but user doesn't have it
  if (requireAIAccess && !hasAIFeatures) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Card className="border-yellow-500/50 bg-yellow-500/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <LockIcon className="h-5 w-5 text-yellow-500" />
            <CardTitle>Premium Feature</CardTitle>
          </div>
          <CardDescription>This feature requires premium access</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            You are currently using a free account. To access AI-powered features, please upgrade to a premium plan or
            contact your administrator for beta access.
          </p>
          <div className="mt-4">
            <Badge
              variant="outline"
              className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50"
            >
              Free Account
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  // User is authenticated and has required access
  return <>{children}</>
}

