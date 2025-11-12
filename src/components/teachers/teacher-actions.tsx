"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ViewTeacherDetailsDialog } from "./view-teacher-details-dialog"
import { MoreHorizontal, Pencil, Mail, Trash2, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Teacher } from "./columns"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { toast } from "sonner"

interface TeacherActionsProps {
  teacher: Teacher
  onUpdate?: () => void
  isAdmin?: boolean
}

const teacherFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phoneNumber: z.string().min(1, "Phone number is required"),
  subject: z.string().optional(),
  qualifications: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
})

type TeacherFormValues = z.infer<typeof teacherFormSchema>

export function TeacherActions({ teacher, onUpdate, isAdmin = false }: TeacherActionsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      firstName: teacher.firstName || "",
      lastName: teacher.lastName || "",
      email: teacher.email || "",
      phoneNumber: teacher.phoneNumber || "",
      subject: teacher.subject || "",
      qualifications: teacher.qualifications || "",
      status: teacher.status || "Active",
    },
  })

  const onSubmit = async (data: TeacherFormValues) => {
    setError(null)

    try {
      const response = await fetch(`/api/teachers/${teacher.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update teacher")
      }

      setEditDialogOpen(false)
      form.reset()
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleSendInvite = async () => {
    setIsSendingInvite(true)
    try {
      const response = await fetch(`/api/teachers/${teacher.id}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send invitation")
      }

      const data = await response.json()
      toast.success("Portal invitation sent successfully!", {
        description: data.message,
      })
      setInviteDialogOpen(false)
      onUpdate?.()
    } catch (err) {
      toast.error("Failed to send invitation", {
        description: err instanceof Error ? err.message : "An error occurred",
      })
    } finally {
      setIsSendingInvite(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/teachers/${teacher.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete teacher")
      }

      toast.success("Teacher deleted successfully!", {
        description: `${teacher.firstName} ${teacher.lastName} has been removed.`,
      })
      setDeleteDialogOpen(false)
      onUpdate?.()
    } catch (err) {
      toast.error("Failed to delete teacher", {
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
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(teacher.id)
                toast.success("Copied teacher ID", { description: teacher.id })
              } catch (err) {
                toast.error("Failed to copy teacher ID", {
                  description: err instanceof Error ? err.message : String(err),
                })
              }
            }}
          >
            Copy teacher ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setViewDialogOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit teacher
          </DropdownMenuItem>
          {!teacher.userId && (
            <DropdownMenuItem onClick={() => setInviteDialogOpen(true)}>
              <Mail className="mr-2 h-4 w-4" />
              Send portal invite
            </DropdownMenuItem>
          )}
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete teacher
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        isOpen={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        title="Send Portal Invite"
        description={`Are you sure you want to send a portal invitation to ${teacher.firstName} ${teacher.lastName}${teacher.email ? ` (${teacher.email})` : ''}? They will receive an email with instructions to set up their account.`}
        onConfirm={handleSendInvite}
        confirmText={isSendingInvite ? "Sending..." : "Send Invite"}
        cancelText="Cancel"
      />

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Teacher"
        description={`Are you sure you want to delete ${teacher.firstName} ${teacher.lastName}? This action cannot be undone. All associated data will be permanently removed.`}
        onConfirm={handleDelete}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
      />

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>
              Update the teacher information below.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        First Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Last Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="teacher@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Mathematics, Physics, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="qualifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualifications</FormLabel>
                    <FormControl>
                      <Input placeholder="B.Ed, M.Sc, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Updating..." : "Update Teacher"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ViewTeacherDetailsDialog
        teacher={teacher}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
    </div>
  )
}
