
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface CreateSubjectDialogProps {
  selectedLevel: string;
  levelName: string | undefined;
  onSubjectCreated: () => void;
}

export function CreateSubjectDialog({
  selectedLevel,
  levelName,
  onSubjectCreated,
}: CreateSubjectDialogProps) {
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    description: '',
  });

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLevel) {
      toast.error('Please select a level first');
      return;
    }

    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSubject,
          levelId: selectedLevel,
        }),
      });

      if (response.ok) {
        toast.success('Subject created successfully');
        setShowSubjectDialog(false);
        setNewSubject({ name: '', code: '', description: '' });
        onSubjectCreated();
      } else {
        toast.error('Failed to create subject');
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      toast.error('Failed to create subject');
    }
  };

  return (
    <Dialog open={showSubjectDialog} onOpenChange={setShowSubjectDialog}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
          <DialogDescription>
            Create a new subject for {levelName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div>
            <Label htmlFor="name">Subject Name *</Label>
            <Input
              id="name"
              value={newSubject.name}
              onChange={(e) =>
                setNewSubject({ ...newSubject, name: e.target.value })
              }
              placeholder="Mathematics"
              required
            />
          </div>
          <div>
            <Label htmlFor="code">Subject Code</Label>
            <Input
              id="code"
              value={newSubject.code}
              onChange={(e) =>
                setNewSubject({ ...newSubject, code: e.target.value })
              }
              placeholder="MATH"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newSubject.description}
              onChange={(e) =>
                setNewSubject({
                  ...newSubject,
                  description: e.target.value,
                })
              }
              placeholder="Optional description"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSubjectDialog(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Subject</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
