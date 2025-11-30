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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { InlineLoader } from "@/components/data-loader";

interface Level {
  id: string;
  name: string;
  levelNumber: number;
}

interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  academicYear: string;
  description: string | null;
  levelId?: string | null;
  level?: {
    id: string;
    name: string;
    levelNumber: number;
  } | null;
  isActive: boolean;
}

interface CreateFeeStructureDialogProps {
  onCreated?: () => void;
  onUpdated?: () => void;
  editingFeeStructure?: FeeStructure;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateFeeStructureDialog({
  onCreated,
  onUpdated,
  editingFeeStructure,
  children,
  open: controlledOpen,
  onOpenChange,
}: CreateFeeStructureDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [levels, setLevels] = useState<Level[]>([]);

  const isEditMode = !!editingFeeStructure;

  // Update form data when editingFeeStructure changes
  useEffect(() => {
    if (editingFeeStructure) {
      setFormData({
        name: editingFeeStructure.name || "",
        levelId: getLevelId(editingFeeStructure),
        amount: editingFeeStructure.amount?.toString() || "",
        frequency: editingFeeStructure.frequency || "Monthly",
        academicYear: editingFeeStructure.academicYear || "2024-2025",
        description: editingFeeStructure.description || "",
        isActive: editingFeeStructure.isActive ?? true,
      });
      if (onOpenChange) {
        onOpenChange(true);
      } else {
        setInternalOpen(true);
      }
    }
  }, [editingFeeStructure, onOpenChange]);

  // Extract levelId from either levelId property or nested level object
  const getLevelId = (feeStructure?: FeeStructure): string => {
    if (!feeStructure) return "";
    if (feeStructure.levelId !== undefined) return feeStructure.levelId || "";
    if (feeStructure.level?.id) return feeStructure.level.id;
    return "";
  };

  const [formData, setFormData] = useState({
    name: "",
    levelId: "",
    amount: "",
    frequency: "Monthly",
    academicYear: "2024-2025",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    if (open) {
      fetchLevels();
    }
  }, [open]);

  const fetchLevels = async () => {
    setLoadingLevels(true);
    try {
      const response = await fetch("/api/levels");
      const data = await response.json();
      console.log(data, "levels")
      setLevels(data || []);
    } catch (error) {
      console.error("Error fetching levels:", error);
      toast.error("Failed to load levels");
    } finally {
      setLoadingLevels(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditMode
        ? `/api/finance/fee-structures/${editingFeeStructure.id}`
        : "/api/finance/fee-structures";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          levelId: formData.levelId || null,
          amount: parseFloat(formData.amount),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEditMode ? 'update' : 'create'} fee structure`);
      }

      toast.success(`Fee structure ${isEditMode ? 'updated' : 'created'} successfully`);

      handleDialogChange(false);
      resetForm();

      if (isEditMode) {
        onUpdated?.();
      } else {
        onCreated?.();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} fee structure`
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      levelId: "",
      amount: "",
      frequency: "Monthly",
      academicYear: "2024-2025",
      description: "",
      isActive: true,
    });
  };

  const handleDialogChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Only run cleanup when closing
      if (isEditMode && onUpdated) {
        onUpdated();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      {!isEditMode && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Update Fee Structure" : "Create Fee Structure"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Edit the fee structure details"
              : "Define a new fee structure for a level or course"
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Fee Structure Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Monthly Tuition - Class 8"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="levelId">Level (Optional)</Label>
            <Select
              value={formData.levelId}
              onValueChange={(value) =>
                setFormData({ ...formData, levelId: value })
              }
              disabled={loadingLevels}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingLevels ? "Loading levels..." : "Select level (optional)"} />
              </SelectTrigger>
              <SelectContent>
                {loadingLevels ? (
                  <div className="p-4">
                    <InlineLoader text="Loading levels..." />
                  </div>
                ) : levels.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No levels available
                  </div>
                ) : (
                  levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (BDT) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="1000"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) =>
                  setFormData({ ...formData, frequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                  <SelectItem value="OneTime">One Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="academicYear">Academic Year *</Label>
            <Input
              id="academicYear"
              placeholder="2024-2025"
              value={formData.academicYear}
              onChange={(e) =>
                setFormData({ ...formData, academicYear: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional details about this fee structure..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          {isEditMode && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Fee Structure"
                  : "Create Fee Structure"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
