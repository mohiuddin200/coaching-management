'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CalendarCheck, 
  TrendingUp, 
  TrendingDown,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  onClick?: () => void;
}

export function StatCard({ title, value, description, icon: Icon, trend, color = 'text-primary', onClick }: StatCardProps) {
  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer hover:bg-accent/5"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2 text-xs">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={trend.isPositive ? 'text-green-500' : 'text-red-500'}>
              {Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsOverviewProps {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    attendanceToday: number;
    activeEnrollments: number;
    monthlyRevenue: number;
  };
  trends?: {
    students: number;
    teachers: number;
    classes: number;
    attendance: number;
  };
  onCardClick?: (cardType: 'students' | 'teachers' | 'classes' | 'attendance') => void;
}

export function StatsOverview({ stats, trends, onCardClick }: StatsOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Students"
        value={stats.totalStudents}
        description={`${stats.activeEnrollments} active enrollments`}
        icon={GraduationCap}
        trend={trends?.students ? {
          value: trends.students,
          isPositive: trends.students > 0
        } : undefined}
        color="text-blue-500"
        onClick={() => onCardClick?.('students')}
      />

      <StatCard
        title="Total Teachers"
        value={stats.totalTeachers}
        description="Active teaching staff"
        icon={Users}
        trend={trends?.teachers ? {
          value: trends.teachers,
          isPositive: trends.teachers > 0
        } : undefined}
        color="text-purple-500"
        onClick={() => onCardClick?.('teachers')}
      />

      <StatCard
        title="Class Sections"
        value={stats.totalClasses}
        description="Active class sections"
        icon={BookOpen}
        trend={trends?.classes ? {
          value: trends.classes,
          isPositive: trends.classes > 0
        } : undefined}
        color="text-green-500"
        onClick={() => onCardClick?.('classes')}
      />

      <StatCard
        title="Today's Attendance"
        value={`${stats.attendanceToday}%`}
        description="Student attendance rate"
        icon={CalendarCheck}
        trend={trends?.attendance ? {
          value: trends.attendance,
          isPositive: trends.attendance > 0
        } : undefined}
        color="text-orange-500"
        onClick={() => onCardClick?.('attendance')}
      />
    </div>
  );
}

interface AttendanceStatsProps {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  onCardClick?: (status: 'present' | 'absent' | 'late' | 'excused') => void;
}

export function AttendanceStats({ present, absent, late, excused, total, onCardClick }: AttendanceStatsProps) {
  const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;
  const absentPercentage = total > 0 ? Math.round((absent / total) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card
        className="hover:shadow-md transition-shadow cursor-pointer hover:bg-accent/5"
        onClick={() => onCardClick?.('present')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Present</CardTitle>
          <UserCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{present}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {presentPercentage}% of total students
          </p>
        </CardContent>
      </Card>

      <Card
        className="hover:shadow-md transition-shadow cursor-pointer hover:bg-accent/5"
        onClick={() => onCardClick?.('absent')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Absent</CardTitle>
          <UserX className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{absent}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {absentPercentage}% of total students
          </p>
        </CardContent>
      </Card>

      <Card
        className="hover:shadow-md transition-shadow cursor-pointer hover:bg-accent/5"
        onClick={() => onCardClick?.('late')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Late</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{late}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Arrived after schedule
          </p>
        </CardContent>
      </Card>

      <Card
        className="hover:shadow-md transition-shadow cursor-pointer hover:bg-accent/5"
        onClick={() => onCardClick?.('excused')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Excused</CardTitle>
          <CalendarCheck className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{excused}</div>
          <p className="text-xs text-muted-foreground mt-1">
            With valid reason
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface QuickStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    icon: LucideIcon;
    color?: string;
    id?: string;
  }>;
  onCardClick?: (statId: string, index: number) => void;
}

export function QuickStats({ stats, onCardClick }: QuickStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="hover:shadow-md transition-shadow cursor-pointer hover:bg-accent/5"
          onClick={() => onCardClick?.(stat.id || `stat-${index}`, index)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color || 'text-primary'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
