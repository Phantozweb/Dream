import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, FlaskRoundIcon as Flask, MessageSquare } from "lucide-react"

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "assistant",
      title: "AI Assistant Session",
      description: "Discussed corneal topography and keratoconus diagnosis",
      time: "Today, 2:45 PM",
      icon: MessageSquare,
    },
    {
      id: 2,
      type: "case",
      title: "Case Study Completed",
      description: "Diabetic retinopathy assessment and management",
      time: "Today, 11:20 AM",
      icon: Flask,
    },
    {
      id: 3,
      type: "note",
      title: "Note Created",
      description: "Binocular vision disorders and treatment approaches",
      time: "Yesterday, 4:30 PM",
      icon: FileText,
    },
    {
      id: 4,
      type: "syllabus",
      title: "Syllabus Progress",
      description: "Completed Unit 3: Contact Lens Fitting",
      time: "Yesterday, 2:15 PM",
      icon: BookOpen,
    },
    {
      id: 5,
      type: "assistant",
      title: "AI Assistant Session",
      description: "Generated quiz on glaucoma classification",
      time: "2 days ago, 10:05 AM",
      icon: MessageSquare,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest interactions with Focus.AI</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <div className="mt-1 rounded-full bg-blue-100 p-2">
                <activity.icon className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

