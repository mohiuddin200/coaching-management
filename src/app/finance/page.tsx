"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Wallet,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Stats {
  totalRevenue: number;
  totalExpenses: number;
  totalOutstanding: number;
  netProfit: number;
}

interface PaymentStatus {
  status: string;
  _count: {
    status: number;
  };
}

interface ExpenseCategory {
  category: string;
  _sum: {
    amount: number;
  };
}

interface RecentPayment {
  id: string;
  amount: number;
  paymentDate: string;
  status: string;
  monthYear: string;
  student: {
    firstName: string;
    lastName: string;
  };
}

export default function FinancePage() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalExpenses: 0,
    totalOutstanding: 0,
    netProfit: 0,
  });
  const [paymentStatusCounts, setPaymentStatusCounts] = useState<
    PaymentStatus[]
  >([]);
  const [expensesByCategory, setExpensesByCategory] = useState<
    ExpenseCategory[]
  >([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/finance/stats");
      const data = await response.json();

      setStats(data.stats);
      setPaymentStatusCounts(data.paymentStatusCounts || []);
      setExpensesByCategory(data.expensesByCategory || []);
      setRecentPayments(data.recentPayments || []);
    } catch (error) {
      console.error("Error fetching finance stats:", error);
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

  const statusColors: Record<string, string> = {
    Paid: "#10b981",
    Pending: "#f59e0b",
    Overdue: "#ef4444",
    Cancelled: "#6b7280",
  };

  const expenseCategoryColors = [
    "#8b5cf6",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#14b8a6",
    "#f97316",
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Finance Dashboard
            </h1>
            <p className="text-muted-foreground">
              Overview of revenue, expenses, and payments
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/finance/payments">
              <Button>
                <DollarSign className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </Link>
            <Link href="/finance/fees">
              <Button variant="outline">
                Manage Fee Structures
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue (This Month)
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                From student payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses (This Month)
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : formatCurrency(stats.totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                All categories combined
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Outstanding Dues
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : formatCurrency(stats.totalOutstanding)}
              </div>
              <p className="text-xs text-muted-foreground">
                Pending & overdue payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Net Profit (This Month)
              </CardTitle>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  stats.netProfit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {loading ? "..." : formatCurrency(stats.netProfit)}
              </div>
              <p className="text-xs text-muted-foreground">
                Revenue minus expenses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Expenses by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <CardDescription>
                Breakdown of expenses for current month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expensesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesByCategory.map((e) => ({
                        category: e.category,
                        amount: e._sum.amount || 0,
                      }))}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(props: { index: number }) => {
                        const entry = expensesByCategory[props.index];
                        return `${entry.category}: ${formatCurrency(entry._sum.amount || 0)}`;
                      }}
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            expenseCategoryColors[
                              index % expenseCategoryColors.length
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No expense data for this month
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Status Distribution</CardTitle>
              <CardDescription>Current status of all payments</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentStatusCounts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={paymentStatusCounts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="_count.status"
                      name="Count"
                      fill="#8b5cf6"
                      radius={[8, 8, 0, 0]}
                    >
                      {paymentStatusCounts.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={statusColors[entry.status] || "#8b5cf6"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No payment data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest 10 student payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left text-sm font-medium">
                        Student
                      </th>
                      <th className="pb-3 text-left text-sm font-medium">
                        Amount
                      </th>
                      <th className="pb-3 text-left text-sm font-medium">
                        Month/Year
                      </th>
                      <th className="pb-3 text-left text-sm font-medium">
                        Payment Date
                      </th>
                      <th className="pb-3 text-left text-sm font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((payment) => (
                      <tr key={payment.id} className="border-b">
                        <td className="py-3 text-sm">
                          {payment.student.firstName} {payment.student.lastName}
                        </td>
                        <td className="py-3 text-sm font-medium">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="py-3 text-sm">{payment.monthYear}</td>
                        <td className="py-3 text-sm">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-sm">
                          <span
                            className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                            style={{
                              backgroundColor:
                                statusColors[payment.status] + "20",
                              color: statusColors[payment.status],
                            }}
                          >
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No recent payments found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
