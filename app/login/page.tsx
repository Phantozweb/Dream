"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  return (
    <div className="container mx-auto p-4 md:p-6 page-transition-enter page-transition-enter-active">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild className="h-8 w-8 animate-float">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Login</h1>
        </div>
        <p className="text-muted-foreground">Sign in to access your Focus.AI account</p>

        <div className="max-w-md mx-auto w-full mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

