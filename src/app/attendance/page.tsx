"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [attendance, setAttendance] = useState<Map<string, boolean>>(new Map())
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Fetch students and levels
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch students
        const studentsRes = await fetch('/api/students')
        const studentsData = await studentsRes.json()
        
        // Fetch levels
        const levelsRes = await fetch('/api/levels')
        const levelsData = await levelsRes.json()
        
        setStudents(studentsData.students || [])
        setFilteredStudents(studentsData.students || [])
        setLevels(levelsData.levels || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error("Failed to load students and levels")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter students based on level and search query
  useEffect(() => {
    let filtered = students

    // Filter by level
    if (selectedLevel !== "all") {
      filtered = filtered.filter(student => student.level?.id === selectedLevel)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(student => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
        return fullName.includes(searchQuery.toLowerCase())
      })
    }

    setFilteredStudents(filtered)
  }, [students, selectedLevel, searchQuery])

  // Toggle attendance for a student
  const toggleAttendance = (studentId: string) => {
    setAttendance(prev => {
      const newMap = new Map(prev)
      newMap.set(studentId, !newMap.get(studentId))
      return newMap
    })
  }

  // Mark all as present
  const markAllPresent = () => {
    const newMap = new Map<string, boolean>()
    filteredStudents.forEach(student => {
      newMap.set(student.id, true)
    })
    setAttendance(newMap)
  }

  // Clear all
  const clearAll = () => {
    setAttendance(new Map())
  }

  // Submit attendance
  const submitAttendance = async () => {
    try {
      setSubmitting(true)

      // Prepare attendance data for students marked as present
      const attendanceData = Array.from(attendance.entries())
        .filter(([, present]) => present)
        .map(([studentId]) => ({
          studentId,
          timestamp: selectedDate.toISOString(),
          entryType: 'Entry',
        }))

      if (attendanceData.length === 0) {
        toast.error("Please mark at least one student as present")
        return
      }

      // Submit bulk attendance
      const response = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attendanceData }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit attendance')
      }

      const result = await response.json()

      toast.success(`Attendance marked for ${result.count} student(s)`)

      // Clear attendance after successful submission
      setAttendance(new Map())
    } catch (error) {
      console.error('Error submitting attendance:', error)
      toast.error("Failed to submit attendance")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const presentCount = Array.from(attendance.values()).filter(p => p).length

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mark Attendance</h1>
            <p className="text-muted-foreground">
              Mark daily attendance for students
            </p>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Filters and Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Details</CardTitle>
            <CardDescription>Select date and filter students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Picker */}
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
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Level Filter */}
              <div className="space-y-2">
                <Label>Filter by Level</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {levels.map(level => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <Label>Search Student</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {filteredStudents.length} student(s) • {presentCount} marked present
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearAll} size="sm">
                  Clear All
                </Button>
                <Button variant="outline" onClick={markAllPresent} size="sm">
                  Mark All Present
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student List */}
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Select students present today</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students found
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredStudents.map(student => (
                  <div
                    key={student.id}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-accent",
                      attendance.get(student.id) && "bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-800"
                    )}
                    onClick={() => toggleAttendance(student.id)}
                  >
                    <Checkbox
                      checked={attendance.get(student.id) || false}
                      onCheckedChange={() => toggleAttendance(student.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                        {attendance.get(student.id) && (
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={submitAttendance}
            disabled={submitting || presentCount === 0}
            size="lg"
            className="min-w-[200px]"
          >
            {submitting ? "Submitting..." : `Submit Attendance (${presentCount})`}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
