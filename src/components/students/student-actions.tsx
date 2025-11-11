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
import { ConfirmationDialog } from "@/components/confirmation-dialog"
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

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete student")
      }

      toast.success("Student deleted successfully!", {
        description: `${student.firstName} ${student.lastName} has been removed.`,
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
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete student
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Student"
        description={`Are you sure you want to delete ${student.firstName} ${student.lastName}? This action cannot be undone. All associated data will be permanently removed.`}
        onConfirm={handleDelete}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
      />
    </div>
  )
}
