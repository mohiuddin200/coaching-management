"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, CheckCircle2, Search, UserCheck } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Student {
  id: string
  firstName: string
  lastName: string
  phoneNumber?: string
  parentPhone: string
  level?: {
    id: string
    name: string
  }
}

interface Level {
  id: string
  name: string
  levelNumber: number
}

interface ClassSection {
  id: string
  name: string
  subject: {
    name: string
  }
}

type AttendanceStatus = "present" | "absent"

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [classSections, setClassSections] = useState<ClassSection[]>([])
  const [selectedLevel, setSelectedLevel] = useState<string>("")
  const [selectedClassSection, setSelectedClassSection] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [attendance, setAttendance] = useState<Map<string, AttendanceStatus>>(
    new Map()
  )
  const [loading, setLoading] = useState(true)
  const [loadingClassSections, setLoadingClassSections] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const debounceTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Fetch initial levels
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        setLoading(true)
        const levelsRes = await fetch("/api/levels")
        const levelsData = await levelsRes.json()
        console.log(levelsData)
        if (!levelsRes.ok) {
          throw new Error(levelsData.error || "Failed to fetch levels")
        }
        setLevels(levelsData || [])
      } catch (error) {
        console.error("Error fetching levels:", error)
        toast.error("Failed to load levels")
      } finally {
        setLoading(false)
      }
    }
    fetchLevels()
  }, [])

  // Fetch class sections when level changes
  useEffect(() => {
    if (!selectedLevel) {
      setClassSections([])
      setSelectedClassSection("")
      setStudents([])
      return
    }

    const fetchClassSections = async () => {
      setLoadingClassSections(true)
      try {
        const res = await fetch(
          `/api/class-sections?levelId=${selectedLevel}`
        )
        const data = await res.json()
        setClassSections(data || [])
      } catch (error) {
        console.error("Error fetching class sections:", error)
        toast.error("Failed to load class sections")
      } finally {
        setLoadingClassSections(false)
      }
    }
    fetchClassSections()
  }, [selectedLevel])

  // Fetch students when class section changes
  useEffect(() => {
    if (!selectedClassSection) {
      setStudents([])
      return
    }

    const fetchStudents = async () => {
      setLoadingStudents(true)
      try {
        const res = await fetch(
          `/api/class-sections/${selectedClassSection}/students`
        )
        const data = await res.json()
        setStudents(data.students || [])
      } catch (error) {
        console.error("Error fetching students:", error)
        toast.error("Failed to load students")
      } finally {
        setLoadingStudents(false)
      }
    }
    fetchStudents()
  }, [selectedClassSection])

  // Filter students based on search query
  useEffect(() => {
    let filtered = students
    if (searchQuery) {
      filtered = filtered.filter(student => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
        return fullName.includes(searchQuery.toLowerCase())
      })
    }
    setFilteredStudents(filtered)
  }, [students, searchQuery])

  // Fetch attendance records when date or class section changes
  useEffect(() => {
    if (!selectedClassSection || !selectedDate) {
      setAttendance(new Map())
      return
    }

    const fetchAttendance = async () => {
      try {
        const dateString = selectedDate.toISOString().split("T")[0]
        const res = await fetch(
          `/api/attendance?classSectionId=${selectedClassSection}&date=${dateString}`
        )
        const data = await res.json()
        if (res.ok) {
          const attendanceMap = new Map<string, AttendanceStatus>()
          for (const record of data) {
            attendanceMap.set(record.studentId, record.status.toLowerCase() as AttendanceStatus)
          }
          setAttendance(attendanceMap)
        } else {
          throw new Error(data.error || "Failed to fetch attendance")
        }
      } catch (error) {
        console.error("Error fetching attendance:", error)
        toast.error("Failed to load attendance records.")
      }
    }

    fetchAttendance()
  }, [selectedClassSection, selectedDate])

  const saveAttendance = useCallback(
    async (
      studentId: string,
      status: "Present" | "Absent",
      date: Date,
      classSectionId: string
    ) => {
      if (!classSectionId) {
        toast.error("Please select a class section first.")
        return
      }

      try {
        const response = await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            classSectionId,
            date: date.toISOString(),
            status,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to save attendance")
        }

        toast.success(`Attendance for student saved.`)
      } catch (error) {
        console.error("Error saving attendance:", error)
        toast.error("Failed to save attendance.")
        // TODO: Implement state reversal on API failure.
      }
    },
    []
  )

  const handleAttendanceChange = useCallback(
    (studentId: string, newStatus: AttendanceStatus) => {
      setAttendance(prev => {
        const newMap = new Map(prev)
        const currentStatus = newMap.get(studentId)
        let finalStatus: AttendanceStatus | "unset" = newStatus

        if (currentStatus === newStatus) {
          newMap.delete(studentId)
          finalStatus = "unset"
        } else {
          newMap.set(studentId, newStatus)
        }

        if (debounceTimeouts.current.has(studentId)) {
          clearTimeout(debounceTimeouts.current.get(studentId)!)
        }

        const timeoutId = setTimeout(() => {
          if (finalStatus !== "unset") {
            saveAttendance(
              studentId,
              finalStatus.charAt(0).toUpperCase() + finalStatus.slice(1) as "Present" | "Absent",
              selectedDate,
              selectedClassSection
            )
          }
          // TODO: Handle 'unset' case - maybe a DELETE request to the API
          debounceTimeouts.current.delete(studentId)
        }, 1000)

        debounceTimeouts.current.set(studentId, timeoutId)

        return newMap
      })
    },
    [selectedDate, selectedClassSection, saveAttendance]
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  const presentCount = Array.from(attendance.values()).filter(
    s => s === "present"
  ).length
  const absentCount = Array.from(attendance.values()).filter(
    s => s === "absent"
  ).length

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mark Attendance</h1>
            <p className="text-muted-foreground">
              Mark daily attendance for students individually. Changes are saved
              automatically.
            </p>
          </div>
          <UserCheck className="h-8 w-8 text-primary" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Details</CardTitle>
            <CardDescription>
              Select a date, level, and class section to mark attendance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={date => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Select Level</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map(level => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Class Section</Label>
                <Select
                  value={selectedClassSection}
                  onValueChange={setSelectedClassSection}
                  disabled={!selectedLevel || loadingClassSections}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Class Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingClassSections ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      classSections.map(section => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.subject.name} - {section.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Search Student</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8"
                    disabled={!selectedClassSection}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {filteredStudents.length} student(s) • {presentCount}{" "}
                present • {absentCount} absent
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>
              {selectedClassSection
                ? "Mark students as present or absent."
                : "Select a class section to see the student list."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStudents ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading students...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {selectedClassSection
                  ? "No students found for this class section."
                  : "No class section selected."}
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredStudents.map(student => {
                  const status = attendance.get(student.id)
                  return (
                    <div
                      key={student.id}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                        status === "present" &&
                          "bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-800",
                        status === "absent" &&
                          "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-800"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {student.firstName} {student.lastName}
                          </p>
                          {status === "present" && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {student.level && (
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                              {student.level.name}
                            </span>
                          )}
                          <span>{student.parentPhone}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={status === "present" ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            handleAttendanceChange(student.id, "present")
                          }
                          className={cn({
                            "bg-green-600 hover:bg-green-700 text-white":
                              status === "present",
                          })}
                        >
                          Present
                        </Button>
                        <Button
                          variant={status === "absent" ? "destructive" : "outline"}
                          size="sm"
                          onClick={() =>
                            handleAttendanceChange(student.id, "absent")
                          }
                        >
                          Absent
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}