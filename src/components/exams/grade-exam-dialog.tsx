/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Checkbox } from "@/components/ui/checkbox";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ExamResult {
  id: string;
  studentId: string;
  marksObtained: number | null;
  grade: string | null;
  remarks: string | null;
  attended: boolean;
  absentReason: string | null;
  student: Student;
}

interface Exam {
  id: string;
  name: string;
  totalMarks: number;
  passingMarks?: number;
  levelId: string;
  results?: ExamResult[];
}

interface GradeExamDialogProps {
  exam: Exam;
  onGraded: () => void;
}

interface ResultFormData {
  studentId: string;
  marksObtained: string;
  grade: string;
  remarks: string;
  attended: boolean;
  absentReason: string;
}

export function GradeExamDialog({ exam, onGraded }: GradeExamDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Map<string, ResultFormData>>(
    new Map()
  );

  useEffect(() => {
    if (open) {
      fetchStudentsAndResults();
    }
  }, [open]);

  const fetchStudentsAndResults = async () => {
    try {
      // Fetch students from the exam's level
      const studentsResponse = await fetch(
        `/api/students?levelId=${exam.levelId}`
      );
      const studentsData = await studentsResponse.json();
      const studentsList = studentsData.students || [];
      setStudents(studentsList);

      // Fetch existing results
      const resultsResponse = await fetch(`/api/exams/${exam.id}/results`);
      const resultsData = await resultsResponse.json();
      const existingResults = resultsData.data || [];

      // Initialize results map
      const resultsMap = new Map<string, ResultFormData>();

      studentsList.forEach((student: Student) => {
        const existingResult = existingResults.find(
          (r: ExamResult) => r.studentId === student.id
        );

        resultsMap.set(student.id, {
          studentId: student.id,
          marksObtained: existingResult?.marksObtained?.toString() || "",
          grade: existingResult?.grade || "",
          remarks: existingResult?.remarks || "",
          attended: existingResult?.attended ?? true,
          absentReason: existingResult?.absentReason || "",
        });
      });

      setResults(resultsMap);
    } catch (error) {
      console.error("Error fetching students and results:", error);
      toast.error("Failed to load students");
    }
  };

  const updateResult = (studentId: string, field: string, value: string | boolean) => {
    setResults((prev) => {
      const newResults = new Map(prev);
      const current = newResults.get(studentId) || {
        studentId,
        marksObtained: "",
        grade: "",
        remarks: "",
        attended: true,
        absentReason: "",
      };
      newResults.set(studentId, { ...current, [field]: value });
      return newResults;
    });
  };

  const calculateGrade = (marks: number): string => {
    const percentage = (marks / exam.totalMarks) * 100;

    if (percentage >= 80) return "A+";
    if (percentage >= 70) return "A";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
  };

  const handleMarksChange = (studentId: string, marks: string) => {
    updateResult(studentId, "marksObtained", marks);

    if (marks && !isNaN(parseFloat(marks))) {
      const grade = calculateGrade(parseFloat(marks));
      updateResult(studentId, "grade", grade);
    }
  };

  const handleAttendanceChange = (studentId: string, attended: boolean) => {
    updateResult(studentId, "attended", attended);
    if (attended) {
      updateResult(studentId, "absentReason", "");
    } else {
      updateResult(studentId, "marksObtained", "");
      updateResult(studentId, "grade", "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const resultsArray = Array.from(results.values()).map((result) => ({
        studentId: result.studentId,
        marksObtained: result.marksObtained
          ? parseFloat(result.marksObtained)
          : null,
        grade: result.grade || null,
        remarks: result.remarks || null,
        attended: result.attended,
        absentReason: result.absentReason || null,
      }));

      const response = await fetch(`/api/exams/${exam.id}/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ results: resultsArray }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save results");
      }

      toast.success("Results saved successfully");
      setOpen(false);
      onGraded();
    } catch (error: any) {
      toast.error(error.message || "Failed to save results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Grade Exam">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Grade Exam: {exam.name}</DialogTitle>
          <DialogDescription>
            Enter marks and grades for all students. Total marks: {exam.totalMarks}
            {exam.passingMarks && ` | Passing marks: ${exam.passingMarks}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students found for this level
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Student Name</TableHead>
                    <TableHead className="w-24">Attended</TableHead>
                    <TableHead className="w-28">Marks</TableHead>
                    <TableHead className="w-24">Grade</TableHead>
                    <TableHead className="min-w-[150px]">Remarks</TableHead>
                    <TableHead className="min-w-[150px]">Absent Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const result = results.get(student.id) || {
                      studentId: student.id,
                      marksObtained: "",
                      grade: "",
                      remarks: "",
                      attended: true,
                      absentReason: "",
                    };

                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.firstName} {student.lastName}
                          <div className="text-xs text-muted-foreground">
                            {student.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={result.attended}
                            onCheckedChange={(checked) =>
                              handleAttendanceChange(
                                student.id,
                                checked as boolean
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={result.marksObtained}
                            onChange={(e) =>
                              handleMarksChange(student.id, e.target.value)
                            }
                            placeholder="0"
                            min="0"
                            max={exam.totalMarks}
                            step="0.5"
                            disabled={!result.attended}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={result.grade}
                            onChange={(e) =>
                              updateResult(student.id, "grade", e.target.value)
                            }
                            placeholder="A+"
                            disabled={!result.attended}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={result.remarks}
                            onChange={(e) =>
                              updateResult(student.id, "remarks", e.target.value)
                            }
                            placeholder="Good work"
                            disabled={!result.attended}
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={result.absentReason}
                            onChange={(e) =>
                              updateResult(
                                student.id,
                                "absentReason",
                                e.target.value
                              )
                            }
                            placeholder="Sick"
                            disabled={result.attended}
                            className="w-full"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || students.length === 0}>
              {loading ? "Saving..." : "Save Results"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
