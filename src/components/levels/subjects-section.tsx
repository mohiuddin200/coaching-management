/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState } from 'react';
import { BookOpen, Trash2, Pencil } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateSubjectDialog } from './create-subject-dialog';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
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

interface Subject {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  levelId: string;
  _count?: {
    classSections: number;
  };
}

interface SubjectsSectionProps {
  selectedLevel: string;
  levelName: string | undefined;
  subjects: Subject[];
  onSubjectCreated: () => void;
}

export function SubjectsSection({ selectedLevel, levelName, subjects, onSubjectCreated }: SubjectsSectionProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete subject');
      }

      toast.success('Subject deleted successfully');
      onSubjectCreated(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Error deleting subject');
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setIsEditDialogOpen(true);
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject) return;

    if (!editingSubject.name) {
      toast.error('Subject name is required');
      return;
    }

    try {
      const response = await fetch(`/api/subjects/${editingSubject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingSubject.name,
          code: editingSubject.code,
          description: editingSubject.description,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update subject');
      }

      toast.success('Subject updated successfully');
      setIsEditDialogOpen(false);
      setEditingSubject(null);
      onSubjectCreated(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to update subject');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <CardTitle>Subjects for {levelName}</CardTitle>
          </div>
          <CreateSubjectDialog
            selectedLevel={selectedLevel}
            levelName={levelName}
            onSubjectCreated={onSubjectCreated}
          />
        </div>
        <CardDescription>
          Manage subjects and their details for this grade
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              No subjects yet for {levelName}.
            </p>
            <p className="text-xs text-muted-foreground">
              Click &quot;Add Subject&quot; button above to create your first subject.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {subjects
              .filter((s) => s.levelId === selectedLevel)
              .map((subject) => (
                <div
                  key={subject.id}
                  className="p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{subject.name}</h4>
                      {subject.code && (
                        <p className="text-sm text-muted-foreground">
                          Code: {subject.code}
                        </p>
                      )}
                      {subject.description && (
                        <p className="text-sm text-muted-foreground">
                          {subject.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">
                        {subject._count?.classSections || 0} sections
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditSubject(subject)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <ConfirmationDialog
                        title="Delete Subject"
                        description={`Are you sure you want to delete "${subject.name}"? This action cannot be undone.`}
                        onConfirm={() => handleDeleteSubject(subject.id)}
                      >
                        <Button variant="destructive" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </ConfirmationDialog>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>

      {/* Edit Subject Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>
              Update subject information for {levelName}
            </DialogDescription>
          </DialogHeader>
          {editingSubject && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-subject-name">Subject Name *</Label>
                <Input
                  id="edit-subject-name"
                  placeholder="e.g., Mathematics"
                  value={editingSubject.name}
                  onChange={(e) =>
                    setEditingSubject({ ...editingSubject, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-subject-code">Subject Code</Label>
                <Input
                  id="edit-subject-code"
                  placeholder="e.g., MATH101"
                  value={editingSubject.code || ''}
                  onChange={(e) =>
                    setEditingSubject({ ...editingSubject, code: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-subject-description">Description</Label>
                <Textarea
                  id="edit-subject-description"
                  placeholder="Optional description"
                  value={editingSubject.description || ''}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingSubject(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateSubject}>Update Subject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
