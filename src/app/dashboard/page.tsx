import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsOverviewWithNavigation } from "@/components/dashboard/stats-overview-with-navigation";
import { BirthdayNotice } from "@/components/dashboard/birthday-notice";
import { ChartWrapper } from "@/components/dashboard/charts-wrapper";
import {
  RecentStudents,
  RecentClasses,
  RecentActivity,
  UpcomingClasses
} from "@/components/dashboard/recent-activity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  // Mock data - will be replaced with real data from API
  const stats = {
    totalStudents: 245,
    totalTeachers: 18,
    totalClasses: 42,
    attendanceToday: 87,
    activeEnrollments: 487,
    monthlyRevenue: 125000,
  };

  const trends = {
    students: 12,
    teachers: 5,
    classes: 8,
    attendance: 3,
  };

  const attendanceTrendData = [
    { date: 'Mon', present: 220, absent: 15, late: 10 },
    { date: 'Tue', present: 225, absent: 12, late: 8 },
    { date: 'Wed', present: 218, absent: 18, late: 9 },
    { date: 'Thu', present: 230, absent: 10, late: 5 },
    { date: 'Fri', present: 228, absent: 12, late: 5 },
    { date: 'Sat', present: 215, absent: 20, late: 10 },
    { date: 'Sun', present: 210, absent: 22, late: 13 },
  ];

  const enrollmentByLevelData = [
    { level: 'Class 1', students: 28 },
    { level: 'Class 2', students: 32 },
    { level: 'Class 3', students: 25 },
    { level: 'Class 4', students: 30 },
    { level: 'Class 5', students: 27 },
    { level: 'Class 6', students: 24 },
    { level: 'Class 7', students: 22 },
    { level: 'Class 8', students: 20 },
    { level: 'Class 9', students: 19 },
    { level: 'Class 10', students: 18 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 110000, expenses: 75000 },
    { month: 'Feb', revenue: 115000, expenses: 78000 },
    { month: 'Mar', revenue: 120000, expenses: 80000 },
    { month: 'Apr', revenue: 118000, expenses: 77000 },
    { month: 'May', revenue: 122000, expenses: 79000 },
    { month: 'Jun', revenue: 125000, expenses: 81000 },
  ];

  const classDistributionData = [
    { name: 'Scheduled', value: 35, fill: 'hsl(var(--chart-1))' },
    { name: 'In Progress', value: 7, fill: 'hsl(var(--chart-2))' },
    { name: 'Completed', value: 150, fill: 'hsl(var(--chart-3))' },
    { name: 'Cancelled', value: 8, fill: 'hsl(var(--chart-4))' },
  ];

  const teacherPerformanceData = [
    { teacher: 'John D.', classes: 5, students: 120, attendanceRate: 92 },
    { teacher: 'Sarah M.', classes: 4, students: 95, attendanceRate: 88 },
    { teacher: 'Mike R.', classes: 6, students: 142, attendanceRate: 85 },
    { teacher: 'Emily S.', classes: 3, students: 78, attendanceRate: 90 },
    { teacher: 'David L.', classes: 4, students: 98, attendanceRate: 87 },
  ];

  const recentStudents = [
    {
      id: '1',
      firstName: 'Ahmed',
      lastName: 'Rahman',
      level: 'Class 8',
      enrollmentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'Active',
    },
    {
      id: '2',
      firstName: 'Fatima',
      lastName: 'Khan',
      level: 'Class 6',
      enrollmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'Active',
    },
    {
      id: '3',
      firstName: 'Mohammad',
      lastName: 'Ali',
      level: 'Class 9',
      enrollmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'Active',
    },
    {
      id: '4',
      firstName: 'Ayesha',
      lastName: 'Hossain',
      level: 'Class 7',
      enrollmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'Active',
    },
  ];

  const recentClasses = [
    {
      id: '1',
      name: 'Section A',
      subject: 'Mathematics',
      teacher: 'John Doe',
      level: 'Class 8',
      enrollmentCount: 28,
      capacity: 30,
      status: 'Scheduled',
    },
    {
      id: '2',
      name: 'Morning Batch',
      subject: 'English',
      teacher: 'Sarah Miller',
      level: 'Class 9',
      enrollmentCount: 25,
      capacity: 30,
      status: 'Scheduled',
    },
    {
      id: '3',
      name: 'Section B',
      subject: 'Physics',
      teacher: 'Mike Roberts',
      level: 'Class 10',
      enrollmentCount: 22,
      capacity: 25,
      status: 'InProgress',
    },
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'enrollment' as const,
      title: 'New Student Enrolled',
      description: 'Ahmed Rahman enrolled in Class 8',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'success' as const,
    },
    {
      id: '2',
      type: 'attendance' as const,
      title: 'Attendance Marked',
      description: 'Class 8 Math - 28/30 students present',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'success' as const,
    },
    {
      id: '3',
      type: 'class' as const,
      title: 'Class Scheduled',
      description: 'New Physics class section created for Class 10',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
    {
      id: '4',
      type: 'attendance' as const,
      title: 'Low Attendance Alert',
      description: 'Class 9 English - Only 18/25 students present',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      status: 'warning' as const,
    },
  ];

  const upcomingClasses = [
    {
      id: '1',
      name: 'Section A',
      subject: 'Mathematics',
      teacher: 'John Doe',
      time: '09:00 AM',
      room: '101',
      enrollmentCount: 28,
    },
    {
      id: '2',
      name: 'Morning Batch',
      subject: 'English',
      teacher: 'Sarah Miller',
      time: '10:30 AM',
      room: '203',
      enrollmentCount: 25,
    },
    {
      id: '3',
      name: 'Section B',
      subject: 'Physics',
      teacher: 'Mike Roberts',
      time: '02:00 PM',
      room: '305',
      enrollmentCount: 22,
    },
    {
      id: '4',
      name: 'Evening Batch',
      subject: 'Chemistry',
      teacher: 'Emily Smith',
      time: '04:30 PM',
      room: '402',
      enrollmentCount: 20,
    },
  ];

  // Mock birthday students - will be replaced with real data
  const birthdayStudents = [
    {
      id: '1',
      firstName: 'Fatima',
      lastName: 'Khan',
      level: 'Class 8',
      age: 14,
    },
    {
      id: '2',
      firstName: 'Ahmed',
      lastName: 'Rahman',
      level: 'Class 6',
      age: 12,
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        {/* Birthday Notice */}
        <BirthdayNotice students={birthdayStudents} />

        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.user_metadata.first_name || user.email}! Here&apos;s what&apos;s happening today.
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverviewWithNavigation stats={stats} trends={trends} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Charts Row 1 */}
            <div className="grid gap-4 md:grid-cols-2">
              <ChartWrapper type="attendance" data={attendanceTrendData} />
              <ChartWrapper type="enrollment" data={enrollmentByLevelData} />
            </div>

            {/* Recent Items Row */}
            <div className="grid gap-4 md:grid-cols-2">
              <UpcomingClasses classes={upcomingClasses} />
              <RecentStudents students={recentStudents} />
            </div>

            {/* Active Classes */}
            <RecentClasses classes={recentClasses} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {/* Analytics Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              <ChartWrapper type="revenue" data={revenueData} />
              <ChartWrapper type="classDistribution" data={classDistributionData} />
            </div>

            <ChartWrapper type="teacherPerformance" data={teacherPerformanceData} />

            <div className="grid gap-4 md:grid-cols-2">
              <ChartWrapper type="attendance" data={attendanceTrendData} />
              <ChartWrapper type="enrollment" data={enrollmentByLevelData} />
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <RecentActivity activities={recentActivity} />
              <UpcomingClasses classes={upcomingClasses} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <RecentStudents students={recentStudents} />
              <RecentClasses classes={recentClasses} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
