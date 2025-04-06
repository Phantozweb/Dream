"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { useAIModel } from "@/hooks/use-ai-model"

interface RelatedQuestionsProps {
  content: string
  onQuestionClick: (question: string) => void
}

export function RelatedQuestions({ content, onQuestionClick }: RelatedQuestionsProps) {
  const { model, getHeaders } = useAIModel()
  const [questions, setQuestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const generateQuestions = async () => {
      if (!content) return

      setIsLoading(true)

      try {
        const response = await fetch("/.netlify/functions/related-questions", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            content,
            model,
          }),
        })

        const data = await response.json()

        if (!data.error && data.questions && data.questions.length > 0) {
          setQuestions(data.questions)
        }
      } catch (error) {
        console.error("Error generating related questions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    generateQuestions()
  }, [content, model])

  if (questions.length === 0) return null

  return (
    <div className="mt-3">
      <p className="text-xs text-muted-foreground mb-2">Related questions:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <Badge
            key={index}
            variant="outline"
            className="cursor-pointer hover:bg-secondary"
            onClick={() => onQuestionClick(question)}
          >
            {question}
          </Badge>
        ))}
      </div>
    </div>
  )
}

