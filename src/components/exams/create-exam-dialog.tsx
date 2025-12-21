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

interface Level {
  id: string;
  name: string;
  levelNumber: number;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

interface CreateExamDialogProps {
  onCreated: () => void;
}

export function CreateExamDialog({ onCreated }: CreateExamDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const academicYear = currentMonth >= 7 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;

  const [formData, setFormData] = useState({
    name: "",
    type: "Monthly",
    description: "",
    levelId: "",
    subjectId: "",
    teacherId: "",
    totalMarks: "",
    passingMarks: "",
    examDate: "",
    duration: "",
    startTime: "",
    endTime: "",
    roomNumber: "",
    questionPaperUrl: "",
    answerKeyUrl: "",
    academicYear,
  });

  useEffect(() => {
    if (open) {
      fetchLevels();
      fetchTeachers();
    }
  }, [open]);

  useEffect(() => {
    if (formData.levelId) {
      fetchSubjects(formData.levelId);
    } else {
      setSubjects([]);
      setFormData((prev) => ({ ...prev, subjectId: "" }));
    }
  }, [formData.levelId]);

  const fetchLevels = async () => {
    try {
      const response = await fetch("/api/levels");
      const data = await response.json();
      setLevels(data.data || []);
    } catch (error) {
      console.error("Error fetching levels:", error);
      toast.error("Failed to load levels");
    }
  };

  const fetchSubjects = async (levelId: string) => {
    try {
      const response = await fetch(`/api/subjects?levelId=${levelId}`);
      const data = await response.json();
      setSubjects(data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects");
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers");
      const data = await response.json();
      setTeachers(data.data || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.levelId || !formData.subjectId || !formData.teacherId || !formData.totalMarks || !formData.examDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create exam");
      }

      toast.success("Exam created successfully");
      setOpen(false);
      setFormData({
        name: "",
        type: "Monthly",
        description: "",
        levelId: "",
        subjectId: "",
        teacherId: "",
        totalMarks: "",
        passingMarks: "",
        examDate: "",
        duration: "",
        startTime: "",
        endTime: "",
        roomNumber: "",
        questionPaperUrl: "",
        answerKeyUrl: "",
        academicYear,
      });
      onCreated();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create exam";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Exam
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Exam</DialogTitle>
          <DialogDescription>
            Schedule a new exam for your students
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">
                Exam Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Mathematics Monthly Test"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">
                Exam Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="OpenBook">Open Book</SelectItem>
                  <SelectItem value="Midterm">Midterm</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                  <SelectItem value="Quiz">Quiz</SelectItem>
                  <SelectItem value="Assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level">
                Level <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.levelId}
                onValueChange={(value) =>
                  setFormData({ ...formData, levelId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.subjectId}
                onValueChange={(value) =>
                  setFormData({ ...formData, subjectId: value })
                }
                disabled={!formData.levelId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="teacher">
                Teacher <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.teacherId}
                onValueChange={(value) =>
                  setFormData({ ...formData, teacherId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="totalMarks">
                Total Marks <span className="text-red-500">*</span>
              </Label>
              <Input
                id="totalMarks"
                type="number"
                value={formData.totalMarks}
                onChange={(e) =>
                  setFormData({ ...formData, totalMarks: e.target.value })
                }
                placeholder="100"
                required
              />
            </div>

            <div>
              <Label htmlFor="passingMarks">Passing Marks</Label>
              <Input
                id="passingMarks"
                type="number"
                value={formData.passingMarks}
                onChange={(e) =>
                  setFormData({ ...formData, passingMarks: e.target.value })
                }
                placeholder="40"
              />
            </div>

            <div>
              <Label htmlFor="examDate">
                Exam Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="examDate"
                type="date"
                value={formData.examDate}
                onChange={(e) =>
                  setFormData({ ...formData, examDate: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="90"
              />
            </div>

            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input
                id="roomNumber"
                value={formData.roomNumber}
                onChange={(e) =>
                  setFormData({ ...formData, roomNumber: e.target.value })
                }
                placeholder="Room 101"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="questionPaperUrl">Question Paper URL</Label>
              <Input
                id="questionPaperUrl"
                value={formData.questionPaperUrl}
                onChange={(e) =>
                  setFormData({ ...formData, questionPaperUrl: e.target.value })
                }
                placeholder="https://drive.google.com/..."
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="answerKeyUrl">Answer Key URL</Label>
              <Input
                id="answerKeyUrl"
                value={formData.answerKeyUrl}
                onChange={(e) =>
                  setFormData({ ...formData, answerKeyUrl: e.target.value })
                }
                placeholder="https://drive.google.com/..."
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add any additional notes or instructions..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Exam"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
