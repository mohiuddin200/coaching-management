"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
} from "@/components/ui/form"
import { Plus } from "lucide-react"
import { Step1BasicInfo } from "./form-steps/Step1BasicInfo"
import { Step2DetailedProfile } from "./form-steps/Step2DetailedProfile"
import { Step3AdditionalInfo } from "./form-steps/Step3AdditionalInfo"
import { Student } from "./columns"
import { toast } from "sonner"

const GenderEnum = z.enum(["Male", "Female", "Other"]);
const BloodGroupEnum = z.enum(["A_Positive", "A_Negative", "B_Positive", "B_Negative", "AB_Positive", "AB_Negative", "O_Positive", "O_Negative"]);

const studentFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  fatherName: z.string().min(1, "Father's name is required"),
  fatherPhone: z.string().min(1, "Father's phone number is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  motherPhone: z.string().min(1, "Mother's phone number is required"),
  dateOfBirth: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  status: z.enum(["Active", "Inactive"]),
  smsEnabled: z.boolean(),
  levelId: z.string().min(1, "Class Level is required"),

  // Detailed Profile
  gender: GenderEnum.optional(),
  bloodGroup: BloodGroupEnum.optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  previousSchool: z.string().optional(),
  previousClass: z.string().optional(),
  previousMarks: z.number().optional(),

  // Emergency Contact
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),

  // Documents
  profileImage: z.string().optional(),
  birthCertificate: z.string().optional(),
  idProof: z.string().optional(),
})

export type StudentFormValues = z.infer<typeof studentFormSchema>

interface StudentDialogProps {
  student?: Student
  trigger?: React.ReactNode
  onSuccess?: () => void
}

interface Level {
  id: string
  name: string
  levelNumber: number
}

export function StudentDialog({ student, trigger, onSuccess }: StudentDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingLevels, setLoadingLevels] = useState(false)
  const [levels, setLevels] = useState<Level[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const isEditMode = !!student

  const STEPS = [
    "Basic Information",
    "Detailed Profile",
    "Additional Information",
  ]

  // Fetch levels when dialog opens
  useEffect(() => {
    if (open) {
      setLoadingLevels(true)
      fetch('/api/levels')
        .then(res => res.json())
        .then(data => setLevels(data))
        .catch(err => {
          console.error('Error fetching levels:', err)
          toast.error('Failed to load class levels')
        })
        .finally(() => setLoadingLevels(false))
    }
  }, [open])

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      firstName: student?.firstName || "",
      lastName: student?.lastName || "",
      email: student?.email || "",
      phoneNumber: student?.phoneNumber || "",
      fatherName: student?.fatherName || "",
      fatherPhone: student?.fatherPhone || "",
      motherName: student?.motherName || "",
      motherPhone: student?.motherPhone || "",
      dateOfBirth: student?.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : "",
      address: student?.address || "",
      status: student?.status || "Active",
      smsEnabled: student?.smsEnabled || false,
      levelId: (student as Student & { levelId?: string })?.levelId || "",

      // Detailed Profile
      gender: student?.gender || undefined,
      bloodGroup: student?.bloodGroup || undefined,
      nationality: student?.nationality || "",
      religion: student?.religion || "",
      streetAddress: student?.streetAddress || "",
      city: student?.city || "",
      state: student?.state || "",
      postalCode: student?.postalCode || "",
      country: student?.country || "",
      previousSchool: student?.previousSchool || "",
      previousClass: student?.previousClass || "",
      previousMarks: student?.previousMarks || undefined,

      // Emergency Contact
      emergencyContactName: student?.emergencyContactName || "",
      emergencyContactPhone: student?.emergencyContactPhone || "",
      emergencyContactRelation: student?.emergencyContactRelation || "",

      // Documents
      profileImage: student?.profileImage || "",
      birthCertificate: student?.birthCertificate || "",
      idProof: student?.idProof || "",
    },
  })

  // Reset form when student prop changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        firstName: student?.firstName || "",
        lastName: student?.lastName || "",
        email: student?.email || "",
        phoneNumber: student?.phoneNumber || "",
        fatherName: student?.fatherName || "",
        fatherPhone: student?.fatherPhone || "",
        motherName: student?.motherName || "",
        motherPhone: student?.motherPhone || "",
        dateOfBirth: student?.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : "",
        address: student?.address || "",
        status: student?.status || "Active",
        smsEnabled: student?.smsEnabled || false,
        levelId: (student as Student & { levelId?: string })?.levelId || "",

        // Detailed Profile
        gender: student?.gender || undefined,
        bloodGroup: student?.bloodGroup || undefined,
        nationality: student?.nationality || "",
        religion: student?.religion || "",
        streetAddress: student?.streetAddress || "",
        city: student?.city || "",
        state: student?.state || "",
        postalCode: student?.postalCode || "",
        country: student?.country || "",
        previousSchool: student?.previousSchool || "",
        previousClass: student?.previousClass || "",
        previousMarks: student?.previousMarks || undefined,

        // Emergency Contact
        emergencyContactName: student?.emergencyContactName || "",
        emergencyContactPhone: student?.emergencyContactPhone || "",
        emergencyContactRelation: student?.emergencyContactRelation || "",

        // Documents
        profileImage: student?.profileImage || "",
        birthCertificate: student?.birthCertificate || "",
        idProof: student?.idProof || "",
      })
      setCurrentStep(0) // Reset to first step on dialog open
    }
  }, [open, student, form])

  const onSubmit = async (data: StudentFormValues) => {
    setError(null)

    try {
      const url = isEditMode ? `/api/students/${student.id}` : "/api/students"
      const method = isEditMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null,
          previousMarks: data.previousMarks !== undefined ? Number(data.previousMarks) : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isEditMode ? "update" : "create"} student`)
      }

      await response.json()

      toast.success(
        isEditMode ? "Student updated successfully!" : "Student created successfully!",
        {
          description: `${data.firstName} ${data.lastName} has been ${isEditMode ? "updated" : "added"}.`,
        }
      )

      // Reset form and close dialog
      form.reset()
      setOpen(false)
      setCurrentStep(0) // Reset to first step

      // Notify parent component to refresh data
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      toast.error(
        isEditMode ? "Failed to update student" : "Failed to create student",
        {
          description: err instanceof Error ? err.message : "An error occurred",
        }
      )
    }
  }

  const handleNext = async () => {
    const isValid = await form.trigger()
    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Student" : "Add New Student"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the student information below."
              : "Create a new student profile. Fill in the required information below."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Progress Indicator */}
            <div className="flex justify-between mb-12">
              {STEPS.map((step, index) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${index === currentStep ? "bg-blue-500" : "bg-gray-400"
                    }`}>
                    {index + 1}
                  </div>
                  <span className="text-xs mt-1">{step}</span>
                </div>
              ))}
            </div>

            {currentStep === 0 && <Step1BasicInfo form={form} levels={levels} loadingLevels={loadingLevels} />}
            {currentStep === 1 && <Step2DetailedProfile form={form} />}
            {currentStep === 2 && <Step3AdditionalInfo form={form} />}

            <DialogFooter className="flex justify-between">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={form.formState.isSubmitting}
                >
                  Previous
                </Button>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
                {currentStep < STEPS.length - 1 && (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={form.formState.isSubmitting}
                  >
                    Next
                  </Button>
                )}
                {currentStep === STEPS.length - 1 && (
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting
                      ? (isEditMode ? "Updating..." : "Creating...")
                      : (isEditMode ? "Update Student" : "Create Student")
                    }
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Backward compatibility: CreateStudentDialog for create mode
export function CreateStudentDialog({ onStudentCreated }: { onStudentCreated?: () => void }) {
  return <StudentDialog onSuccess={onStudentCreated} />
}
