'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface CreateLevelDialogProps {
  onSuccess: () => void;
}

export function CreateLevelDialog({ onSuccess }: CreateLevelDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newLevel, setNewLevel] = useState({
    name: '',
    levelNumber: '',
    description: '',
  });

  const handleCreateLevel = async () => {
    if (!newLevel.name || !newLevel.levelNumber) {
      toast.error('Name and class number are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLevel),
      });

      if (!response.ok) {
        throw new Error('Failed to create class');
      }

      toast.success('Class created successfully');
      setOpen(false);
      setNewLevel({ name: '', levelNumber: '', description: '' });
      onSuccess();
    } catch (error) {
      console.error('Error creating level:', error);
      toast.error('Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Class
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
          <DialogDescription>
            Add a new class to your coaching center
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Class Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Class 1, Class 10"
              value={newLevel.name}
              onChange={(e) =>
                setNewLevel({ ...newLevel, name: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="levelNumber">Class Number *</Label>
            <Input
              id="levelNumber"
              type="number"
              placeholder="e.g., 1, 2, 3"
              value={newLevel.levelNumber}
              onChange={(e) =>
                setNewLevel({ ...newLevel, levelNumber: e.target.value })
              }
            />
            <p className="text-sm text-muted-foreground">
              Use 1-50 for regular classes (Class 1, Class 2, etc.) and 100+ for special programs (English Club, Science Club, etc.)
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description"
              value={newLevel.description}
              onChange={(e) =>
                setNewLevel({ ...newLevel, description: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateLevel} disabled={loading}>
            {loading ? 'Creating...' : 'Create Class'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
