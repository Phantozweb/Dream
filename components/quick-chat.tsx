"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, Bot, Sparkles } from "lucide-react"
import { QuickAnswer } from "@/components/quick-answer"

export function QuickChat() {
  const [question, setQuestion] = useState("")
  const [showAnswer, setShowAnswer] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim()) {
      setCurrentQuestion(question)
      setShowAnswer(true)
      setQuestion("")
    }
  }

  const handleClose = () => {
    setShowAnswer(false)
  }

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-primary" />
            <span>Quick Question</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Ask anything about optometry..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm" className="shrink-0">
              <Send className="h-4 w-4 mr-2" />
              Ask
            </Button>
          </form>
        </CardContent>
        <CardFooter className="pt-0 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Get instant answers to your optometry questions</span>
          </div>
        </CardFooter>
      </Card>

      {showAnswer && <QuickAnswer question={currentQuestion} onClose={handleClose} />}
    </div>
  )
}

