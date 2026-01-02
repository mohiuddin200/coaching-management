"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Archive, Info } from 'lucide-react';

interface RelatedRecord {
  type: string;
  count: number;
}

interface DeletionOptions {
  deleteReason: string;
}

interface ProgressiveDeletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'student' | 'teacher';
  entityName: string;
  relatedRecords?: RelatedRecord[];
  onConfirm: (options: DeletionOptions) => Promise<void>;
}

export function ProgressiveDeletionDialog({
  isOpen,
  onClose,
  entityType,
  entityName,
  relatedRecords = [],
  onConfirm,
}: ProgressiveDeletionDialogProps) {
  const [deleteReason, setDeleteReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasRelatedRecords = relatedRecords.some(record => record.count > 0);
  const totalRelatedRecords = relatedRecords.reduce((sum, record) => sum + record.count, 0);

  const handleConfirm = async () => {
    if (!deleteReason) return;

    setIsSubmitting(true);

    try {
      await onConfirm({ deleteReason });
      onClose();
      setDeleteReason('');
    } catch (error) {
      console.error('Archive failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDeleteReasonOptions = () => {
    if (entityType === 'student') {
      return [
        { value: 'GRADUATED', label: 'Graduated' },
        { value: 'TRANSFERRED', label: 'Transferred' },
        { value: 'ERROR', label: 'Data Entry Error' },
        { value: 'OTHER', label: 'Other' }
      ];
    } else {
      return [
        { value: 'RESIGNED', label: 'Resigned' },
        { value: 'TERMINATED', label: 'Terminated' },
        { value: 'REASSIGNED', label: 'Reassigned' },
        { value: 'ERROR', label: 'Data Entry Error' },
        { value: 'OTHER', label: 'Other' }
      ];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Archive className="h-5 w-5 text-blue-500" />
            Archive {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
          </DialogTitle>
          <DialogDescription className="text-base">
            Archive <span className="font-semibold">{entityName}</span> from the system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {hasRelatedRecords && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">This {entityType} has {totalRelatedRecords} related record(s)</p>
                  <div className="grid grid-cols-2 gap-2">
                    {relatedRecords.map((record, index) => (
                      record.count > 0 && (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="capitalize text-muted-foreground">
                            {record.type.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <Badge variant="secondary">{record.count}</Badge>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="delete-reason">Reason for archiving</Label>
            <Select value={deleteReason} onValueChange={setDeleteReason}>
              <SelectTrigger id="delete-reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {getDeleteReasonOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              The {entityType} will be archived and can be restored later if needed.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || !deleteReason}
          >
            {isSubmitting ? 'Archiving...' : 'Archive'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}