"use client";

import { useState } from "react";
import { CreateExamDialog } from "@/components/exams/create-exam-dialog";
import { ExamsList } from "@/components/exams/exams-list";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function ExamsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleExamCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Exam Management</h1>
            <p className="text-muted-foreground mt-1">
              Create, schedule, and grade exams for your students
            </p>
          </div>
          <CreateExamDialog onCreated={handleExamCreated} />
        </div>

        <ExamsList refreshTrigger={refreshTrigger} />
      </div>
    </DashboardLayout>
  );
}
