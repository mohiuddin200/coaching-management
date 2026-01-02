/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Level {
  id: string;
  name: string;
  levelNumber: number;
  description: string | null;
}

interface EditLevelDialogProps {
  level: Level | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditLevelDialog({ level, open, onOpenChange, onSuccess }: EditLevelDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    levelNumber: '',
    description: '',
  });

  useEffect(() => {
    if (level) {
      setFormData({
        name: level.name,
        levelNumber: level.levelNumber.toString(),
        description: level.description || '',
      });
    }
  }, [level]);

  const handleUpdateLevel = async () => {
    if (!level) return;

    if (!formData.name || !formData.levelNumber) {
      toast.error('Name and class number are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/levels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...level,
          name: formData.name,
          levelNumber: parseInt(formData.levelNumber),
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update class');
      }

      toast.success('Class updated successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error updating level:', error);
      toast.error(error.message || 'Failed to update class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
          <DialogDescription>
            Update class information
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Class Name *</Label>
            <Input
              id="edit-name"
              placeholder="e.g., Class 1, Class 10"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-levelNumber">Class Number *</Label>
            <Input
              id="edit-levelNumber"
              type="number"
              placeholder="e.g., 1, 2, 3"
              value={formData.levelNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  levelNumber: e.target.value,
                })
              }
            />
            <p className="text-sm text-muted-foreground">
              Use 1-50 for regular classes (Class 1, Class 2, etc.) and 100+ for special programs (English Club, Science Club, etc.)
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Optional description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdateLevel} disabled={loading}>
            {loading ? 'Updating...' : 'Update Class'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
