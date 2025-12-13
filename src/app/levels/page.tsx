/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Plus, GraduationCap, BookOpen, Pencil } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SubjectsSection } from '@/components/levels/subjects-section';

interface Level {
  id: string;
  name: string;
  levelNumber: number;
  description: string | null;
  _count?: {
    subjects: number;
    students: number;
  };
}

interface Subject {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  levelId: string;
  level: Level;
  _count?: {
    classSections: number;
  };
}

export default function LevelsAndSubjectsPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [newLevel, setNewLevel] = useState({
    name: '',
    levelNumber: '',
    description: '',
  });


  useEffect(() => {
    fetchLevels();
    fetchSubjects();
  }, []);

  const fetchLevels = async () => {
    try {
      const response = await fetch('/api/levels');
      const data = await response.json();
      setLevels(data);
    } catch (error) {
      console.error('Error fetching levels:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (levelId?: string) => {
    try {
      const url = levelId
        ? `/api/subjects?levelId=${levelId}`
        : '/api/subjects';
      const response = await fetch(url);
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    }
  };

  const handleCreateLevel = async () => {
    if (!newLevel.name || !newLevel.levelNumber) {
      toast.error('Name and class number are required');
      return;
    }

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
      setIsCreateDialogOpen(false);
      setNewLevel({ name: '', levelNumber: '', description: '' });
      fetchLevels();
    } catch (error) {
      console.error('Error creating level:', error);
      toast.error('Failed to create class');
    }
  };

  const handleEditLevel = (level: Level) => {
    setEditingLevel(level);
    setIsEditDialogOpen(true);
  };

  const handleUpdateLevel = async () => {
    if (!editingLevel) return;

    if (!editingLevel.name || !editingLevel.levelNumber) {
      toast.error('Name and class number are required');
      return;
    }

    try {
      const response = await fetch('/api/levels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLevel),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update class');
      }

      toast.success('Class updated successfully');
      setIsEditDialogOpen(false);
      setEditingLevel(null);
      fetchLevels();
    } catch (error: any) {
      console.error('Error updating level:', error);
      toast.error(error.message || 'Failed to update class');
    }
  };

  const handleLevelChange = (levelId: string) => {
    setSelectedLevel(levelId);
    fetchSubjects(levelId);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Classes & Subjects</h1>
            <p className="text-muted-foreground">
              Manage classes and their subjects
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateLevel}>Create Class</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Class Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Class</DialogTitle>
                <DialogDescription>
                  Update class information
                </DialogDescription>
              </DialogHeader>
              {editingLevel && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Class Name *</Label>
                    <Input
                      id="edit-name"
                      placeholder="e.g., Class 1, Class 10"
                      value={editingLevel.name}
                      onChange={(e) =>
                        setEditingLevel({ ...editingLevel, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-levelNumber">Class Number *</Label>
                    <Input
                      id="edit-levelNumber"
                      type="number"
                      placeholder="e.g., 1, 2, 3"
                      value={editingLevel.levelNumber}
                      onChange={(e) =>
                        setEditingLevel({
                          ...editingLevel,
                          levelNumber: parseInt(e.target.value),
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
                      value={editingLevel.description || ''}
                      onChange={(e) =>
                        setEditingLevel({
                          ...editingLevel,
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
                    setEditingLevel(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateLevel}>Update Class</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {levels.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Classes Found</CardTitle>
              <CardDescription>
                Click &apos;Create Class&apos; to add your first class
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Grades List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Classes
                </CardTitle>
                <CardDescription>
                  Click on a class to view and manage its subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {levels.map((level) => (
                    <div
                      key={level.id}
                      className={`relative p-4 rounded-lg border transition-all hover:shadow-md ${
                        selectedLevel === level.id
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <button
                        onClick={() => handleLevelChange(level.id)}
                        className="text-left w-full cursor-pointer"
                      >
                        <h3 className="font-semibold text-lg mb-1">{level.name}</h3>
                        {level.description && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {level.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {level._count?.subjects || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {level._count?.students || 0}
                          </div>
                        </div>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLevel(level);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subjects Section - Only show when grade is selected */}
            {selectedLevel && (
              <SubjectsSection
                selectedLevel={selectedLevel}
                levelName={levels.find((l) => l.id === selectedLevel)?.name}
                subjects={subjects}
                onSubjectCreated={() => fetchSubjects(selectedLevel)}
              />
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
