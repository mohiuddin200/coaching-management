"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  Clock,
  Users,
  BookOpen,
  MoreHorizontal,
  Trash2,
  Edit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/confirmation-dialog";

interface Level {
  id: string;
  name: string;
  levelNumber: number;
}

interface Subject {
  id: string;
  name: string;
  code: string | null;
  levelId: string;
  level: Level;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string;
}

interface Schedule {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface ClassSection {
  id: string;
  name: string;
  capacity: number;
  roomNumber: string | null;
  academicYear: string;
  status: string;
  subject: Subject;
  teacher: Teacher;
  schedules: Schedule[];
  _count?: {
    enrollments: number;
    attendances: number;
  };
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function ClassSectionsPage() {
  const [classSections, setClassSections] = useState<ClassSection[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [newClassSection, setNewClassSection] = useState({
    name: "",
    subjectId: "",
    teacherId: "",
    capacity: 30,
    roomNumber: "",
    academicYear: "2024-2025",
  });
  const [schedules, setSchedules] = useState<
    { dayOfWeek: string; startTime: string; endTime: string }[]
  >([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingClassSection, setEditingClassSection] =
    useState<ClassSection | null>(null);
  const [editSchedules, setEditSchedules] = useState<
    { id?: string; dayOfWeek: string; startTime: string; endTime: string }[]
  >([]);

  useEffect(() => {
    fetchLevels();
    fetchTeachers();
    fetchClassSections();
  }, []);

  useEffect(() => {
    if (selectedLevel) {
      fetchSubjects(selectedLevel);
    }
  }, [selectedLevel]);

  const fetchLevels = async () => {
    try {
      const response = await fetch("/api/levels");
      const data = await response.json();
      setLevels(data);
    } catch (error) {
      console.error("Error fetching levels:", error);
      toast.error("Failed to load levels");
    }
  };

  const fetchSubjects = async (levelId: string) => {
    try {
      const response = await fetch(`/api/subjects?levelId=${levelId}`);
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects");
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers");
      const data = await response.json();
      setTeachers(data.teachers || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
    }
  };

  const fetchClassSections = async () => {
    try {
      const response = await fetch("/api/class-sections");
      const data = await response.json();
      setClassSections(data);
    } catch (error) {
      console.error("Error fetching class sections:", error);
      toast.error("Failed to load class sections");
    } finally {
      setLoading(false);
    }
  };

  const addSchedule = () => {
    setSchedules([
      ...schedules,
      { dayOfWeek: "Monday", startTime: "09:00", endTime: "10:00" },
    ]);
  };

  const updateSchedule = (index: number, field: string, value: string) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    setSchedules(updated);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const handleCreateClassSection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newClassSection.subjectId || !newClassSection.teacherId) {
      toast.error("Please select a subject and teacher");
      return;
    }

    try {
      const response = await fetch("/api/class-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newClassSection,
          schedules,
        }),
      });

      if (response.ok) {
        toast.success("Class section created successfully");
        setShowDialog(false);
        setNewClassSection({
          name: "",
          subjectId: "",
          teacherId: "",
          capacity: 30,
          roomNumber: "",
          academicYear: "2024-2025",
        });
        setSchedules([]);
        setSelectedLevel("");
        fetchClassSections();
      } else {
        toast.error("Failed to create class section");
      }
    } catch (error) {
      console.error("Error creating class section:", error);
      toast.error("Failed to create class section");
    }
  };

  const handleDeleteClassSection = async (sectionId: string) => {
    try {
      const response = await fetch(`/api/class-sections/${sectionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Class section deleted successfully");
        fetchClassSections();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete class section");
      }
    } catch (error) {
      console.error("Error deleting class section:", error);
      toast.error("Failed to delete class section");
    }
  };

  const fetchClassSectionById = async (sectionId: string) => {
    try {
      const response = await fetch(`/api/class-sections/${sectionId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching class section:", error);
      toast.error("Failed to load class section");
      return null;
    }
  };

  const openEditDialog = async (sectionId: string) => {
    const section = await fetchClassSectionById(sectionId);
    if (section) {
      setEditingClassSection(section);
      setEditSchedules(
        section.schedules.map((s: Schedule) => ({
          id: s.id,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      );
      setShowEditDialog(true);
    }
  };

  const updateEditSchedule = (index: number, field: string, value: string) => {
    const updated = [...editSchedules];
    updated[index] = { ...updated[index], [field]: value };
    setEditSchedules(updated);
  };

  const removeEditSchedule = (index: number) => {
    setEditSchedules(editSchedules.filter((_, i) => i !== index));
  };

  const addEditSchedule = () => {
    setEditSchedules([
      ...editSchedules,
      { dayOfWeek: "Monday", startTime: "09:00", endTime: "10:00" },
    ]);
  };

  const handleUpdateSchedule = async (
    scheduleId: string,
    data: { dayOfWeek: string; startTime: string; endTime: string },
  ) => {
    try {
      const response = await fetch(
        `/api/class-sections/${editingClassSection?.id}/schedules/${scheduleId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update schedule");
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
      throw error;
    }
  };

  const handleCreateNewSchedule = async (data: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }) => {
    try {
      const response = await fetch(
        `/api/class-sections/${editingClassSection?.id}/schedules`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create schedule");
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
      throw error;
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      const response = await fetch(
        `/api/class-sections/${editingClassSection?.id}/schedules?scheduleId=${scheduleId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete schedule");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      throw error;
    }
  };

  const handleUpdateClassSection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingClassSection) return;

    try {
      // Update class section details
      const updateData = {
        name: editingClassSection.name,
        teacherId: editingClassSection.teacher.id,
        capacity: editingClassSection.capacity,
        roomNumber: editingClassSection.roomNumber,
        academicYear: editingClassSection.academicYear,
      };

      const response = await fetch(
        `/api/class-sections/${editingClassSection.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        toast.error("Failed to update class section");
        return;
      }

      // Get existing schedules from the class section
      const existingSchedules = editingClassSection.schedules || [];

      // Handle schedules
      for (const editSchedule of editSchedules) {
        if (editSchedule.id) {
          // Update existing schedule
          await handleUpdateSchedule(editSchedule.id, editSchedule);
        } else {
          // Create new schedule
          await handleCreateNewSchedule(editSchedule);
        }
      }

      // Delete removed schedules
      for (const existingSchedule of existingSchedules) {
        const stillExists = editSchedules.some(
          (s) => s.id === existingSchedule.id,
        );
        if (!stillExists) {
          await handleDeleteSchedule(existingSchedule.id);
        }
      }

      toast.success("Class section updated successfully");
      setShowEditDialog(false);
      setEditingClassSection(null);
      setEditSchedules([]);
      fetchClassSections();
    } catch (error) {
      console.error("Error updating class section:", error);
      toast.error("Failed to update class section");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const groupedSections = classSections?.reduce(
    (acc, section) => {
      const levelName = section.subject.level.name;
      if (!acc[levelName]) {
        acc[levelName] = [];
      }
      acc[levelName].push(section);
      return acc;
    },
    {} as Record<string, ClassSection[]>,
  );

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Class Sections</h1>
            <p className="text-muted-foreground">
              Manage class sections with teachers and schedules
            </p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Class Section
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Class Section</DialogTitle>
                <DialogDescription>
                  Set up a new class section with teacher and schedule
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateClassSection} className="space-y-4">
                {/* Level Selection */}
                <div>
                  <Label htmlFor="level">Level (Class) *</Label>
                  <Select
                    value={selectedLevel}
                    onValueChange={setSelectedLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels?.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject Selection */}
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select
                    value={newClassSection.subjectId}
                    onValueChange={(value) =>
                      setNewClassSection({
                        ...newClassSection,
                        subjectId: value,
                      })
                    }
                    disabled={!selectedLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}{" "}
                          {subject.code ? `(${subject.code})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Section Name */}
                <div>
                  <Label htmlFor="name">Section Name *</Label>
                  <Input
                    id="name"
                    value={newClassSection.name}
                    onChange={(e) =>
                      setNewClassSection({
                        ...newClassSection,
                        name: e.target.value,
                      })
                    }
                    placeholder="Section A / Morning Batch"
                    required
                  />
                </div>

                {/* Teacher Selection */}
                <div>
                  <Label htmlFor="teacher">Teacher *</Label>
                  <Select
                    value={newClassSection.teacherId}
                    onValueChange={(value) =>
                      setNewClassSection({
                        ...newClassSection,
                        teacherId: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={newClassSection.capacity}
                      onChange={(e) =>
                        setNewClassSection({
                          ...newClassSection,
                          capacity: parseInt(e.target.value),
                        })
                      }
                      min={1}
                    />
                  </div>
                  <div>
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input
                      id="roomNumber"
                      value={newClassSection.roomNumber}
                      onChange={(e) =>
                        setNewClassSection({
                          ...newClassSection,
                          roomNumber: e.target.value,
                        })
                      }
                      placeholder="101"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="academicYear">Academic Year *</Label>
                  <Input
                    id="academicYear"
                    value={newClassSection.academicYear}
                    onChange={(e) =>
                      setNewClassSection({
                        ...newClassSection,
                        academicYear: e.target.value,
                      })
                    }
                    placeholder="2024-2025"
                    required
                  />
                </div>

                {/* Schedules */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Schedules</Label>
                    <Button type="button" size="sm" onClick={addSchedule}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Schedule
                    </Button>
                  </div>
                  {schedules.map((schedule, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 gap-2 p-3 border rounded-lg"
                    >
                      <Select
                        value={schedule.dayOfWeek}
                        onValueChange={(value) =>
                          updateSchedule(index, "dayOfWeek", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_WEEK.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) =>
                          updateSchedule(index, "startTime", e.target.value)
                        }
                      />
                      <Input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) =>
                          updateSchedule(index, "endTime", e.target.value)
                        }
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSchedule(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Class Section</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Class Section</DialogTitle>
                <DialogDescription>
                  Update class section details and schedules
                </DialogDescription>
              </DialogHeader>
              {editingClassSection && (
                <form onSubmit={handleUpdateClassSection} className="space-y-4">
                  {/* Section Name */}
                  <div>
                    <Label htmlFor="edit-name">Section Name *</Label>
                    <Input
                      id="edit-name"
                      value={editingClassSection.name}
                      onChange={(e) =>
                        setEditingClassSection({
                          ...editingClassSection,
                          name: e.target.value,
                        })
                      }
                      placeholder="Section A / Morning Batch"
                      required
                    />
                  </div>

                  {/* Teacher Selection */}
                  <div>
                    <Label htmlFor="edit-teacher">Teacher *</Label>
                    <Select
                      value={editingClassSection.teacher.id}
                      onValueChange={(value) =>
                        setEditingClassSection({
                          ...editingClassSection,
                          teacher: {
                            ...editingClassSection.teacher,
                            id: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.firstName} {teacher.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-capacity">Capacity</Label>
                      <Input
                        id="edit-capacity"
                        type="number"
                        value={editingClassSection.capacity}
                        onChange={(e) =>
                          setEditingClassSection({
                            ...editingClassSection,
                            capacity: parseInt(e.target.value),
                          })
                        }
                        min={1}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-roomNumber">Room Number</Label>
                      <Input
                        id="edit-roomNumber"
                        value={editingClassSection.roomNumber || ""}
                        onChange={(e) =>
                          setEditingClassSection({
                            ...editingClassSection,
                            roomNumber: e.target.value,
                          })
                        }
                        placeholder="101"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-academicYear">Academic Year *</Label>
                    <Input
                      id="edit-academicYear"
                      value={editingClassSection.academicYear}
                      onChange={(e) =>
                        setEditingClassSection({
                          ...editingClassSection,
                          academicYear: e.target.value,
                        })
                      }
                      placeholder="2024-2025"
                      required
                    />
                  </div>

                  {/* Schedules */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Schedules</Label>
                      <Button type="button" size="sm" onClick={addEditSchedule}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Schedule
                      </Button>
                    </div>
                    {editSchedules.map((schedule, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-4 gap-2 p-3 border rounded-lg"
                      >
                        <Select
                          value={schedule.dayOfWeek}
                          onValueChange={(value) =>
                            updateEditSchedule(index, "dayOfWeek", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) =>
                            updateEditSchedule(
                              index,
                              "startTime",
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) =>
                            updateEditSchedule(index, "endTime", e.target.value)
                          }
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeEditSchedule(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowEditDialog(false);
                        setEditingClassSection(null);
                        setEditSchedules([]);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Update Class Section</Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {classSections.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Class Sections</CardTitle>
              <CardDescription>
                Create your first class section to get started
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSections).map(([levelName, sections]) => (
              <Card key={levelName}>
                <CardHeader>
                  <CardTitle>{levelName}</CardTitle>
                  <CardDescription>
                    {sections.length} section{sections.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sections.map((section) => (
                      <div
                        key={section.id}
                        className="p-4 rounded-lg border border-border space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">
                              {section.name}
                            </h3>
                            <div className="flex items-center">
                              <Badge variant="outline" className="mr-2">
                                {section.status}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => openEditDialog(section.id)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <ConfirmationDialog
                                    title="Delete Class Section"
                                    description="Are you sure you want to delete this class section? This action cannot be undone."
                                    onConfirm={() =>
                                      handleDeleteClassSection(section.id)
                                    }
                                    confirmText="Delete"
                                  >
                                    <DropdownMenuItem
                                      onSelect={(e) => e.preventDefault()}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </ConfirmationDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {section.subject.name}
                          </p>
                        </div>

                        <div className="space-y-1 text-sm">
                          <p className="font-medium">
                            {section.teacher.firstName}{" "}
                            {section.teacher.lastName}
                          </p>
                          {section.roomNumber && (
                            <p className="text-muted-foreground">
                              Room: {section.roomNumber}
                            </p>
                          )}
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {section._count?.enrollments || 0} /{" "}
                            {section.capacity} students
                          </p>
                        </div>

                        {section.schedules.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Schedule:
                            </p>
                            {section.schedules.map((schedule) => (
                              <p
                                key={schedule.id}
                                className="text-xs text-muted-foreground"
                              >
                                {schedule.dayOfWeek}: {schedule.startTime} -{" "}
                                {schedule.endTime}
                              </p>
                            ))}
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Academic Year: {section.academicYear}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
