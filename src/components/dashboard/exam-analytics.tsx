"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ClipboardCheck, Calendar } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface Exam {
  id: string;
  name: string;
  type: string;
  examDate: string;
  status: string;
  subject: {
    name: string;
  };
  level: {
    name: string;
  };
  results: Array<{
    marksObtained: number | null;
    attended: boolean;
  }>;
}

export function ExamAnalytics() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [stats, setStats] = useState({
    upcoming: 0,
    pendingGrading: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamData();
  }, []);

  const fetchExamData = async () => {
    try {
      const response = await fetch("/api/exams");
      const data = await response.json();
      const allExams = data.data || [];
      setExams(allExams);

      // Calculate stats
      const now = new Date();
      const upcoming = allExams.filter(
        (exam: Exam) =>
          exam.status === "Scheduled" && new Date(exam.examDate) > now
      ).length;

      const pendingGrading = allExams.filter((exam: Exam) => {
        if (exam.results.length === 0) return false;
        const graded = exam.results.filter(
          (r) => r.marksObtained !== null || !r.attended
        ).length;
        return graded < exam.results.length;
      }).length;

      const completed = allExams.filter(
        (exam: Exam) => exam.status === "Completed"
      ).length;

      setStats({ upcoming, pendingGrading, completed });
    } catch (error) {
      console.error("Error fetching exam data:", error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingExams = exams
    .filter(
      (exam) =>
        exam.status === "Scheduled" && new Date(exam.examDate) > new Date()
    )
    .sort(
      (a, b) =>
        new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
    )
    .slice(0, 5);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading exam data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Exams
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled in the future
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Grading
            </CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingGrading}</div>
            <p className="text-xs text-muted-foreground">
              Exams need grading
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Exams
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Fully graded exams
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Exams List */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Exams</CardTitle>
          <CardDescription>
            Next scheduled exams across all levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingExams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming exams scheduled
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{exam.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{exam.subject.name}</span>
                      <span>•</span>
                      <span>{exam.level.name}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="outline">{exam.type}</Badge>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(exam.examDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              ))}
              {upcomingExams.length > 0 && (
                <Link
                  href="/exams"
                  className="block text-center text-sm text-blue-600 hover:text-blue-800 pt-2"
                >
                  View all exams →
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
