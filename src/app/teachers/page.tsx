"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { columns, Teacher } from "@/components/teachers/columns"

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const response = await fetch('/api/teachers')
        if (!response.ok) {
          throw new Error('Failed to fetch teachers')
        }
        const data = await response.json()
        setTeachers(data.teachers)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchTeachers()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
            <p className="text-muted-foreground">Manage your teaching staff</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading teachers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
            <p className="text-muted-foreground">Manage your teaching staff</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground">
            Manage your teaching staff and their portal access
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      </div>
      <DataTable columns={columns} data={teachers} />
    </div>
  )
}