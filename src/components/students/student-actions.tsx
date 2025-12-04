"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Student } from "./columns"
import { ProgressiveDeletionDialog } from "@/components/deletion/progressive-deletion-dialog"
import { toast } from "sonner"
import { StudentDialog } from "./create-student-dialog"
import { ViewStudentDetailsDialog } from "./view-student-details-dialog"

interface StudentActionsProps {
  student: Student
  onUpdate?: () => void
  isAdmin?: boolean
}

export function StudentActions({ student, onUpdate, isAdmin = false }: StudentActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [relatedRecords, setRelatedRecords] = useState<Array<{ type: string; count: number }>>([])

  const fetchRelatedRecords = async () => {
    try {
      const response = await fetch(`/api/students/${student.id}/related-records`)
      if (response.ok) {
        const data = await response.json()
        setRelatedRecords(data.records || [])
      }
    } catch (error) {
      console.error('Failed to fetch related records:', error)
    }
  }

  const handleDeleteClick = async () => {
    await fetchRelatedRecords()
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async (options: { type: 'SOFT_DELETE' | 'HARD_DELETE' | 'REASSIGN'; deleteReason?: string; reassignTo?: string; cascade?: boolean }) => {
    setIsDeleting(true)
    try {
      const params = new URLSearchParams()
      
      if (options.type === 'HARD_DELETE') {
        params.append('cascade', 'true')
      }
      
      if (options.deleteReason) {
        params.append('deleteReason', options.deleteReason)
      }

      const response = await fetch(`/api/students/${student.id}?${params.toString()}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete student")
      }

      const successMessage = options.type === 'HARD_DELETE'
        ? "Student permanently deleted!"
        : "Student archived successfully!"
      
      toast.success(successMessage, {
        description: `${student.firstName} ${student.lastName} has been ${options.type === 'HARD_DELETE' ? 'permanently deleted' : 'archived'}.`,
      })
      setDeleteDialogOpen(false)
      onUpdate?.()
    } catch (err) {
      toast.error("Failed to delete student", {
        description: err instanceof Error ? err.message : "An error occurred",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="p-0"
          >
            <ViewStudentDetailsDialog student={student} />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(student.id)
                toast.success("Copied student ID", { description: student.id })
              } catch (err) {
                toast.error("Failed to copy student ID", {
                  description: err instanceof Error ? err.message : String(err),
                })
              }
            }}
          >
            Copy student ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <StudentDialog
            student={student}
            onSuccess={onUpdate}
            trigger={
              <Button variant="ghost" className="w-full justify-start p-2 h-auto font-normal">
                <Pencil className="mr-2 h-4 w-4" />
                Edit student
              </Button>
            }
          />
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete student
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ProgressiveDeletionDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        entityType="student"
        entityName={`${student.firstName} ${student.lastName}`}
        entityId={student.id}
        relatedRecords={relatedRecords}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  )
}
