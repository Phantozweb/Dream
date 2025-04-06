import { Brain } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t mt-auto py-4 sm:py-6">
      <div className="container flex flex-col items-center justify-center gap-4 text-center sm:text-left sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Focus.AI</span>
        </div>

        <div className="flex items-center">
          <span className="text-sm text-muted-foreground">
            Powered by{" "}
            <span className="font-medium bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent animate-pulse">
              Lens and Lights
            </span>
          </span>
        </div>
      </div>
    </footer>
  )
}

