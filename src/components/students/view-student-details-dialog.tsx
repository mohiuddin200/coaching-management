"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Student } from "./columns"
import { Badge } from "@/components/ui/badge"
import { Button } from "../ui/button"
import { Eye } from "lucide-react"

interface ViewStudentDetailsDialogProps {
  student: Student
}

export function ViewStudentDetailsDialog({ student }: ViewStudentDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start p-2 h-auto">
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <h3 className="col-span-2 text-lg font-semibold text-primary border-b pb-2">Basic Information</h3>
            <DetailItem label="First Name" value={student.firstName} />
            <DetailItem label="Last Name" value={student.lastName} />
            <DetailItem label="Email" value={student.email} />
            <DetailItem label="Phone Number" value={student.phoneNumber} />
            <DetailItem label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "-"} />
            <DetailItem label="Address" value={student.address} />
            <DetailItem label="Status">
              <Badge variant={student.status === "Active" ? "default" : "secondary"}>
                {student.status}
              </Badge>
            </DetailItem>
            <DetailItem label="SMS Enabled">
              <Badge variant={student.smsEnabled ? "default" : "outline"}>
                {student.smsEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </DetailItem>
            <DetailItem label="Enrollment Date" value={new Date(student.enrollmentDate).toLocaleDateString()} />

            <h3 className="col-span-2 text-lg font-semibold text-primary border-b pb-2 mt-4">Parents Information</h3>
            <DetailItem label="Father's Name" value={student.fatherName} />
            <DetailItem label="Father's Phone" value={student.fatherPhone} />
            <DetailItem label="Mother's Name" value={student.motherName} />
            <DetailItem label="Mother's Phone" value={student.motherPhone} />

            <h3 className="col-span-2 text-lg font-semibold text-primary border-b pb-2 mt-4">Detailed Profile</h3>
            <DetailItem label="Gender" value={student.gender} />
            <DetailItem label="Blood Group" value={student.bloodGroup} />
            <DetailItem label="Nationality" value={student.nationality} />
            <DetailItem label="Religion" value={student.religion} />
            <DetailItem label="Street Address" value={student.streetAddress} />
            <DetailItem label="City" value={student.city} />
            <DetailItem label="State" value={student.state} />
            <DetailItem label="Postal Code" value={student.postalCode} />
            <DetailItem label="Country" value={student.country} />

            <h3 className="col-span-2 text-lg font-semibold text-primary border-b pb-2 mt-4">Previous Education</h3>
            <DetailItem label="Previous School" value={student.previousSchool} />
            <DetailItem label="Previous Class" value={student.previousClass} />
            <DetailItem label="Previous Marks" value={student.previousMarks?.toString()} />

            <h3 className="col-span-2 text-lg font-semibold text-primary border-b pb-2 mt-4">Emergency Contact</h3>
            <DetailItem label="Emergency Contact Name" value={student.emergencyContactName} />
            <DetailItem label="Emergency Contact Phone" value={student.emergencyContactPhone} />
            <DetailItem label="Emergency Contact Relation" value={student.emergencyContactRelation} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {children ? <div className="text-sm">{children}</div> : <p className="text-sm">{value || "-"}</p>}
    </div>
  )
}
