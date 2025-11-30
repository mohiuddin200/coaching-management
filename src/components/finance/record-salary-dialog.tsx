"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { InlineLoader } from "@/components/data-loader";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  salary: number | null;
  paymentType: string | null;
}

interface RecordSalaryDialogProps {
  onCreated: () => void;
}

export function RecordSalaryDialog({ onCreated }: RecordSalaryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    teacherId: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0],
    description: "",
    receiptNo: "",
  });

  useEffect(() => {
    if (open) {
      fetchTeachers();
    }
  }, [open]);

  useEffect(() => {
    if (formData.teacherId) {
      const teacher = teachers.find((t) => t.id === formData.teacherId);
      setSelectedTeacher(teacher || null);
      if (teacher?.salary && teacher.salary !== null) {
        setFormData((prev) => ({ ...prev, amount: teacher.salary!.toString() }));
      }
    }
  }, [formData.teacherId, teachers]);

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await fetch("/api/teachers");
      const data = await response.json();
      setTeachers(data.teachers || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/finance/teacher-payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to record salary payment");
      }

      toast.success("Salary payment recorded successfully");

      setOpen(false);
      setFormData({
        teacherId: "",
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
        periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0],
        description: "",
        receiptNo: "",
      });
      setSelectedTeacher(null);
      onCreated();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to record salary payment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Wallet className="mr-2 h-4 w-4" />
          Record Salary Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Record Teacher Salary Payment</DialogTitle>
          <DialogDescription>
            Record a salary payment for a teacher
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teacher">Teacher *</Label>
            <Select
              value={formData.teacherId}
              onValueChange={(value) =>
                setFormData({ ...formData, teacherId: value })
              }
              required
              disabled={loadingTeachers}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingTeachers ? "Loading teachers..." : "Select teacher"} />
              </SelectTrigger>
              <SelectContent>
                {loadingTeachers ? (
                  <div className="p-4">
                    <InlineLoader text="Loading teachers..." />
                  </div>
                ) : teachers.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No teachers available
                  </div>
                ) : (
                  teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                      {teacher.salary && ` - ${teacher.paymentType}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedTeacher && (
              <div className="text-sm text-muted-foreground">
                {selectedTeacher.paymentType && (
                  <span>Payment Type: {selectedTeacher.paymentType}</span>
                )}
                {selectedTeacher.salary && (
                  <span> | Base Salary: {selectedTeacher.salary} BDT</span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (BDT) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="10000"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) =>
                  setFormData({ ...formData, paymentDate: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodStart">Period Start *</Label>
              <Input
                id="periodStart"
                type="date"
                value={formData.periodStart}
                onChange={(e) =>
                  setFormData({ ...formData, periodStart: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodEnd">Period End *</Label>
              <Input
                id="periodEnd"
                type="date"
                value={formData.periodEnd}
                onChange={(e) =>
                  setFormData({ ...formData, periodEnd: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptNo">Receipt Number</Label>
            <Input
              id="receiptNo"
              placeholder="SAL-001"
              value={formData.receiptNo}
              onChange={(e) =>
                setFormData({ ...formData, receiptNo: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional notes about this payment..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
