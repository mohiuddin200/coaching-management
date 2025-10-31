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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, BookOpen, GraduationCap } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

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
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
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
      toast.error('Failed to load levels');
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

  const initializeLevels = async () => {
    try {
      const response = await fetch('/api/levels/initialize', {
        method: 'POST',
      });
      const data = await response.json();
      toast.success(data.message);
      fetchLevels();
    } catch (error) {
      console.error('Error initializing levels:', error);
      toast.error('Failed to initialize levels');
    }
  };

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
        fetchSubjects(selectedLevel);
      } else {
        toast.error('Failed to create subject');
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      toast.error('Failed to create subject');
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
            <h1 className="text-3xl font-bold tracking-tight">Levels & Subjects</h1>
            <p className="text-muted-foreground">
              Manage class levels (1-10) and their subjects
            </p>
          </div>
          {levels.length === 0 && (
            <Button onClick={initializeLevels}>
              <Plus className="mr-2 h-4 w-4" />
              Initialize Levels (Class 1-10)
            </Button>
          )}
        </div>

        {levels.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Levels Found</CardTitle>
              <CardDescription>
                Initialize the default 10 class levels to get started
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Levels Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Class Levels
                </CardTitle>
                <CardDescription>
                  Select a level to manage its subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {levels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => handleLevelChange(level.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedLevel === level.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{level.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {level.description}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>{level._count?.subjects || 0} subjects</div>
                          <div>{level._count?.students || 0} students</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subjects Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <div>
                      <CardTitle>Subjects</CardTitle>
                      <CardDescription>
                        {selectedLevel
                          ? `Subjects for ${
                              levels.find((l) => l.id === selectedLevel)?.name
                            }`
                          : 'Select a level to view subjects'}
                      </CardDescription>
                    </div>
                  </div>
                  {selectedLevel && (
                    <Dialog
                      open={showSubjectDialog}
                      onOpenChange={setShowSubjectDialog}
                    >
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
                            Create a new subject for{' '}
                            {levels.find((l) => l.id === selectedLevel)?.name}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubject} className="space-y-4">
                          <div>
                            <Label htmlFor="name">Subject Name *</Label>
                            <Input
                              id="name"
                              value={newSubject.name}
                              onChange={(e) =>
                                setNewSubject({
                                  ...newSubject,
                                  name: e.target.value,
                                })
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
                                setNewSubject({
                                  ...newSubject,
                                  code: e.target.value,
                                })
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
                            <div className="text-sm text-muted-foreground">
                              {subject._count?.classSections || 0} sections
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
