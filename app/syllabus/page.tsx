"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SyllabusPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedYear, setSelectedYear] = useState("1")
  const [selectedSemester, setSelectedSemester] = useState("1")

  // Mock syllabus data structure
  const syllabusData = {
    "1": {
      "1": [
        {
          id: "OPT101",
          title: "Introduction to Optometry",
          progress: 85,
          units: [
            {
              title: "Unit 1: History and Scope of Optometry",
              topics: [
                { id: "1.1", title: "Evolution of Optometry as a Profession", completed: true },
                { id: "1.2", title: "Scope of Practice and Legal Regulations", completed: true },
                { id: "1.3", title: "Optometry Education and Specializations", completed: false },
              ],
            },
            {
              title: "Unit 2: Optometric Examination Basics",
              topics: [
                { id: "2.1", title: "Patient History and Communication", completed: true },
                { id: "2.2", title: "Preliminary Testing Procedures", completed: true },
                { id: "2.3", title: "Documentation and Record Keeping", completed: true },
              ],
            },
          ],
        },
        {
          id: "OPT102",
          title: "Ocular Anatomy and Physiology I",
          progress: 70,
          units: [
            {
              title: "Unit 1: External Ocular Structures",
              topics: [
                { id: "1.1", title: "Eyelids and Lacrimal System", completed: true },
                { id: "1.2", title: "Conjunctiva and Sclera", completed: true },
                { id: "1.3", title: "Cornea: Structure and Function", completed: false },
              ],
            },
            {
              title: "Unit 2: Anterior Segment",
              topics: [
                { id: "2.1", title: "Anterior Chamber and Angle", completed: true },
                { id: "2.2", title: "Iris and Pupil", completed: true },
                { id: "2.3", title: "Crystalline Lens", completed: false },
              ],
            },
          ],
        },
        {
          id: "OPT103",
          title: "Geometric and Physical Optics",
          progress: 60,
          units: [
            {
              title: "Unit 1: Principles of Light",
              topics: [
                { id: "1.1", title: "Nature of Light and Electromagnetic Spectrum", completed: true },
                { id: "1.2", title: "Reflection and Refraction", completed: true },
                { id: "1.3", title: "Dispersion and Absorption", completed: false },
              ],
            },
            {
              title: "Unit 2: Optical Systems",
              topics: [
                { id: "2.1", title: "Lenses and Prisms", completed: true },
                { id: "2.2", title: "Mirrors and Aberrations", completed: false },
                { id: "2.3", title: "Optical Instruments", completed: false },
              ],
            },
          ],
        },
      ],
      "2": [
        {
          id: "OPT201",
          title: "Ocular Anatomy and Physiology II",
          progress: 40,
          units: [
            {
              title: "Unit 1: Posterior Segment",
              topics: [
                { id: "1.1", title: "Vitreous Humor", completed: true },
                { id: "1.2", title: "Retina: Structure and Function", completed: false },
                { id: "1.3", title: "Optic Nerve and Visual Pathway", completed: false },
              ],
            },
          ],
        },
      ],
    },
    "2": {
      "1": [
        {
          id: "OPT301",
          title: "Clinical Procedures I",
          progress: 30,
          units: [
            {
              title: "Unit 1: Refraction Techniques",
              topics: [
                { id: "1.1", title: "Retinoscopy", completed: true },
                { id: "1.2", title: "Subjective Refraction", completed: false },
                { id: "1.3", title: "Binocular Balance", completed: false },
              ],
            },
          ],
        },
      ],
    },
  }

  const handleTopicToggle = (topicId: string, completed: boolean) => {
    // In a real app, this would update the database
    console.log(`Topic ${topicId} marked as ${completed ? "completed" : "incomplete"}`)
  }

  const filteredSubjects = syllabusData[selectedYear]?.[selectedSemester] || []

  const searchedSubjects = searchQuery
    ? filteredSubjects.filter(
        (subject) =>
          subject.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.units.some(
            (unit) =>
              unit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              unit.topics.some((topic) => topic.title.toLowerCase().includes(searchQuery.toLowerCase())),
          ),
      )
    : filteredSubjects

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Optometry Syllabus</h1>
          <p className="text-muted-foreground">
            Browse the 4-year curriculum, track your progress, and manage your studies
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Filter Syllabus</CardTitle>
                <CardDescription>Select year and semester to view subjects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger id="year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                      <SelectItem value="4">Year 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger id="semester">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search topics..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Overall Progress</CardTitle>
                <CardDescription>Your progress through the curriculum</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Year 1</span>
                    <span className="text-sm text-muted-foreground">75%</span>
                  </div>
                  <Progress value={75} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Year 2</span>
                    <span className="text-sm text-muted-foreground">30%</span>
                  </div>
                  <Progress value={30} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Year 3</span>
                    <span className="text-sm text-muted-foreground">0%</span>
                  </div>
                  <Progress value={0} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Year 4</span>
                    <span className="text-sm text-muted-foreground">0%</span>
                  </div>
                  <Progress value={0} />
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Curriculum</span>
                    <span className="text-sm text-muted-foreground">26%</span>
                  </div>
                  <Progress value={26} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>
                  Year {selectedYear}, Semester {selectedSemester} Subjects
                </CardTitle>
                <CardDescription>{searchedSubjects.length} subjects found</CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100vh-300px)] overflow-y-auto">
                {searchedSubjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No subjects found</h3>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <Accordion type="multiple" className="space-y-4">
                    {searchedSubjects.map((subject) => (
                      <AccordionItem key={subject.id} value={subject.id} className="border rounded-lg px-2">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex flex-col items-start text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{subject.id}</span>
                              <span className="text-base font-semibold">{subject.title}</span>
                            </div>
                            <div className="w-full mt-2">
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>Progress</span>
                                <span>{subject.progress}%</span>
                              </div>
                              <Progress value={subject.progress} className="h-2" />
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 py-2">
                            {subject.units.map((unit, unitIndex) => (
                              <div key={unitIndex} className="space-y-2">
                                <h4 className="font-medium text-sm">{unit.title}</h4>
                                <div className="space-y-2 ml-4">
                                  {unit.topics.map((topic) => (
                                    <div key={topic.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`topic-${topic.id}`}
                                        checked={topic.completed}
                                        onCheckedChange={(checked) => handleTopicToggle(topic.id, checked as boolean)}
                                      />
                                      <Label
                                        htmlFor={`topic-${topic.id}`}
                                        className={`text-sm ${topic.completed ? "line-through text-muted-foreground" : ""}`}
                                      >
                                        {topic.title}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                            <div className="pt-2">
                              <Button variant="outline" size="sm" className="w-full">
                                View Detailed Content
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

