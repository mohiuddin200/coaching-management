'use client';

import { Suspense } from 'react';
import {
  AttendanceTrendChart,
  EnrollmentByLevelChart,
  RevenueChart,
  ClassDistributionChart,
  TeacherPerformanceChart
} from './charts';

interface ChartWrapperProps {
  type: 'attendance' | 'enrollment' | 'revenue' | 'classDistribution' | 'teacherPerformance';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export function ChartWrapper({ type, data }: ChartWrapperProps) {
  // Create a deep copy of the data to ensure it's mutable
  const safeData = JSON.parse(JSON.stringify(data));

  const renderChart = () => {
    switch (type) {
      case 'attendance':
        return <AttendanceTrendChart data={safeData} />;
      case 'enrollment':
        return <EnrollmentByLevelChart data={safeData} />;
      case 'revenue':
        return <RevenueChart data={safeData} />;
      case 'classDistribution':
        return <ClassDistributionChart data={safeData} />;
      case 'teacherPerformance':
        return <TeacherPerformanceChart data={safeData} />;
      default:
        return null;
    }
  };

  return (
    <Suspense fallback={<div className="h-[300px] w-full animate-pulse bg-muted rounded-lg" />}>
      {renderChart()}
    </Suspense>
  );
}