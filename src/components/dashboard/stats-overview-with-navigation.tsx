'use client';

import { useRouter } from 'next/navigation';
import { StatsOverview } from '@/components/dashboard/stats-cards';

interface StatsOverviewWithNavigationProps {
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
}

export function StatsOverviewWithNavigation({ stats, trends }: StatsOverviewWithNavigationProps) {
  const router = useRouter();

  const handleCardClick = (cardType: 'students' | 'teachers' | 'classes' | 'attendance') => {
    switch (cardType) {
      case 'students':
        router.push('/students');
        break;
      case 'teachers':
        router.push('/teachers');
        break;
      case 'classes':
        router.push('/classes');
        break;
      case 'attendance':
        router.push('/attendance');
        break;
    }
  };

  return (
    <StatsOverview
      stats={stats}
      trends={trends}
      onCardClick={handleCardClick}
    />
  );
}