"use client";

import React, { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Archive, Trash2, RotateCcw } from 'lucide-react';

interface RelatedRecord {
  type: string;
  count: number;
}

interface DeletionOptions {
  type: 'SOFT_DELETE' | 'HARD_DELETE' | 'REASSIGN';
  deleteReason?: string;
  reassignTo?: string;
  cascade?: boolean;
}

interface ProgressiveDeletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'student' | 'teacher';
  entityName: string;
  entityId: string;
  relatedRecords?: RelatedRecord[];
  onConfirm: (options: DeletionOptions) => Promise<void>;
  isLoading?: boolean;
}

export function ProgressiveDeletionDialog({
  isOpen,
  onClose,
  entityType,
  entityName,
  entityId,
  relatedRecords = [],
  onConfirm,
  isLoading = false,
}: ProgressiveDeletionDialogProps) {
  const [selectedTab, setSelectedTab] = useState('soft-delete');
  const [deleteReason, setDeleteReason] = useState('');
  const [reassignTo, setReassignTo] = useState('');
  const [availableReassignees, setAvailableReassignees] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasRelatedRecords = relatedRecords.some(record => record.count > 0);
  const totalRelatedRecords = relatedRecords.reduce((sum, record) => sum + record.count, 0);

  // Fetch available reassignees when reassign tab is selected
  useEffect(() => {
    if (selectedTab === 'reassign' && entityType === 'teacher') {
      // Fetch available teachers for reassignment
      fetch(`/api/teachers?excludeId=${entityId}`)
        .then(res => res.json())
        .then(data => setAvailableReassignees(data.teachers || []))
        .catch(console.error);
    }
  }, [selectedTab, entityType, entityId]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    
    const options: DeletionOptions = {
      type: selectedTab === 'reassign' ? 'REASSIGN' : 
             selectedTab === 'hard-delete' ? 'HARD_DELETE' : 'SOFT_DELETE',
      deleteReason: deleteReason || undefined,
      reassignTo: selectedTab === 'reassign' ? reassignTo : undefined,
      cascade: selectedTab === 'hard-delete'
    };

    try {
      await onConfirm(options);
      onClose();
      // Reset form
      setDeleteReason('');
      setReassignTo('');
      setSelectedTab('soft-delete');
    } catch (error) {
      console.error('Deletion failed:', error);
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Delete {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
          </DialogTitle>
          <DialogDescription>
            You are about to delete <span className="font-semibold">{entityName}</span>. 
            {hasRelatedRecords && (
              <span className="text-orange-600">
                {' '}This action will affect {totalRelatedRecords} related records.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {hasRelatedRecords && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Related Records Found:</p>
                <div className="grid grid-cols-2 gap-2">
                  {relatedRecords.map((record, index) => (
                    record.count > 0 && (
                      <div key={index} className="flex justify-between items-center">
                        <span className="capitalize">{record.type.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <Badge variant="secondary">{record.count}</Badge>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="soft-delete" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Archive
            </TabsTrigger>
            {hasRelatedRecords && (
              <TabsTrigger value="reassign" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Reassign
              </TabsTrigger>
            )}
            <TabsTrigger value="hard-delete" className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-4 w-4" />
              Delete Permanently
            </TabsTrigger>
          </TabsList>

          <TabsContent value="soft-delete" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete-reason">Reason for Archiving</Label>
              <Select value={deleteReason} onValueChange={setDeleteReason}>
                <SelectTrigger>
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
            <p className="text-sm text-muted-foreground">
              The {entityType} will be archived and can be restored later if needed.
              This is the recommended option for most cases.
            </p>
          </TabsContent>

          {hasRelatedRecords && entityType === 'teacher' && (
            <TabsContent value="reassign" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reassign-to">Reassign To</Label>
                <Select value={reassignTo} onValueChange={setReassignTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableReassignees.map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reassign-reason">Reason for Reassignment</Label>
                <Textarea
                  id="reassign-reason"
                  placeholder="Explain why this teacher is being reassigned..."
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  rows={3}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                All classes, sections, and related records will be transferred to the selected teacher.
              </p>
            </TabsContent>
          )}

          <TabsContent value="hard-delete" className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This action cannot be undone. 
                {hasRelatedRecords && (
                  <span> All {totalRelatedRecords} related records will be permanently deleted.</span>
                )}
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="hard-delete-reason">Reason for Permanent Deletion</Label>
              <Textarea
                id="hard-delete-reason"
                placeholder="Please provide a detailed reason for permanent deletion..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                rows={3}
              />
            </div>
            <p className="text-sm text-destructive">
              This should only be used for removing duplicate or erroneous records.
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isSubmitting || (selectedTab === 'soft-delete' && !deleteReason) || (selectedTab === 'reassign' && (!reassignTo || !deleteReason))}
            variant={selectedTab === 'hard-delete' ? 'destructive' : 'default'}
          >
            {isSubmitting ? 'Processing...' : 
             selectedTab === 'reassign' ? 'Reassign' :
             selectedTab === 'hard-delete' ? 'Delete Permanently' : 'Archive'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}