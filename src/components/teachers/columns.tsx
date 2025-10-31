"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Mail, Phone } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

export const columns: ColumnDef<Teacher>[] = [
  {
    accessorKey: "firstName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
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
      const phone = row.original.phoneNumber
      return (
        <div className="flex flex-col gap-1">
          {email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span>{email}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{phone}</span>
          </div>
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Join Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("joinDate"))
      return <div>{date.toLocaleDateString()}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const teacher = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(teacher.id)}>
              Copy teacher ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit teacher</DropdownMenuItem>
            {!teacher.userId && (
              <DropdownMenuItem>Send portal invite</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]