"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { createColumns, Student } from "@/components/students/columns"
import { CreateStudentDialog } from "@/components/students/create-student-dialog"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { FullPaginationTable } from "@/components/table/FullPaginationTable"
import { useMemo } from "react"

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/students')
      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }
      const data = await response.json()
      setStudents(data.students)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkUserRole = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.role === 'Admin') {
        setIsAdmin(true)
      }
    }
    
    checkUserRole()
    fetchStudents()
  }, [])

  const columns = useMemo(() => createColumns(fetchStudents, isAdmin), [isAdmin])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Students</h1>
              <p className="text-muted-foreground">Manage your students</p>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading students...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Students</h1>
              <p className="text-muted-foreground">Manage your students</p>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <p className="text-red-500">Error: {error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">
              Manage your students and their information
            </p>
          </div>
          <CreateStudentDialog onStudentCreated={fetchStudents} />
        </div>
        <FullPaginationTable 
          columns={columns} 
          data={students}
          filterColumn="firstName"
        />
      </div>
    </DashboardLayout>
  )
}
