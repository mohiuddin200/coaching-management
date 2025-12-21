"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { GradeExamDialog } from "./grade-exam-dialog";

interface Exam {
  id: string;
  name: string;
  type: string;
  examDate: string;
  totalMarks: number;
  status: string;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  level: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  };
  questionPaperUrl?: string;
  results: Array<{
    id: string;
    marksObtained: number | null;
    attended: boolean;
  }>;
}

interface Level {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface ExamsListProps {
  refreshTrigger?: number;
}

export function ExamsList({ refreshTrigger }: ExamsListProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [filters, setFilters] = useState({
    levelId: "all",
    subjectId: "all",
    status: "all",
    type: "all",
  });

  useEffect(() => {
    fetchExams();
    fetchLevels();
  }, [refreshTrigger]);

  useEffect(() => {
    fetchExams();
  }, [filters]);

  useEffect(() => {
    if (filters.levelId && filters.levelId !== "all") {
      fetchSubjects(filters.levelId);
    } else {
      setSubjects([]);
    }
  }, [filters.levelId]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.levelId && filters.levelId !== "all") queryParams.append("levelId", filters.levelId);
      if (filters.subjectId && filters.subjectId !== "all") queryParams.append("subjectId", filters.subjectId);
      if (filters.status && filters.status !== "all") queryParams.append("status", filters.status);
      if (filters.type && filters.type !== "all") queryParams.append("type", filters.type);

      const response = await fetch(`/api/exams?${queryParams.toString()}`);
      const data = await response.json();
      setExams(data.data || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await fetch("/api/levels");
      const data = await response.json();
      setLevels(data.data || []);
    } catch (error) {
      console.error("Error fetching levels:", error);
    }
  };

  const fetchSubjects = async (levelId: string) => {
    try {
      const response = await fetch(`/api/subjects?levelId=${levelId}`);
      const data = await response.json();
      setSubjects(data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;

    try {
      const response = await fetch(`/api/exams/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete exam");

      toast.success("Exam deleted successfully");
      fetchExams();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete exam";
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      Scheduled: "default",
      InProgress: "secondary",
      Completed: "outline",
      Cancelled: "destructive",
      Postponed: "secondary",
    };

    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      Monthly: "bg-blue-100 text-blue-800",
      Weekly: "bg-green-100 text-green-800",
      OpenBook: "bg-purple-100 text-purple-800",
      Midterm: "bg-orange-100 text-orange-800",
      Final: "bg-red-100 text-red-800",
      Quiz: "bg-yellow-100 text-yellow-800",
      Assignment: "bg-pink-100 text-pink-800",
    };

    return (
      <Badge className={colors[type] || ""} variant="outline">
        {type}
      </Badge>
    );
  };

  const getGradingProgress = (exam: Exam) => {
    const totalStudents = exam.results.length;
    if (totalStudents === 0) return { graded: 0, total: 0, percentage: 0 };

    const graded = exam.results.filter(
      (r) => r.marksObtained !== null || !r.attended
    ).length;
    const percentage = Math.round((graded / totalStudents) * 100);

    return { graded, total: totalStudents, percentage };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exams</CardTitle>
        <CardDescription>
          View and manage all scheduled exams
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Level</Label>
            <Select
              value={filters.levelId}
              onValueChange={(value) =>
                setFilters({ ...filters, levelId: value, subjectId: "all" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Subject</Label>
            <Select
              value={filters.subjectId}
              onValueChange={(value) =>
                setFilters({ ...filters, subjectId: value })
              }
              disabled={!filters.levelId}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="InProgress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Postponed">Postponed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Type</Label>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
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
        </div>

        {loading ? (
          <div className="text-center py-8">Loading exams...</div>
        ) : exams.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No exams found. Create your first exam to get started.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => {
                  const progress = getGradingProgress(exam);
                  return (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">
                        {exam.name}
                      </TableCell>
                      <TableCell>{getTypeBadge(exam.type)}</TableCell>
                      <TableCell>
                        {exam.subject.name}
                        {exam.subject.code && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({exam.subject.code})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{exam.level.name}</TableCell>
                      <TableCell>
                        {format(new Date(exam.examDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>{exam.totalMarks}</TableCell>
                      <TableCell>{getStatusBadge(exam.status)}</TableCell>
                      <TableCell>
                        {progress.total > 0 ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-sm">
                              {progress.graded}/{progress.total} graded
                            </span>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No students
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {exam.questionPaperUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(exam.questionPaperUrl, "_blank")
                              }
                              title="View Question Paper"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                          <GradeExamDialog exam={exam} onGraded={fetchExams} />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(exam.id)}
                            title="Delete Exam"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
