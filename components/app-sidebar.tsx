"use client"

import {
  BookOpen,
  Brain,
  FileText,
  FlaskRoundIcon as Flask,
  Home,
  MessageSquare,
  Moon,
  Sun,
  Menu,
  User,
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/components/auth-provider"

export function AppSidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isMobile = useIsMobile()
  const { user } = useAuth()

  // After mounting, we can access localStorage
  useEffect(() => {
    setMounted(true)
    // Force dark mode
    document.documentElement.classList.add("dark")
    localStorage.setItem("dark_mode", "true")
    setTheme("dark")
  }, [setTheme])

  const isActive = (path: string) => {
    return pathname === path
  }

  const toggleTheme = () => {
    // Do nothing - we're forcing dark mode
  }

  // In the navigationItems array, remove any settings-related items
  const navigationItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/assistant", label: "AI Assistant", icon: MessageSquare },
    { path: "/case-studies", label: "Case Studies", icon: Flask },
    { path: "/notes", label: "Notes", icon: FileText },
    { path: "/quizzes", label: "Practice Quizzes", icon: BookOpen },
    { path: "/academics", label: "Academics", icon: BookOpen },
  ]

  // Mobile navigation bar
  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Focus.AI</span>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[350px] pt-12">
              <div className="flex flex-col gap-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                      isActive(item.path) ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                    }`}
                  >
                    <item.icon className="h-5 w-5 text-blue-500" />
                    <span>{item.label}</span>
                  </Link>
                ))}

                <div className="border-t my-2 pt-4">
                  <Link
                    href="/account"
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                      isActive("/account") ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                    }`}
                  >
                    <User className="h-5 w-5 text-blue-500" />
                    <span>Account</span>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Add padding to account for the fixed navbar */}
        <div className="pt-14"></div>
      </>
    )
  }

  // Desktop sidebar
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Brain className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Focus.AI</span>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)} className="transition-all duration-200">
                    <Link href={item.path}>
                      <item.icon className="text-blue-500" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="hidden">
            <SidebarMenuButton onClick={toggleTheme} className="transition-all duration-200">
              {mounted && theme === "dark" ? <Sun className="text-blue-500" /> : <Moon className="text-blue-500" />}
              <span>{mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/account")} className="transition-all duration-200">
              <Link href="/account">
                <User className="text-blue-500" />
                <span>Account</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

