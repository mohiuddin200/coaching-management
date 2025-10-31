"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Mail } from "lucide-react"
import { TeacherActions } from "./teacher-actions"

export type Teacher = {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phoneNumber: string
  subject: string | null
  qualifications: string | null
  status: "Active" | "Inactive"
  joinDate: string
  userId: string | null
}

export const createColumns = (onUpdate?: () => void, isAdmin?: boolean): ColumnDef<Teacher>[] => [
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => {
      const firstName = row.original.firstName
      const lastName = row.original.lastName
      return (
        <div className="font-medium">
          {firstName} {lastName}
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Contact",
    cell: ({ row }) => {
      const email = row.original.email
      return (
        <div className="flex flex-col gap-1">
          {email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span>{email}</span>
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => {
      const subject = row.getValue("subject") as string | null
      return subject ? (
        <Badge variant="outline">{subject}</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">Not assigned</span>
      )
    },
  },
  {
    accessorKey: "qualifications",
    header: "Qualifications",
    cell: ({ row }) => {
      const qualifications = row.getValue("qualifications") as string | null
      return (
        <div className="max-w-[200px] truncate">
          {qualifications || <span className="text-muted-foreground text-sm">-</span>}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "Active" ? "default" : "secondary"}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "userId",
    header: "Portal Access",
    cell: ({ row }) => {
      const userId = row.getValue("userId") as string | null
      return (
        <Badge variant={userId ? "default" : "outline"}>
          {userId ? "Has Access" : "No Access"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "joinDate",
    header: "Join Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("joinDate"))
      return <div>{date.toLocaleDateString()}</div>
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const teacher = row.original
      return <TeacherActions teacher={teacher} onUpdate={onUpdate} isAdmin={isAdmin} />
    },
  },
]

// Default export for backward compatibility
export const columns = createColumns()