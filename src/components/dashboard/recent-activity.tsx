'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Clock, 
  UserPlus, 
  BookOpen, 
  CalendarCheck,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentStudent {
  id: string;
  firstName: string;
  lastName: string;
  level?: string;
  enrollmentDate: Date | string;
  status: string;
}

interface RecentStudentsProps {
  students: RecentStudent[];
}

export function RecentStudents({ students }: RecentStudentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Enrollments</CardTitle>
        <CardDescription>Latest students added to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent enrollments
            </p>
          ) : (
            students.map((student) => (
              <div key={student.id} className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {student.firstName[0]}{student.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {student.level || 'No level assigned'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
                    {student.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(student.enrollmentDate), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface RecentClass {
  id: string;
  name: string;
  subject: string;
  teacher: string;
  level: string;
  enrollmentCount: number;
  capacity: number;
  status: string;
}

interface RecentClassesProps {
  classes: RecentClass[];
}

export function RecentClasses({ classes }: RecentClassesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Class Sections</CardTitle>
        <CardDescription>Currently scheduled classes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {classes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active class sections
            </p>
          ) : (
            classes.map((classSection) => (
              <div key={classSection.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {classSection.level} - {classSection.subject}
                    </p>
                    <Badge variant={classSection.status === 'Scheduled' ? 'default' : 'secondary'} className="ml-2">
                      {classSection.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {classSection.name} • {classSection.teacher}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(classSection.enrollmentCount / classSection.capacity) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {classSection.enrollmentCount}/{classSection.capacity}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface Activity {
  id: string;
  type: 'enrollment' | 'attendance' | 'class' | 'teacher';
  title: string;
  description: string;
  timestamp: Date | string;
  status?: 'success' | 'warning' | 'error';
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: Activity['type'], status?: Activity['status']) => {
    if (status === 'success') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === 'error') return <XCircle className="h-4 w-4 text-red-500" />;
    if (status === 'warning') return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    
    switch (type) {
      case 'enrollment':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'attendance':
        return <CalendarCheck className="h-4 w-4 text-green-500" />;
      case 'class':
        return <BookOpen className="h-4 w-4 text-purple-500" />;
      case 'teacher':
        return <UserPlus className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest system activities and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  {getIcon(activity.type, activity.status)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface UpcomingClass {
  id: string;
  name: string;
  subject: string;
  teacher: string;
  time: string;
  room?: string;
  enrollmentCount: number;
}

interface UpcomingClassesProps {
  classes: UpcomingClass[];
}

export function UpcomingClasses({ classes }: UpcomingClassesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Schedule</CardTitle>
        <CardDescription>Upcoming classes for today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {classes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No classes scheduled for today
            </p>
          ) : (
            classes.map((classItem) => (
              <div key={classItem.id} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-xs font-medium mt-1 text-center">
                    {classItem.time}
                  </p>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {classItem.subject}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {classItem.name} • {classItem.teacher}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {classItem.room && (
                      <span>Room: {classItem.room}</span>
                    )}
                    <span>•</span>
                    <span>{classItem.enrollmentCount} students</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
