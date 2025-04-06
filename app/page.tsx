"use client"

import type React from "react"

import { useState } from "react"
import { StudyTools } from "@/components/study-tools"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpCircle, BookOpen, Brain, FileText, Lightbulb, MessageSquare, Rocket, Users } from "lucide-react"
import { QuickAnswer } from "@/components/quick-answer"

export default function Home() {
  const [quickQuestion, setQuickQuestion] = useState("")
  const [showQuickAnswer, setShowQuickAnswer] = useState(false)

  const handleQuickQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (quickQuestion.trim()) {
      setShowQuickAnswer(true)
    }
  }

  return (
    <main className="container mx-auto p-4 md:p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Focus.AI</h1>
        <p className="text-muted-foreground">Your AI-powered learning companion for optometry studies</p>
      </div>

      {/* Quick Question Box */}
      <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            Quick Question
          </CardTitle>
          <CardDescription>Get instant answers to your optometry questions</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleQuickQuestion} className="flex gap-2">
            <Input
              placeholder="Ask anything about optometry..."
              value={quickQuestion}
              onChange={(e) => setQuickQuestion(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!quickQuestion.trim()}>
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Ask
            </Button>
          </form>
        </CardContent>
      </Card>

      <StudyTools />

      <div className="mt-12 space-y-6 border-t pt-8">
        <h2 className="text-2xl font-bold tracking-tight">Focus.AI – My AI Study Assistant</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border shadow-md hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Brain className="h-5 w-5 text-blue-500" />
                </div>
                <CardTitle>Introduction</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Focus.AI is my AI-powered study assistant I first made just for myself to study easily, especially
                optometry subjects, but now it's in beta and I'm adding more updates. Right now it's limited to few
                users to keep it cost effective.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border shadow-md hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-green-500/10">
                  <Lightbulb className="h-5 w-5 text-green-500" />
                </div>
                <CardTitle>Why I Made It</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>
                  In <strong>first semester</strong> I was struggling with General Anatomy and Physiology so I used
                  ChatGPT, but it gave too much info and wasn't really helpful.
                </li>
                <li>
                  <strong>Second semester</strong> Ocular Anatomy and Physiology was even harder because syllabus got
                  changed and only limited faculty were there, it made my head burst to understand concepts.
                </li>
                <li>
                  So I started copy pasting textbook content using Google Lens scanner then asked GPT to convert it into
                  points but that process itself wasted hours of my time.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border shadow-md hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-purple-500/10">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <CardTitle>What Others Said</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>
                  <strong>Thirumalai</strong> said she struggles to understand key topics
                </li>
                <li>
                  <strong>Shobana</strong> said she can understand but can't make proper notes and liked how I make
                  notes
                </li>
                <li>
                  <strong>CS Dharsini</strong> said my notes are way easier than textbooks
                </li>
              </ul>
              <p className="text-sm mt-2">So I felt like I'm not alone and others also need something better</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border shadow-md hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-amber-500/10">
                  <FileText className="h-5 w-5 text-amber-500" />
                </div>
                <CardTitle>Building Focus.AI</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>
                  I started working on it around <strong>October 2024</strong> as Focus Notes then slowly added AI
                  features
                </li>
                <li>
                  In <strong>November</strong> I gave beta access to Shobana and Thirumalai
                </li>
                <li>
                  On <strong>November 10</strong> I renamed it to Focus.AI
                </li>
                <li>Then added Markdown export and kept testing with them till now</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/5 to-red-500/10 border shadow-md hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-red-500/10">
                  <BookOpen className="h-5 w-5 text-red-500" />
                </div>
                <CardTitle>How I Trained It</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                I used <strong>Google Colab</strong> to train the AI with optometry datasets because I couldn't afford
                GPU and still wanted a model that gives only relevant simple notes without distractions.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border shadow-md hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Rocket className="h-5 w-5 text-blue-500" />
                </div>
                <CardTitle>What's Next</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Still working on it</li>
                <li>
                  Soon planning to add <strong>voice tutoring</strong> and <strong>personalized study tips</strong>
                </li>
                <li>After that I'll expand it for other students also, not just optometry</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border shadow-md hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-purple-500/10">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <CardTitle>Thanks</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Thanks to <strong>Thirumalai</strong>, <strong>Shobana</strong>, and <strong>CS Dharsini</strong> for
                testing and giving proper feedback.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border shadow-md hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-green-500/10">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <CardTitle>Contact</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Mail – <code className="bg-muted px-1.5 py-0.5 rounded">iamsirenjeev@gmail.com</code>
              </p>
              <p className="text-sm mt-1">
                UPI to support – <code className="bg-muted px-1.5 py-0.5 rounded">iamsirenjeev@oksbi</code>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Answer Dialog */}
      {showQuickAnswer && (
        <QuickAnswer
          question={quickQuestion}
          onClose={() => {
            setShowQuickAnswer(false)
            setQuickQuestion("")
          }}
        />
      )}
    </main>
  )
}

