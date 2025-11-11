"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";
import { StudentActions } from "./student-actions";

export type Student = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  fatherName: string;
  fatherPhone: string;
  motherName: string;
  motherPhone: string;
  dateOfBirth: string | null;
  address: string;
  status: "Active" | "Inactive";
  enrollmentDate: string;
  smsEnabled: boolean;
  levelId: string;

  // Detailed Profile
  gender: "Male" | "Female" | "Other" | null;
  bloodGroup:
    | "A_Positive"
    | "A_Negative"
    | "B_Positive"
    | "B_Negative"
    | "AB_Positive"
    | "AB_Negative"
    | "O_Positive"
    | "O_Negative"
    | null;
  nationality?: string | null;
  religion?: string | null;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  previousSchool?: string | null;
  previousClass?: string | null;
  previousMarks?: number | null;

  // Emergency Contact
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;

  // Documents
  profileImage?: string | null;
  birthCertificate?: string | null;
  idProof?: string | null;
};

export const createColumns = (
  onUpdate?: () => void,
  isAdmin?: boolean
): ColumnDef<Student>[] => [
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => {
      const firstName = row.original.firstName;
      const lastName = row.original.lastName;
      return (
        <div className="font-medium">
          {firstName} {lastName}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Contact",
    cell: ({ row }) => {
      const email = row.original.email;
      const phoneNumber = row.original.phoneNumber;
      return (
        <div className="flex flex-col gap-1">
          {email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span>{email}</span>
            </div>
          )}
          {phoneNumber && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span>{phoneNumber}</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "fatherName",
    header: "Parents",
    cell: ({ row }) => {
      const fatherName = row.original.fatherName;
      const fatherPhone = row.original.fatherPhone;
      const motherName = row.original.motherName;
      const motherPhone = row.original.motherPhone;
      return (
        <div className="flex flex-col gap-2">
          {fatherName && (
            <div className="flex flex-col">
              <span className="font-medium text-sm">{fatherName} (Father)</span>
              {fatherPhone && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{fatherPhone}</span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "dateOfBirth",
    header: "Date of Birth",
    cell: ({ row }) => {
      const dob = row.getValue("dateOfBirth") as string | null;
      if (!dob) return <span className="text-muted-foreground text-sm">-</span>;
      const date = new Date(dob);
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "Active" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "smsEnabled",
    header: "SMS",
    cell: ({ row }) => {
      const smsEnabled = row.getValue("smsEnabled") as boolean;
      return (
        <Badge variant={smsEnabled ? "default" : "outline"}>
          {smsEnabled ? "Enabled" : "Disabled"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "enrollmentDate",
    header: "Enrollment Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("enrollmentDate"));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const student = row.original;
      return (
        <StudentActions
          student={student}
          onUpdate={onUpdate}
          isAdmin={isAdmin}
        />
      );
    },
  },
];

// Default export for backward compatibility
export const columns = createColumns();
