"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FileQuestion, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAIModel } from "@/hooks/use-ai-model"

interface QuizQuestion {
  id: number
  text: string
  options: { id: string; text: string }[]
  correctAnswer: string
  explanation: string
}

interface Quiz {
  title: string
  questions: QuizQuestion[]
}

export function QuizGenerator() {
  const { toast } = useToast()
  const { model, getHeaders } = useAIModel()
  const [quizTopic, setQuizTopic] = useState("")
  const [quizDifficulty, setQuizDifficulty] = useState("medium")
  const [quizQuestions, setQuizQuestions] = useState(5)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [quiz, setQuiz] = useState<Quiz | null>(null)

  const handleQuizGeneration = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGeneratingQuiz(true)

    try {
      const response = await fetch("/.netlify/functions/generate-quiz", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          topic: quizTopic,
          difficulty: quizDifficulty,
          numberOfQuestions: quizQuestions,
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
        setQuiz(data)
        toast({
          title: "Quiz Generated",
          description: `Created a ${quizDifficulty} quiz on ${quizTopic} with ${data.questions.length} questions.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleQuizGeneration} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-topic">Quiz Topic</Label>
              <Input
                id="quiz-topic"
                placeholder="e.g., Glaucoma, Contact Lenses"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiz-difficulty">Difficulty</Label>
              <Select value={quizDifficulty} onValueChange={setQuizDifficulty}>
                <SelectTrigger id="quiz-difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiz-questions">Number of Questions</Label>
              <Select
                value={quizQuestions.toString()}
                onValueChange={(value) => setQuizQuestions(Number.parseInt(value))}
              >
                <SelectTrigger id="quiz-questions">
                  <SelectValue placeholder="Select number" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Questions</SelectItem>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isGeneratingQuiz || !quizTopic.trim()}>
              {isGeneratingQuiz ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileQuestion className="h-4 w-4 mr-2" />
                  Generate Quiz
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {quiz && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">{quiz.title}</h3>
            <div className="space-y-6">
              {quiz.questions.map((question, qIndex) => (
                <div key={qIndex} className="space-y-3">
                  <p className="font-medium">
                    {qIndex + 1}. {question.text}
                  </p>
                  <div className="space-y-2 ml-4">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <Badge variant="outline" className="min-w-[24px] text-center">
                          {option.id}
                        </Badge>
                        <span className="text-sm">{option.text}</span>
                        {option.id === question.correctAnswer && (
                          <Badge variant="default" className="ml-auto">
                            Correct
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="mt-2">
                        Show Explanation
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <p className="text-sm">{question.explanation}</p>
                    </PopoverContent>
                  </Popover>
                  {qIndex < quiz.questions.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

