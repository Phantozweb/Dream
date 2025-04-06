"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Wand2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAIModel } from "@/hooks/use-ai-model"

interface ContentTransformerProps {
  content: string
  onTransform: (transformedContent: string) => void
}

export function ContentTransformer({ content, onTransform }: ContentTransformerProps) {
  const { toast } = useToast()
  const { model, getHeaders } = useAIModel()
  const [isTransforming, setIsTransforming] = useState(false)
  const [currentAction, setCurrentAction] = useState<string | null>(null)

  const handleTransform = async (action: string) => {
    setIsTransforming(true)
    setCurrentAction(action)

    try {
      const response = await fetch("/api/transform-content", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          content,
          action,
          model,
        }),
      })

      const data = await response.json()

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      } else {
        onTransform(data.transformedContent)

        toast({
          title: "Content Transformed",
          description: `Successfully ${
            action === "simplify"
              ? "simplified"
              : action === "expand"
                ? "expanded"
                : action === "summarize"
                  ? "summarized"
                  : action === "clinical"
                    ? "converted to clinical format"
                    : action === "student"
                      ? "converted to student-friendly format"
                      : "transformed"
          } the content.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} content. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsTransforming(false)
      setCurrentAction(null)
    }
  }

  // Update the dropdown menu to include more transformation options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
          {isTransforming ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3 text-blue-500" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleTransform("simplify")} disabled={isTransforming}>
          {currentAction === "simplify" ? "Simplifying..." : "Simplify"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTransform("expand")} disabled={isTransforming}>
          {currentAction === "expand" ? "Expanding..." : "Expand"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTransform("summarize")} disabled={isTransforming}>
          {currentAction === "summarize" ? "Summarizing..." : "Summarize"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTransform("clinical")} disabled={isTransforming}>
          {currentAction === "clinical" ? "Making Clinical..." : "Make Clinical"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTransform("student")} disabled={isTransforming}>
          {currentAction === "student" ? "Making Student-Friendly..." : "Make Student-Friendly"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

