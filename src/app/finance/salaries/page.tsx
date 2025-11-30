"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FullPaginationTable } from "@/components/table/FullPaginationTable";
import { RecordSalaryDialog } from "@/components/finance/record-salary-dialog";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

interface TeacherPayment {
  id: string;
  amount: number;
  paymentDate: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  description: string | null;
  receiptNo: string | null;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    salary: number | null;
    paymentType: string | null;
  };
  createdAt: string;
}

export default function TeacherSalariesPage() {
  const [payments, setPayments] = useState<TeacherPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/finance/teacher-payments");
      const data = await response.json();
      setPayments(data.data || []);
    } catch (error) {
      console.error("Error fetching teacher payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns: ColumnDef<TeacherPayment>[] = [
    {
      accessorKey: "teacher",
      header: "Teacher",
      cell: ({ row }) => {
        const teacher = row.original.teacher;
        return (
          <div>
            <div className="font-medium">
              {teacher.firstName} {teacher.lastName}
            </div>
            <div className="text-sm text-muted-foreground">
              {teacher.paymentType || "Not specified"}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="font-semibold">
          {formatCurrency(row.getValue("amount"))}
        </div>
      ),
    },
    {
      accessorKey: "paymentDate",
      header: "Payment Date",
      cell: ({ row }) => (
        <div>
          {new Date(row.getValue("paymentDate")).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "periodStart",
      header: "Period",
      cell: ({ row }) => {
        const start = new Date(row.original.periodStart);
        const end = new Date(row.original.periodEnd);
        return (
          <div className="text-sm">
            {start.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {end.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <Badge variant="default">{status}</Badge>;
      },
    },
    {
      accessorKey: "receiptNo",
      header: "Receipt",
      cell: ({ row }) => {
        const receiptNo = row.getValue("receiptNo");
        return receiptNo ? (
          <span className="font-mono text-sm">{receiptNo as string}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description");
        return description ? (
          <span className="text-sm">{description as string}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Teacher Salaries
            </h1>
            <p className="text-muted-foreground">
              Manage teacher salary payments
            </p>
          </div>
          <RecordSalaryDialog onCreated={fetchPayments} />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-muted-foreground">Loading salary payments...</div>
          </div>
        ) : (
          <FullPaginationTable
            columns={columns}
            data={payments}
            filterColumn="teacher"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
