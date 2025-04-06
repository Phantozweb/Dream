"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, ArrowLeft, Info, Save, LogOut, Shield } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { getRoleDescription } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { LoginForm } from "@/components/login-form"

export default function AccountPage() {
  const { toast } = useToast()
  const { user, isAuthenticated, hasAIFeatures, logout } = useAuth()
  const [defaultModel, setDefaultModel] = useState("gemini-pro")
  const [autoSaveNotes, setAutoSaveNotes] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  // Load settings from localStorage on component mount
  useEffect(() => {
    const storedDefaultModel = localStorage.getItem("default_model") || "gemini-pro"
    const storedAutoSaveNotes = localStorage.getItem("auto_save_notes") !== "false"

    // Force dark mode
    document.documentElement.classList.add("dark")
    localStorage.setItem("dark_mode", "true")
    setDarkMode(true)

    setDefaultModel(storedDefaultModel)
    setAutoSaveNotes(storedAutoSaveNotes)
  }, [])

  const saveSettings = () => {
    localStorage.setItem("default_model", defaultModel)
    localStorage.setItem("auto_save_notes", autoSaveNotes.toString())
    localStorage.setItem("dark_mode", darkMode.toString())

    // Apply dark mode immediately
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  // Get account status badge
  const getAccountBadge = () => {
    if (!user) return null

    switch (user.role) {
      case "admin":
        return (
          <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/50">
            Administrator
          </Badge>
        )
      case "premium":
        return <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/50">Premium</Badge>
      case "beta":
        return (
          <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50">Beta Tester</Badge>
        )
      case "free":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50">
            Free Account
          </Badge>
        )
      default:
        return null
    }
  }

  // If not authenticated, show login form
  if (!isAuthenticated) {
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
            <h1 className="text-3xl font-bold tracking-tight">Account</h1>
          </div>
          <p className="text-muted-foreground">Please login to manage your account</p>

          <LoginForm />
        </div>
      </div>
    )
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        </div>
        <p className="text-muted-foreground">Manage your account and preferences</p>

        <Tabs defaultValue="account" className="space-y-4">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            {hasAIFeatures && <TabsTrigger value="ai-settings">AI Settings</TabsTrigger>}
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Manage your account details and subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input value={user?.email || ""} disabled />
                  <p className="text-xs text-muted-foreground">
                    This is the email address associated with your account.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={user?.name || ""} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <div className="bg-primary/10 text-primary p-2 rounded-full">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{getRoleDescription(user?.role || "free")}</p>
                      {user?.expiryDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Active until {new Date(user.expiryDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="ml-auto">{getAccountBadge()}</div>
                  </div>
                </div>

                {!hasAIFeatures && (
                  <Alert className="bg-yellow-500/10 border-yellow-500/50 text-yellow-700 dark:text-yellow-400">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Limited Access</AlertTitle>
                    <AlertDescription>
                      Your current account does not have access to AI-powered features. Upgrade to a premium plan or
                      request beta access to unlock all features.
                    </AlertDescription>
                  </Alert>
                )}
                {isAuthenticated && (
                  <Card className="mt-4 bg-gradient-to-br from-background to-primary/5 border shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle>Subscription Tier</CardTitle>
                      <CardDescription>Your current plan and benefits</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-full 
          ${
            user?.role === "admin"
              ? "bg-purple-500/20"
              : user?.role === "premium"
                ? "bg-blue-500/20"
                : user?.role === "beta"
                  ? "bg-green-500/20"
                  : "bg-yellow-500/20"
          }`}
                        >
                          <Shield
                            className={`h-6 w-6 
            ${
              user?.role === "admin"
                ? "text-purple-500"
                : user?.role === "premium"
                  ? "text-blue-500"
                  : user?.role === "beta"
                    ? "text-green-500"
                    : "text-yellow-500"
            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium">{getRoleDescription(user?.role || "free")}</h3>
                          <p className="text-sm text-muted-foreground">
                            {user?.role === "admin"
                              ? "Full access to all features and admin controls"
                              : user?.role === "premium"
                                ? "Full access to all AI features and premium content"
                                : user?.role === "beta"
                                  ? "Early access to new features and AI capabilities"
                                  : "Basic access with limited AI features"}
                          </p>
                          {user?.expiryDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Active until {new Date(user.expiryDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">AI Assistant</span>
                          <Badge
                            variant={hasAIFeatures ? "default" : "outline"}
                            className={hasAIFeatures ? "bg-green-500/20 text-green-600 border-green-500/50" : ""}
                          >
                            {hasAIFeatures ? "Available" : "Restricted"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Case Study Generator</span>
                          <Badge
                            variant={hasAIFeatures ? "default" : "outline"}
                            className={hasAIFeatures ? "bg-green-500/20 text-green-600 border-green-500/50" : ""}
                          >
                            {hasAIFeatures ? "Available" : "Restricted"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">AI Note Generation</span>
                          <Badge
                            variant={hasAIFeatures ? "default" : "outline"}
                            className={hasAIFeatures ? "bg-green-500/20 text-green-600 border-green-500/50" : ""}
                          >
                            {hasAIFeatures ? "Available" : "Restricted"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Practice Quizzes</span>
                          <Badge
                            variant={hasAIFeatures ? "default" : "outline"}
                            className={hasAIFeatures ? "bg-green-500/20 text-green-600 border-green-500/50" : ""}
                          >
                            {hasAIFeatures ? "Available" : "Restricted"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
                {!hasAIFeatures && (
                  <Button variant="shimmer" className="animate-pulse-border">
                    Upgrade to Premium
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
                <CardDescription>Customize your experience with Focus.AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Dark theme is enabled by default</p>
                  </div>
                  <Switch id="dark-mode" checked={true} disabled={true} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-save">Auto-save Notes</Label>
                    <p className="text-sm text-muted-foreground">Automatically save notes while typing</p>
                  </div>
                  <Switch id="auto-save" checked={autoSaveNotes} onCheckedChange={setAutoSaveNotes} />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} variant="shimmer" className="animate-pulse-border">
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {hasAIFeatures && (
            <TabsContent value="ai-settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Model Settings</CardTitle>
                  <CardDescription>Configure which AI model to use for different features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>
                      As a premium user, you have access to all AI models and features.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="default-model">Default AI Model</Label>
                    <Select value={defaultModel} onValueChange={setDefaultModel}>
                      <SelectTrigger id="default-model" className="border-primary/20 focus:ring-primary/50">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini-1.5-pro">Google Gemini 1.5 Pro</SelectItem>
                        <SelectItem value="gemini-1.5-flash">Google Gemini 1.5 Flash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={saveSettings} variant="shimmer" className="animate-pulse-border">
                    <Save className="mr-2 h-4 w-4" />
                    Save Model Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

