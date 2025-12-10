'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
} from 'recharts';

interface AttendanceTrendData {
  date: string;
  present: number;
  absent: number;
  late: number;
}

interface AttendanceTrendChartProps {
  data: AttendanceTrendData[];
}

const attendanceChartConfig = {
  present: {
    label: 'Present',
    color: 'hsl(142 76% 36%)',
  },
  absent: {
    label: 'Absent',
    color: 'hsl(0 84% 60%)',
  },
  late: {
    label: 'Late',
    color: 'hsl(var(--chart-3))',
  },
};

export function AttendanceTrendChart({ data }: AttendanceTrendChartProps) {
  // Ensure data is mutable and safe to use
  const chartData = Array.isArray(data) ? [...data] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Trends</CardTitle>
        <CardDescription>Student attendance over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={attendanceChartConfig} className="h-[300px] w-full">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="present"
              fill="var(--color-present)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="absent"
              fill="var(--color-absent)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

interface EnrollmentData {
  level: string;
  students: number;
}

interface EnrollmentByLevelChartProps {
  data: EnrollmentData[];
}

const enrollmentChartConfig = {
  students: {
    label: 'Students',
    color: 'hsl(217 91% 60%)',
  },
};

export function EnrollmentByLevelChart({ data }: EnrollmentByLevelChartProps) {
  const chartData = Array.isArray(data) ? [...data] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment by Level</CardTitle>
        <CardDescription>Student distribution across class levels</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={enrollmentChartConfig} className="h-[300px] w-full">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="level"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="students"
              fill="var(--color-students)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

const revenueChartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(142 76% 36%)',
  },
  expenses: {
    label: 'Expenses',
    color: 'hsl(0 84% 60%)',
  },
};

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = Array.isArray(data) ? [...data] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue and expenses comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              fill="var(--color-revenue)"
              fillOpacity={0.2}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="var(--color-expenses)"
              fill="var(--color-expenses)"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

interface ClassDistributionData {
  name: string;
  value: number;
  fill: string;
}

interface ClassDistributionChartProps {
  data: ClassDistributionData[];
}

export function ClassDistributionChart({ data }: ClassDistributionChartProps) {
  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  // Ensure data is mutable and safe to use
  const safeData = Array.isArray(data) ? [...data] : [];
  const chartData = safeData.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  const chartConfig = safeData.reduce((acc, item) => {
    acc[item.name] = {
      label: item.name,
      color: COLORS[safeData.indexOf(item) % COLORS.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Status Distribution</CardTitle>
        <CardDescription>Distribution of class sections by status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

interface TeacherPerformanceData {
  teacher: string;
  classes: number;
  students: number;
  attendanceRate: number;
}

interface TeacherPerformanceChartProps {
  data: TeacherPerformanceData[];
}

const teacherChartConfig = {
  classes: {
    label: 'Classes',
    color: 'hsl(217 91% 60%)',
  },
  students: {
    label: 'Students',
    color: 'hsl(142 76% 36%)',
  },
  attendanceRate: {
    label: 'Attendance %',
    color: 'hsl(38 92% 50%)',
  },
};

export function TeacherPerformanceChart({ data }: TeacherPerformanceChartProps) {
  const chartData = Array.isArray(data) ? [...data] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Overview</CardTitle>
        <CardDescription>Classes and student engagement by teacher</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={teacherChartConfig} className="h-[300px] w-full">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="teacher"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="classes" fill="var(--color-classes)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="students" fill="var(--color-students)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="attendanceRate" fill="var(--color-attendanceRate)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
