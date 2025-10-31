/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Line,
  LineChart,
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
    color: 'hsl(var(--chart-1))',
  },
  absent: {
    label: 'Absent',
    color: 'hsl(var(--chart-2))',
  },
  late: {
    label: 'Late',
    color: 'hsl(var(--chart-3))',
  },
};

export function AttendanceTrendChart({ data }: AttendanceTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Trends</CardTitle>
        <CardDescription>Student attendance over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={attendanceChartConfig} className="h-[300px] w-full">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
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
            <Line
              type="monotone"
              dataKey="present"
              stroke="var(--color-present)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-present)' }}
            />
            <Line
              type="monotone"
              dataKey="absent"
              stroke="var(--color-absent)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-absent)' }}
            />
            <Line
              type="monotone"
              dataKey="late"
              stroke="var(--color-late)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-late)' }}
            />
          </LineChart>
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
    color: 'hsl(var(--chart-1))',
  },
};

export function EnrollmentByLevelChart({ data }: EnrollmentByLevelChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment by Level</CardTitle>
        <CardDescription>Student distribution across class levels</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={enrollmentChartConfig} className="h-[300px] w-full">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
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
    color: 'hsl(var(--chart-1))',
  },
  expenses: {
    label: 'Expenses',
    color: 'hsl(var(--chart-2))',
  },
};

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue and expenses comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
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

  const chartData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  const chartConfig = data.reduce((acc, item) => {
    acc[item.name] = {
      label: item.name,
      color: COLORS[data.indexOf(item) % COLORS.length],
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
    color: 'hsl(var(--chart-1))',
  },
  students: {
    label: 'Students',
    color: 'hsl(var(--chart-2))',
  },
  attendanceRate: {
    label: 'Attendance %',
    color: 'hsl(var(--chart-3))',
  },
};

export function TeacherPerformanceChart({ data }: TeacherPerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Overview</CardTitle>
        <CardDescription>Classes and student engagement by teacher</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={teacherChartConfig} className="h-[300px] w-full">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
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
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
