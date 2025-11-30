"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FullPaginationTable } from "@/components/table/FullPaginationTable";
import { RecordPaymentDialog } from "@/components/finance/record-payment-dialog";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudentPayment {
  id: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: string;
  monthYear: string;
  description: string | null;
  receiptNo: string | null;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    level: {
      name: string;
      levelNumber: number;
    };
  };
  createdAt: string;
}

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter === "all"
          ? "/api/finance/student-payments"
          : `/api/finance/student-payments?status=${statusFilter}`;
      const response = await fetch(url);
      const data = await response.json();
      setPayments(data.data || []);
    } catch (error) {
      console.error("Error fetching student payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Paid: "default",
      Pending: "secondary",
      Overdue: "destructive",
      Cancelled: "secondary",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>{status}</Badge>
    );
  };

  const columns: ColumnDef<StudentPayment>[] = [
    {
      accessorKey: "student",
      header: "Student",
      cell: ({ row }) => {
        const student = row.original.student;
        return (
          <div>
            <div className="font-medium">
              {student.firstName} {student.lastName}
            </div>
            <div className="text-sm text-muted-foreground">
              {student.level.name}
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
      accessorKey: "monthYear",
      header: "Month/Year",
      cell: ({ row }) => {
        const monthYear = row.getValue("monthYear") as string;
        const [year, month] = monthYear.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return (
          <div>
            {date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </div>
        );
      },
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
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => (
        <div>{new Date(row.getValue("dueDate")).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
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
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Student Payments
            </h1>
            <p className="text-muted-foreground">
              Track and manage student fee payments
            </p>
          </div>
          <RecordPaymentDialog onCreated={fetchPayments} />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-muted-foreground">Loading payments...</div>
          </div>
        ) : (
          <FullPaginationTable
            columns={columns}
            data={payments}
            filterColumn="student"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
