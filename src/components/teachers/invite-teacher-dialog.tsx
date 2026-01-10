"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SystemRole, ROLE_DESCRIPTIONS } from "@/lib/permissions/config";

// Define role display names
const ROLE_DISPLAY_NAMES: Record<SystemRole, string> = {
  SuperAdmin: "Super Admin",
  OrganizationAdmin: "Organization Admin", 
  FinanceManager: "Finance Manager",
  AcademicCoordinator: "Academic Coordinator",
};

interface InviteTeacherDialogProps {
  teacherId: string;
  teacherEmail: string;
  teacherName: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onInviteSent?: () => void;
}

export function InviteTeacherDialog({
  teacherId,
  teacherEmail,
  teacherName,
  open: controlledOpen,
  onOpenChange,
  onInviteSent,
}: InviteTeacherDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<SystemRole>("AcademicCoordinator");
  const [isSending, setIsSending] = useState(false);

  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Available roles for invitation (excluding SuperAdmin)
  const availableRoles: SystemRole[] = [
    "OrganizationAdmin",
    "FinanceManager",
    "AcademicCoordinator",
  ];

  const handleSendInvite = async () => {
    setIsSending(true);
    try {
      const response = await fetch(`/api/teachers/${teacherId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (response.ok) {
        toast.success("Invitation sent successfully", {
          description: `${teacherName} has been invited as ${ROLE_DISPLAY_NAMES[selectedRole]}`,
        });
        setOpen(false);
        onInviteSent?.();
      } else {
        const error = await response.json();
        toast.error("Failed to send invitation", {
          description: error.error || "Please try again later",
        });
      }
    } catch (error) {
      toast.error("Failed to send invitation", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlledOpen && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Invite to Portal
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Teacher to Portal</DialogTitle>
          <DialogDescription>
            Send a portal invitation to {teacherName} ({teacherEmail})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Select Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as SystemRole)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_DISPLAY_NAMES[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role Description */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="text-sm font-semibold mb-2">
              {ROLE_DISPLAY_NAMES[selectedRole]}
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              {ROLE_DESCRIPTIONS[selectedRole]}
            </p>

            {/* Role Features */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Access to:
              </p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                {selectedRole === "OrganizationAdmin" && (
                  <>
                    <li>• Full access to all features within organization</li>
                    <li>• Can invite and manage users</li>
                    <li>• Student and teacher management</li>
                    <li>• Finance and payment management</li>
                    <li>• Attendance and exam management</li>
                  </>
                )}
                {selectedRole === "FinanceManager" && (
                  <>
                    <li>• Finance dashboard and reports</li>
                    <li>• Fee structures and student payments</li>
                    <li>• Teacher salaries and expenses</li>
                    <li>• Cannot access academic features</li>
                  </>
                )}
                {selectedRole === "AcademicCoordinator" && (
                  <>
                    <li>• Student and teacher management</li>
                    <li>• Class schedules and levels</li>
                    <li>• Attendance tracking</li>
                    <li>• Exam management</li>
                    <li>• Cannot access finance features</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button onClick={handleSendInvite} disabled={isSending}>
            {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
