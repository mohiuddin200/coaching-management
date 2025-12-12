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
import { toast } from 'sonner';
import { Plus, GraduationCap } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SubjectsSection } from '@/components/classes/subjects-section';

interface Class {
  id: string;
  name: string;
  classNumber: number;
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
  classId: string;
  class: Class;
  _count?: {
    classSections: number;
  };
}

export default function LevelsAndSubjectsPage() {
  const [classes, setLevels] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchLevels();
    fetchSubjects();
  }, []);

  const fetchLevels = async () => {
    try {
      const response = await fetch('/api/classes');
      const data = await response.json();
      setLevels(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (classId?: string) => {
    try {
      const url = classId
        ? `/api/subjects?classId=${classId}`
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
      const response = await fetch('/api/classes/initialize', {
        method: 'POST',
      });
      const data = await response.json();
      toast.success(data.message);
      fetchLevels();
    } catch (error) {
      console.error('Error initializing classes:', error);
      toast.error('Failed to initialize classes');
    }
  };



  const handleLevelChange = (classId: string) => {
    setSelectedLevel(classId);
    fetchSubjects(classId);
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
              Manage session classes (1-10) and their subjects
            </p>
          </div>
          {classes.length === 0 && (
            <Button onClick={initializeLevels}>
              <Plus className="mr-2 h-4 w-4" />
              Initialize Classes (Session 1-10)
            </Button>
          )}
        </div>

        {classes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Classes Found</CardTitle>
              <CardDescription>
                Initialize the default 10 session classes to get started
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Classes Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Session Classes
                </CardTitle>
                <CardDescription>
                  Select a class to manage its subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {classes.map((classData) => (
                    <button
                      key={classData.id}
                      onClick={() => handleLevelChange(classData.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedLevel === classData.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{classData.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {classData.description}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>{classData._count?.subjects || 0} subjects</div>
                          <div>{classData._count?.students || 0} students</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subjects Section */}
            <SubjectsSection
              selectedLevel={selectedLevel}
              levelName={classes.find((l) => l.id === selectedLevel)?.name}
              subjects={subjects}
              onSubjectCreated={() => fetchSubjects(selectedLevel)}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
