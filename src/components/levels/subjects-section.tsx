/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { BookOpen, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateSubjectDialog } from './create-subject-dialog';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { Button } from '@/components/ui/button';
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <div>
              <CardTitle>Subjects</CardTitle>
              <CardDescription>
                {selectedLevel
                  ? `Subjects for ${levelName}`
                  : 'Select a level to view subjects'}
              </CardDescription>
            </div>
          </div>
          {selectedLevel && (
            <CreateSubjectDialog
              selectedLevel={selectedLevel}
              levelName={levelName}
              onSubjectCreated={onSubjectCreated}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!selectedLevel ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Select a level to view and manage its subjects
          </p>
        ) : subjects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No subjects yet. Click &quot;Add Subject&quot; to create one.
          </p>
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
    </Card>
  );
}
