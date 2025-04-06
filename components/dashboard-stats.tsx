import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MessageSquare, FlaskRoundIcon as Flask, FileText, BookOpen } from "lucide-react"

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-gradient-to-br from-background to-muted/50 border shadow-md hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle>Study Progress</CardTitle>
          <CardDescription>Current semester</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Ocular Anatomy</div>
              <div className="text-sm text-muted-foreground">85%</div>
            </div>
            <Progress value={85} className="h-2 bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Clinical Procedures</div>
              <div className="text-sm text-muted-foreground">72%</div>
            </div>
            <Progress value={72} className="h-2 bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Optics & Refraction</div>
              <div className="text-sm text-muted-foreground">63%</div>
            </div>
            <Progress value={63} className="h-2 bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Pharmacology</div>
              <div className="text-sm text-muted-foreground">45%</div>
            </div>
            <Progress value={45} className="h-2 bg-muted" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-background to-muted/50 border shadow-md hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="mt-1 rounded-full bg-primary/10 p-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">AI Assistant Session</p>
              <p className="text-xs text-muted-foreground">Discussed corneal topography</p>
            </div>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
          <div className="flex items-start gap-4">
            <div className="mt-1 rounded-full bg-primary/10 p-2">
              <Flask className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Case Study Completed</p>
              <p className="text-xs text-muted-foreground">Diabetic retinopathy assessment</p>
            </div>
            <p className="text-xs text-muted-foreground">Yesterday</p>
          </div>
          <div className="flex items-start gap-4">
            <div className="mt-1 rounded-full bg-primary/10 p-2">
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Note Created</p>
              <p className="text-xs text-muted-foreground">Binocular vision disorders</p>
            </div>
            <p className="text-xs text-muted-foreground">2 days ago</p>
          </div>
          <div className="flex items-start gap-4">
            <div className="mt-1 rounded-full bg-primary/10 p-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Quiz Completed</p>
              <p className="text-xs text-muted-foreground">Glaucoma classification (85%)</p>
            </div>
            <p className="text-xs text-muted-foreground">3 days ago</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-background to-muted/50 border shadow-md hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
          <CardDescription>Next 7 days</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Clinical Procedures Quiz</p>
              <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
            </div>
            <div className="text-xs font-medium text-red-500">High Priority</div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Ocular Anatomy Assignment</p>
              <p className="text-xs text-muted-foreground">In 3 days</p>
            </div>
            <div className="text-xs font-medium text-amber-500">Medium Priority</div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Pharmacology Lab Report</p>
              <p className="text-xs text-muted-foreground">In 5 days</p>
            </div>
            <div className="text-xs font-medium text-amber-500">Medium Priority</div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Optics Study Group</p>
              <p className="text-xs text-muted-foreground">In 6 days, 4:00 PM</p>
            </div>
            <div className="text-xs font-medium text-green-500">Low Priority</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

