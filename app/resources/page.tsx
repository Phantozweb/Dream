"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, ExternalLink, FileText, Search, Video } from "lucide-react"

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [resourceType, setResourceType] = useState("")
  const [subject, setSubject] = useState("")

  // Mock resources data
  const resources = [
    {
      id: "res1",
      title: "Clinical Procedures in Primary Eye Care",
      author: "David B. Elliott",
      type: "textbook",
      subject: "Clinical Procedures",
      description:
        "A comprehensive guide to clinical procedures in optometry practice, covering all essential examination techniques.",
      url: "#",
      year: "2021",
      tags: ["clinical", "procedures", "examination"],
    },
    {
      id: "res2",
      title: "Anterior Segment OCT Interpretation",
      author: "Dr. Sarah Johnson",
      type: "video",
      subject: "Imaging",
      description:
        "A detailed tutorial on interpreting anterior segment OCT scans for various corneal and anterior chamber conditions.",
      url: "#",
      duration: "45 minutes",
      tags: ["OCT", "anterior segment", "imaging"],
    },
    {
      id: "res3",
      title: "Contact Lens Spectrum: Scleral Lens Fitting Guide",
      author: "Contact Lens Spectrum Journal",
      type: "article",
      subject: "Contact Lenses",
      description: "A comprehensive guide to fitting scleral lenses for irregular corneas and ocular surface disease.",
      url: "#",
      date: "January 2023",
      tags: ["scleral lens", "contact lens", "fitting"],
    },
    {
      id: "res4",
      title: "Glaucoma: Diagnosis and Management",
      author: "American Academy of Optometry",
      type: "textbook",
      subject: "Ocular Disease",
      description: "Evidence-based approaches to glaucoma diagnosis, treatment, and management in clinical practice.",
      url: "#",
      year: "2022",
      tags: ["glaucoma", "diagnosis", "management"],
    },
    {
      id: "res5",
      title: "Binocular Vision Assessment Techniques",
      author: "Dr. Michael Chen",
      type: "video",
      subject: "Binocular Vision",
      description:
        "Step-by-step demonstration of binocular vision assessment techniques for various vergence and accommodative disorders.",
      url: "#",
      duration: "60 minutes",
      tags: ["binocular vision", "assessment", "vergence"],
    },
    {
      id: "res6",
      title: "Advances in Myopia Control: Current Evidence",
      author: "Journal of Optometry",
      type: "article",
      subject: "Pediatric Optometry",
      description:
        "A review of current evidence for various myopia control interventions, including orthokeratology, atropine, and multifocal lenses.",
      url: "#",
      date: "March 2023",
      tags: ["myopia control", "pediatric", "evidence"],
    },
  ]

  const subjects = [
    "Clinical Procedures",
    "Imaging",
    "Contact Lenses",
    "Ocular Disease",
    "Binocular Vision",
    "Pediatric Optometry",
    "All Subjects",
  ]

  const resourceTypes = ["textbook", "video", "article", "All Types"]

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = searchQuery
      ? resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      : true

    const matchesType =
      resourceType && resourceType !== "All Types" ? resource.type === resourceType.toLowerCase() : true

    const matchesSubject = subject && subject !== "All Subjects" ? resource.subject === subject : true

    return matchesSearch && matchesType && matchesSubject
  })

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "textbook":
        return <BookOpen className="h-5 w-5" />
      case "video":
        return <Video className="h-5 w-5" />
      case "article":
        return <FileText className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Optometry Resources</h1>
          <p className="text-muted-foreground">
            Access textbooks, videos, articles, and research papers for your studies
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Resource Library</CardTitle>
            <CardDescription>Browse and search through our curated collection of optometry resources</CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={resourceType} onValueChange={setResourceType}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subj) => (
                    <SelectItem key={subj} value={subj}>
                      {subj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="grid" className="space-y-4">
              <TabsList className="grid w-40 grid-cols-2">
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="space-y-4">
                {filteredResources.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-8">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No resources found</h3>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredResources.map((resource) => (
                      <Card key={resource.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex items-start gap-2">
                            <div className="mt-1 rounded-full bg-primary/10 p-1 text-primary">
                              {getResourceIcon(resource.type)}
                            </div>
                            <div>
                              <CardTitle className="text-base">{resource.title}</CardTitle>
                              <CardDescription>{resource.author}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {resource.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <div className="text-xs text-muted-foreground">
                            {resource.type === "textbook" && `Published: ${resource.year}`}
                            {resource.type === "video" && `Duration: ${resource.duration}`}
                            {resource.type === "article" && `Published: ${resource.date}`}
                          </div>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            Access
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="list" className="space-y-4">
                {filteredResources.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-8">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No resources found</h3>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredResources.map((resource) => (
                      <Card key={resource.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="p-4 md:w-3/4">
                            <div className="flex items-start gap-2">
                              <div className="mt-1 rounded-full bg-primary/10 p-1 text-primary">
                                {getResourceIcon(resource.type)}
                              </div>
                              <div>
                                <h3 className="text-base font-medium">{resource.title}</h3>
                                <p className="text-sm text-muted-foreground">{resource.author}</p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{resource.description}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {resource.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 border-t md:border-t-0 md:border-l md:w-1/4 flex flex-col justify-between">
                            <div className="text-xs text-muted-foreground">
                              {resource.type === "textbook" && `Published: ${resource.year}`}
                              {resource.type === "video" && `Duration: ${resource.duration}`}
                              {resource.type === "article" && `Published: ${resource.date}`}
                            </div>
                            <Button size="sm" className="mt-4">
                              <ExternalLink className="h-3.5 w-3.5 mr-1" />
                              Access Resource
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Popular Textbooks</CardTitle>
              <CardDescription>Most accessed textbooks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resources
                .filter((r) => r.type === "textbook")
                .slice(0, 3)
                .map((resource) => (
                  <div key={resource.id} className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{resource.title}</p>
                      <p className="text-xs text-muted-foreground">{resource.author}</p>
                    </div>
                  </div>
                ))}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setResourceType("textbook")
                  setSubject("")
                  setSearchQuery("")
                }}
              >
                View All Textbooks
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Latest Videos</CardTitle>
              <CardDescription>Recently added video tutorials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resources
                .filter((r) => r.type === "video")
                .slice(0, 3)
                .map((resource) => (
                  <div key={resource.id} className="flex items-start gap-3">
                    <Video className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{resource.title}</p>
                      <p className="text-xs text-muted-foreground">{resource.duration}</p>
                    </div>
                  </div>
                ))}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setResourceType("video")
                  setSubject("")
                  setSearchQuery("")
                }}
              >
                View All Videos
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Articles</CardTitle>
              <CardDescription>Latest research and publications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resources
                .filter((r) => r.type === "article")
                .slice(0, 3)
                .map((resource) => (
                  <div key={resource.id} className="flex items-start gap-3">
                    <FileText className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{resource.title}</p>
                      <p className="text-xs text-muted-foreground">{resource.date}</p>
                    </div>
                  </div>
                ))}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setResourceType("article")
                  setSubject("")
                  setSearchQuery("")
                }}
              >
                View All Articles
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

