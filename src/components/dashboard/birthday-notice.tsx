'use client';

import { Card } from '@/components/ui/card';
import { Cake, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface BirthdayStudent {
  id: string;
  firstName: string;
  lastName: string;
  level: string;
  age: number;
  profileImage?: string;
}

interface BirthdayNoticeProps {
  students: BirthdayStudent[];
}

export function BirthdayNotice({ students }: BirthdayNoticeProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!students.length || !isVisible) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden border-none bg-linear-to-r from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-blue-950/20">
      <div className="flex items-center gap-3 p-3 md:p-4">
        {/* Icon */}
        <div className="shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-pink-500 to-purple-600">
            <Cake className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              🎉 Birthday Today!
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {students.map((student, index) => (
                <div key={student.id} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-muted-foreground">•</span>}
                  <div className="inline-flex items-center gap-1.5">
                    <span className="font-medium text-foreground">
                      {student.firstName} {student.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({student.level}, {student.age} years)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8 rounded-full hover:bg-background/50"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </Card>
  );
}
