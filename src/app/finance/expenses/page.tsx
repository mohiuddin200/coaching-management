"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FullPaginationTable } from "@/components/table/FullPaginationTable";
import { AddExpenseDialog } from "@/components/finance/add-expense-dialog";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Expense {
  id: string;
  category: string;
  amount: number;
  expenseDate: string;
  description: string;
  vendor: string | null;
  receiptNo: string | null;
  createdAt: string;
  isSmsLog?: boolean;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const url =
        categoryFilter === "all"
          ? "/api/finance/expenses"
          : `/api/finance/expenses?category=${categoryFilter}`;
      const response = await fetch(url);
      const data = await response.json();
      setExpenses(data.data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
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

  const getCategoryColor = (
    category: string
  ): "default" | "secondary" | "outline" => {
    const colors: Record<string, "default" | "secondary" | "outline"> = {
      Salary: "default",
      Rent: "secondary",
      Utilities: "secondary",
      SMS: "outline",
      Marketing: "secondary",
      Supplies: "outline",
      Maintenance: "secondary",
      Equipment: "secondary",
      Other: "outline",
    };
    return colors[category] || "outline";
  };

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant={getCategoryColor(row.getValue("category"))}>
          {row.getValue("category")}
        </Badge>
      ),
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
      accessorKey: "expenseDate",
      header: "Expense Date",
      cell: ({ row }) => (
        <div>
          {new Date(row.getValue("expenseDate")).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-md truncate text-sm" title={description}>
            {description}
          </div>
        );
      },
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }) => {
        const vendor = row.getValue("vendor");
        return vendor ? (
          <span className="text-sm">{vendor as string}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "receiptNo",
      header: "Receipt",
      cell: ({ row }) => {
        const receiptNo = row.getValue("receiptNo");
        const isSmsLog = row.original.isSmsLog;
        return receiptNo ? (
          <span className="font-mono text-sm">{receiptNo as string}</span>
        ) : isSmsLog ? (
          <Badge variant="outline" className="text-xs">
            SMS Log
          </Badge>
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
            <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground">
              Track and manage all business expenses
            </p>
          </div>
          <AddExpenseDialog onCreated={fetchExpenses} />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Salary">Salary</SelectItem>
              <SelectItem value="Rent">Rent</SelectItem>
              <SelectItem value="Utilities">Utilities</SelectItem>
              <SelectItem value="SMS">SMS (includes SMS logs)</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Supplies">Supplies</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Equipment">Equipment</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-muted-foreground">Loading expenses...</div>
          </div>
        ) : (
          <FullPaginationTable
            columns={columns}
            data={expenses}
            filterColumn="description"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
