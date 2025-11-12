"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Teacher } from "./columns"
import { Badge } from "@/components/ui/badge"

interface ViewTeacherDetailsDialogProps {
  teacher: Teacher;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewTeacherDetailsDialog({ teacher, open, onOpenChange }: ViewTeacherDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Teacher Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <h3 className="col-span-2 text-lg font-semibold text-primary border-b pb-2">Basic Information</h3>
            <DetailItem label="First Name" value={teacher.firstName} />
            <DetailItem label="Last Name" value={teacher.lastName} />
            <DetailItem label="Email" value={teacher.email} />
            <DetailItem label="Phone Number" value={teacher.phoneNumber} />
            <DetailItem label="Subject" value={teacher.subject} />
            <DetailItem label="Join Date" value={teacher.joinDate ? new Date(teacher.joinDate).toLocaleDateString() : "-"} />
            <DetailItem label="Status">
              <Badge variant={teacher.status === "Active" ? "default" : "secondary"}>
                {teacher.status}
              </Badge>
            </DetailItem>
            <DetailItem label="Portal Access">
                <Badge variant={teacher.userId ? "default" : "outline"}>
                    {teacher.userId ? "Has Access" : "No Access"}
                </Badge>
            </DetailItem>

            <h3 className="col-span-2 text-lg font-semibold text-primary border-b pb-2 mt-4">Detailed Profile</h3>
            <DetailItem label="Date of Birth" value={teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString() : "-"} />
            <DetailItem label="Gender" value={teacher.gender} />
            <DetailItem label="NID" value={teacher.nid} />
            <DetailItem label="Blood Group" value={teacher.bloodGroup?.replace("_", " ")} />
            <DetailItem label="Religion" value={teacher.religion} />
            <DetailItem label="Nationality" value={teacher.nationality} />
            
            <h3 className="col-span-2 text-lg font-semibold text-primary border-b pb-2 mt-4">Address</h3>
            <DetailItem label="Street Address" value={teacher.streetAddress} />
            <DetailItem label="City" value={teacher.city} />
            <DetailItem label="State" value={teacher.state} />
            <DetailItem label="Postal Code" value={teacher.postalCode} />
            <DetailItem label="Country" value={teacher.country} />

            <h3 className="col-span-2 text-lg font-semibold text-primary border-b pb-2 mt-4">Academic Information</h3>
            <DetailItem label="Qualifications" value={teacher.qualifications} />
            <DetailItem label="University Name" value={teacher.universityName} />
            <DetailItem label="CGPA" value={teacher.cgpa?.toString()} />

            <h3 className="col-span-2 text-lg font-semibold text-primary border-b pb-2 mt-4">Emergency Contact</h3>
            <DetailItem label="Emergency Contact Name" value={teacher.emergencyContactName} />
            <DetailItem label="Emergency Contact Phone" value={teacher.emergencyContactPhone} />
            <DetailItem label="Emergency Contact Relation" value={teacher.emergencyContactRelation} />

            <h3 className="col-span-2 text-lg font-semibold text-primary border-b pb-2 mt-4">Finance Information</h3>
            <DetailItem label="Salary" value={teacher.salary?.toString()} />
            <DetailItem label="Payment Type" value={teacher.paymentType} />

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
