import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, FlaskRoundIcon as Flask } from "lucide-react"
import Link from "next/link"

export function StudyRecommendations() {
  const recommendations = [
    {
      id: 1,
      title: "Review Ocular Anatomy",
      description: "Focus on the anterior segment structures",
      type: "syllabus",
      icon: BookOpen,
      link: "/syllabus/ocular-anatomy",
      reason: "Based on your upcoming quiz",
    },
    {
      id: 2,
      title: "Practice Diabetic Retinopathy Cases",
      description: "Generate case studies with varying severity levels",
      type: "case",
      icon: Flask,
      link: "/case-studies/generate?condition=diabetic-retinopathy",
      reason: "Weak area identified in your assessments",
    },
    {
      id: 3,
      title: "Complete Pharmacology Notes",
      description: "Anti-glaucoma medications section needs completion",
      type: "notes",
      icon: FileText,
      link: "/notes/pharmacology",
      reason: "Only 45% complete for this subject",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {recommendations.map((rec) => (
        <Card key={rec.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <rec.icon className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">{rec.title}</CardTitle>
            </div>
            <CardDescription>{rec.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Why:</span> {rec.reason}
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={rec.link}>Start Now</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

