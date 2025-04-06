"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileQuestion, Loader2, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

// Add AuthRequired wrapper around the quizzes page
import { AuthRequired } from "@/components/auth-required"
import { sampleData } from "@/lib/auth"

export default function QuizzesPage() {
  const { toast } = useToast()
  const [quizTopic, setQuizTopic] = useState("")
  const [quizDifficulty, setQuizDifficulty] = useState("medium")
  const [quizQuestions, setQuizQuestions] = useState(5)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [quiz, setQuiz] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)

  // Update the quiz generation to use AI more extensively
  const handleQuizGeneration = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGeneratingQuiz(true)

    try {
      // Skip the Netlify function and use the Next.js API route directly
      console.log("Attempting to use Next.js API route for quiz generation...")

      try {
        const response = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-gemini-api-key": "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE",
          },
          body: JSON.stringify({
            topic: quizTopic || "General Optometry",
            difficulty: quizDifficulty,
            numberOfQuestions: quizQuestions,
          }),
        })

        // Check if response is OK before trying to parse JSON
        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`)
        }

        // Get the response text first to check if it's valid JSON
        const responseText = await response.text()

        try {
          // Try to parse as JSON
          const data = JSON.parse(responseText)
          setQuiz(data)
          setIsGeneratingQuiz(false)
          setAnswers({})
          setSubmitted(false)

          toast({
            title: "Quiz Generated",
            description: `Created a ${quizDifficulty} quiz on ${quizTopic || "Optometry"} with ${data.questions.length} questions.`,
          })
          return
        } catch (jsonError) {
          console.error("Failed to parse response as JSON:", responseText.substring(0, 100) + "...")
          throw new Error("Response is not valid JSON")
        }
      } catch (apiError) {
        console.error("Error with API route:", apiError)
        throw apiError // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      console.error("Error generating quiz:", error)

      // Generate a fallback quiz if the API fails
      const fallbackQuiz = {
        title: `${quizDifficulty} Quiz on ${quizTopic || "Optometry"}`,
        questions: [
          {
            id: 1,
            text: "What is the most likely classification of diabetic retinopathy in this patient?",
            options: [
              { id: "A", text: "Mild non-proliferative diabetic retinopathy" },
              { id: "B", text: "Moderate non-proliferative diabetic retinopathy" },
              { id: "C", text: "Severe non-proliferative diabetic retinopathy" },
              { id: "D", text: "Proliferative diabetic retinopathy" },
            ],
            correctAnswer: "B",
            explanation:
              "The presence of multiple microaneurysms, dot/blot hemorrhages, hard exudates, and mild venous beading indicates moderate NPDR. Severe NPDR would require more extensive hemorrhages, venous beading in 2+ quadrants, or IRMA, while PDR would show neovascularization.",
          },
          {
            id: 2,
            text: "What OCT finding is most consistent with diabetic macular edema in this patient?",
            options: [
              { id: "A", text: "Epiretinal membrane" },
              { id: "B", text: "Cystoid spaces and increased retinal thickness" },
              { id: "C", text: "Drusen" },
              { id: "D", text: "Vitreomacular traction" },
            ],
            correctAnswer: "B",
            explanation:
              "Cystoid spaces and increased retinal thickness (310μm OD and 375μm OS) are characteristic OCT findings in diabetic macular edema. Normal central retinal thickness is approximately 250μm.",
          },
          {
            id: 3,
            text: "What is the first-line treatment for center-involving diabetic macular edema?",
            options: [
              { id: "A", text: "Observation" },
              { id: "B", text: "Focal laser photocoagulation" },
              { id: "C", text: "Intravitreal anti-VEGF injections" },
              { id: "D", text: "Topical NSAIDs" },
            ],
            correctAnswer: "C",
            explanation:
              "Intravitreal anti-VEGF injections are the first-line treatment for center-involving DME based on multiple clinical trials showing superior visual outcomes compared to laser photocoagulation.",
          },
        ],
      }

      setQuiz(fallbackQuiz)
      setIsGeneratingQuiz(false)
      setAnswers({})
      setSubmitted(false)

      toast({
        title: "Using Fallback Quiz",
        description: "Could not connect to AI service. Using a pre-defined quiz instead.",
        variant: "destructive",
      })
    }
  }

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    })
  }

  const handleSubmitAnswers = () => {
    setSubmitted(true)

    // Calculate score
    const correctAnswers = quiz.questions.filter((q: any) => answers[q.id] === q.correctAnswer).length

    toast({
      title: "Quiz Submitted",
      description: `You scored ${correctAnswers} out of ${quiz.questions.length} (${Math.round((correctAnswers / quiz.questions.length) * 100)}%)`,
    })
  }

  // Wrap the entire component return with AuthRequired
  return (
    <AuthRequired
      requireAuth={true}
      requireAIAccess={true}
      fallback={
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" asChild className="h-8 w-8">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to Dashboard</span>
                </Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Practice Quizzes (Preview)</h1>
            </div>
            <p className="text-muted-foreground">Test your knowledge with AI-generated quizzes on optometry topics</p>
            <div className="flex justify-between items-center">
              <p>This is a premium feature that requires an upgraded account.</p>
              <Badge
                variant="outline"
                className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50"
              >
                Premium Feature
              </Badge>
            </div>

            <Card className="bg-gradient-to-br from-background to-muted/30 border shadow-md">
              <CardHeader>
                <CardTitle>Sample Quiz: Diabetic Retinopathy</CardTitle>
                <CardDescription>This is a sample quiz. Upgrade to generate custom quizzes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {sampleData.quiz.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-medium">
                      {index + 1}. {question.question}
                    </h3>
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-2 rounded-md border p-2 hover:bg-muted/50 transition-colors"
                        >
                          <RadioGroupItem value={option.id} id={`q${index}-option${option.id}`} disabled />
                          <Label htmlFor={`q${index}-option${option.id}`} className="flex-1 cursor-pointer">
                            <span className="font-medium mr-2">{option.id}.</span> {option.text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild>
                  <Link href="/account">Upgrade to Premium</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      }
    >
      {/* Original component content */}
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild className="h-8 w-8">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Dashboard</span>
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Practice Quizzes</h1>
          </div>
          <p className="text-muted-foreground">Test your knowledge with AI-generated quizzes on optometry topics</p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card className="bg-gradient-to-br from-background to-muted/30 border shadow-md">
                <CardHeader>
                  <CardTitle>Generate Quiz</CardTitle>
                  <CardDescription>Customize your quiz parameters</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleQuizGeneration} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="quiz-topic">Quiz Topic</Label>
                      <Input
                        id="quiz-topic"
                        placeholder="e.g., Glaucoma, Contact Lenses"
                        value={quizTopic}
                        onChange={(e) => setQuizTopic(e.target.value)}
                        className="border-primary/20 focus-visible:ring-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quiz-difficulty">Difficulty</Label>
                      <Select value={quizDifficulty} onValueChange={setQuizDifficulty}>
                        <SelectTrigger id="quiz-difficulty" className="border-primary/20 focus:ring-primary/50">
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
                        <SelectTrigger id="quiz-questions" className="border-primary/20 focus:ring-primary/50">
                          <SelectValue placeholder="Select number" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 Questions</SelectItem>
                          <SelectItem value="5">5 Questions</SelectItem>
                          <SelectItem value="10">10 Questions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleQuizGeneration}
                    disabled={isGeneratingQuiz}
                    className="w-full bg-primary/90 hover:bg-primary transition-colors"
                  >
                    {isGeneratingQuiz ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileQuestion className="mr-2 h-4 w-4 text-blue-500" />
                        Generate Quiz
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="md:col-span-2">
              {quiz ? (
                <Card className="bg-gradient-to-br from-background to-muted/30 border shadow-md">
                  <CardHeader>
                    <CardTitle>{quiz.title}</CardTitle>
                    <CardDescription>
                      {submitted ? "Review your answers below" : "Answer all questions and submit to see results"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {quiz.questions.map((question: any) => (
                      <div key={question.id} className="space-y-2">
                        <h3 className="font-medium">
                          {question.id}. {question.text}
                        </h3>
                        <RadioGroup
                          value={answers[question.id]}
                          onValueChange={(value) => handleAnswerChange(question.id, value)}
                          disabled={submitted}
                          className="space-y-2"
                        >
                          {question.options.map((option: any) => (
                            <div
                              key={option.id}
                              className="flex items-center space-x-2 rounded-md border p-2 hover:bg-muted/50 transition-colors"
                            >
                              <RadioGroupItem value={option.id} id={`q${question.id}-option${option.id}`} />
                              <Label htmlFor={`q${question.id}-option${option.id}`} className="flex-1 cursor-pointer">
                                <span className="font-medium mr-2">{option.id}.</span> {option.text}
                              </Label>
                              {submitted && option.id === question.correctAnswer && (
                                <Badge variant="default" className="ml-2 bg-green-600">
                                  Correct
                                </Badge>
                              )}
                              {submitted &&
                                answers[question.id] === option.id &&
                                option.id !== question.correctAnswer && (
                                  <Badge variant="outline" className="ml-2 border-red-500 text-red-500">
                                    Incorrect
                                  </Badge>
                                )}
                            </div>
                          ))}
                        </RadioGroup>

                        {submitted && (
                          <div className="mt-2 p-3 bg-muted/50 rounded-md">
                            <p className="text-xs font-medium">Explanation:</p>
                            <p className="text-xs mt-1">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="flex justify-between flex-col sm:flex-row gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQuiz(null)
                        setSubmitted(false)
                        setAnswers({})
                      }}
                      className="border-primary/20 hover:bg-primary/10 transition-colors"
                    >
                      New Quiz
                    </Button>
                    {!submitted ? (
                      <Button
                        onClick={handleSubmitAnswers}
                        disabled={Object.keys(answers).length < quiz.questions.length}
                        className="bg-primary/90 hover:bg-primary transition-colors"
                      >
                        Submit Answers
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Score:</span>
                        <span className="text-sm font-bold">
                          {quiz.questions.filter((q: any) => answers[q.id] === q.correctAnswer).length} /{" "}
                          {quiz.questions.length}
                        </span>
                        <Progress
                          value={
                            (quiz.questions.filter((q: any) => answers[q.id] === q.correctAnswer).length /
                              quiz.questions.length) *
                            100
                          }
                          className="w-32 h-2 bg-muted"
                        />
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gradient-to-br from-background to-muted/30 border shadow-md rounded-lg">
                  <FileQuestion className="h-16 w-16 text-primary/70 mb-4" />
                  <h3 className="text-xl font-medium">No Active Quiz</h3>
                  <p className="text-muted-foreground mt-2 text-center max-w-md">
                    Generate a new quiz using the form on the left to test your knowledge on optometry topics
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthRequired>
  )
}

