"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Archive, RotateCcw, Trash2, Users, UserCheck } from 'lucide-react';
import { ProgressiveDeletionDialog } from '@/components/deletion/progressive-deletion-dialog';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

interface ArchivedStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  deletedAt: string;
  deletedBy?: string;
  deleteReason?: string;
  level?: { name: string };
}

interface ArchivedTeacher {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  deletedAt: string;
  deletedBy?: string;
  deleteReason?: string;
  subject?: string;
  qualifications?: string;
}

export default function ArchivePage() {
  const [activeTab, setActiveTab] = useState('students');
  const [archivedStudents, setArchivedStudents] = useState<ArchivedStudent[]>([]);
  const [archivedTeachers, setArchivedTeachers] = useState<ArchivedTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'student' | 'teacher'; name: string; id: string } | null>(null);
  const [showDeletionDialog, setShowDeletionDialog] = useState(false);

  const fetchArchivedData = async (page: number = 1) => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'students' ? 'students' : 'teachers';
      const response = await fetch(`/api/archive/${endpoint}?page=${page}&limit=10`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (activeTab === 'students') {
          setArchivedStudents(data.students || []);
          setTotalPages(data.totalPages || 1);
        } else {
          setArchivedTeachers(data.teachers || []);
          setTotalPages(data.totalPages || 1);
        }
      }
    } catch (error) {
      console.error('Failed to fetch archived data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedData(currentPage);
  }, [activeTab, currentPage]);

  const handleRestore = async (entityId: string) => {
    try {
      const endpoint = activeTab === 'students' ? 'students' : 'teachers';
      const response = await fetch(`/api/${endpoint}/${entityId}/restore`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh the data
        fetchArchivedData(currentPage);
      }
    } catch (error) {
      console.error('Failed to restore:', error);
    }
  };

  const handlePermanentDelete = async (entityId: string) => {
    try {
      const endpoint = activeTab === 'students' ? 'students' : 'teachers';
      const response = await fetch(`/api/${endpoint}/${entityId}?cascade=true`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the data
        fetchArchivedData(currentPage);
      }
    } catch (error) {
      console.error('Failed to permanently delete:', error);
    }
  };

  const filteredStudents = archivedStudents.filter(student =>
    `${student.firstName} ${student.lastName} ${student.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeachers = archivedTeachers.filter(teacher =>
    `${teacher.firstName} ${teacher.lastName} ${teacher.email || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentData = activeTab === 'students' ? filteredStudents : filteredTeachers;
  const currentEntity = activeTab === 'students' ? 'student' : 'teacher';

  return (
    <DashboardLayout>
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Archive Management</h1>
          <p className="text-muted-foreground">
            View and manage archived {activeTab === 'students' ? 'students' : 'teachers'}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Teachers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Archived Students
              </CardTitle>
              <CardDescription>
                Students who have been archived and can be restored or permanently deleted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search archived students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Deleted Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentData.map((entity) => (
                        <TableRow key={entity.id}>
                          <TableCell className="font-medium">
                            {entity.firstName} {entity.lastName}
                          </TableCell>
                          <TableCell>{entity.email}</TableCell>
                          <TableCell>
                            {'level' in entity && entity.level?.name && (
                              <Badge variant="secondary">{entity.level.name}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {entity.deletedAt && format(new Date(entity.deletedAt), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            {entity.deleteReason && (
                              <Badge variant="outline">{entity.deleteReason}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestore(entity.id)}
                                className="flex items-center gap-1"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Restore
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedEntity({
                                    type: 'student',
                                    name: `${entity.firstName} ${entity.lastName}`,
                                    id: entity.id
                                  });
                                  setShowDeletionDialog(true);
                                }}
                                className="flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {currentData.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No archived {activeTab} found
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Archived Teachers
              </CardTitle>
              <CardDescription>
                Teachers who have been archived and can be restored or permanently deleted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search archived teachers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Deleted Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentData.map((entity) => (
                        <TableRow key={entity.id}>
                          <TableCell className="font-medium">
                            {entity.firstName} {entity.lastName}
                          </TableCell>
                          <TableCell>{entity.email || '-'}</TableCell>
                          <TableCell>
                            {'subject' in entity && entity.subject && (
                              <Badge variant="secondary">{entity.subject}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {entity.deletedAt && format(new Date(entity.deletedAt), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            {entity.deleteReason && (
                              <Badge variant="outline">{entity.deleteReason}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestore(entity.id)}
                                className="flex items-center gap-1"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Restore
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedEntity({
                                    type: 'teacher',
                                    name: `${entity.firstName} ${entity.lastName}`,
                                    id: entity.id
                                  });
                                  setShowDeletionDialog(true);
                                }}
                                className="flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {currentData.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No archived {activeTab} found
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Deletion Dialog */}
      {selectedEntity && (
        <ProgressiveDeletionDialog
          isOpen={showDeletionDialog}
          onClose={() => {
            setShowDeletionDialog(false);
            setSelectedEntity(null);
          }}
          entityType={selectedEntity.type}
          entityName={selectedEntity.name}
          entityId={selectedEntity.id}
          onConfirm={async (options) => {
            if (options.type === 'HARD_DELETE') {
              await handlePermanentDelete(selectedEntity.id);
            }
          }}
        />
      )}
    </div>
    </DashboardLayout>
  );
}