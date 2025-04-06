import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, MessageSquare, GraduationCap } from "lucide-react"

export function StudyTools() {
  const tools = [
    {
      title: "AI Assistant",
      description: "Get instant answers to your optometry questions",
      icon: MessageSquare,
      color: "text-blue-500",
      link: "/assistant",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Study Notes",
      description: "Create and organize your study materials",
      icon: FileText,
      color: "text-green-500",
      link: "/notes",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Quiz Generator",
      description: "Test your knowledge with interactive quizzes",
      icon: BookOpen,
      color: "text-red-500",
      link: "/quizzes",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Academics",
      description: "Access your academic resources and syllabus",
      icon: GraduationCap,
      color: "text-purple-500",
      link: "/academics",
      bgColor: "bg-purple-500/10",
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Study Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Card key={tool.title} className="overflow-hidden border border-border/40 transition-all hover:shadow-md">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-md ${tool.bgColor}`}>
                  <tool.icon className={`h-5 w-5 ${tool.color}`} />
                </div>
                <CardTitle className="text-lg">{tool.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <CardDescription>{tool.description}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={tool.link}>Open {tool.title}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

