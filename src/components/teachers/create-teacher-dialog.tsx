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
import { Form } from "@/components/ui/form"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Teacher } from "./columns"
import { Step1BasicInfo } from "./form-steps/Step1BasicInfo"
import { Step2DetailedProfile } from "./form-steps/Step2DetailedProfile"
import { Step3ContactFinance } from "./form-steps/Step3ContactFinance"

const GenderEnum = z.enum(["Male", "Female", "Other"]);
const BloodGroupEnum = z.enum(["A_Positive", "A_Negative", "B_Positive", "B_Negative", "AB_Positive", "AB_Negative", "O_Positive", "O_Negative"]);
const PaymentTypeEnum = z.enum(["SALARIED", "HOURLY", "PER_CLASS"]);

const teacherFormSchema = z.object({
  // Step 1
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phoneNumber: z.string().min(1, "Phone number is required"),
  subject: z.string().optional(),
  qualifications: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),

  // Step 2
  gender: GenderEnum.optional(),
  dateOfBirth: z.date().optional(),
  nid: z.string().optional(),
  bloodGroup: BloodGroupEnum.optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  universityName: z.string().optional(),
  cgpa: z.coerce.number().optional(),

  // Step 3
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  salary: z.coerce.number().optional(),
  paymentType: PaymentTypeEnum.optional(),
})

type TeacherFormValues = z.infer<typeof teacherFormSchema>

interface TeacherDialogProps {
  teacher?: Teacher
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function TeacherDialog({ teacher, trigger, onSuccess }: TeacherDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const isEditMode = !!teacher

  const STEPS = [
    "Basic Information",
    "Detailed Profile",
    "Contact & Finance",
  ]

  const form = useForm<TeacherFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(teacherFormSchema) as any,
    defaultValues: {
      // Step 1
      firstName: teacher?.firstName || "",
      lastName: teacher?.lastName || "",
      email: teacher?.email || "",
      phoneNumber: teacher?.phoneNumber || "",
      subject: teacher?.subject || "",
      qualifications: teacher?.qualifications || "",
      status: teacher?.status || "Active",

      // Step 2
      gender: teacher?.gender || undefined,
      dateOfBirth: teacher?.dateOfBirth ? new Date(teacher.dateOfBirth) : undefined,
      nid: teacher?.nid || "",
      bloodGroup: teacher?.bloodGroup || undefined,
      nationality: teacher?.nationality || "",
      religion: teacher?.religion || "",
      universityName: teacher?.universityName || "",
      cgpa: teacher?.cgpa || undefined,

      // Step 3
      streetAddress: teacher?.streetAddress || "",
      city: teacher?.city || "",
      state: teacher?.state || "",
      postalCode: teacher?.postalCode || "",
      country: teacher?.country || "",
      emergencyContactName: teacher?.emergencyContactName || "",
      emergencyContactPhone: teacher?.emergencyContactPhone || "",
      emergencyContactRelation: teacher?.emergencyContactRelation || "",
      salary: teacher?.salary || undefined,
      paymentType: teacher?.paymentType || undefined,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        // Step 1
        firstName: teacher?.firstName || "",
        lastName: teacher?.lastName || "",
        email: teacher?.email || "",
        phoneNumber: teacher?.phoneNumber || "",
        subject: teacher?.subject || "",
        qualifications: teacher?.qualifications || "",
        status: teacher?.status || "Active",

        // Step 2
        gender: teacher?.gender || undefined,
        dateOfBirth: teacher?.dateOfBirth ? new Date(teacher.dateOfBirth) : undefined,
        nid: teacher?.nid || "",
        bloodGroup: teacher?.bloodGroup || undefined,
        nationality: teacher?.nationality || "",
        religion: teacher?.religion || "",
        universityName: teacher?.universityName || "",
        cgpa: teacher?.cgpa || undefined,

        // Step 3
        streetAddress: teacher?.streetAddress || "",
        city: teacher?.city || "",
        state: teacher?.state || "",
        postalCode: teacher?.postalCode || "",
        country: teacher?.country || "",
        emergencyContactName: teacher?.emergencyContactName || "",
        emergencyContactPhone: teacher?.emergencyContactPhone || "",
        emergencyContactRelation: teacher?.emergencyContactRelation || "",
        salary: teacher?.salary || undefined,
        paymentType: teacher?.paymentType || undefined,
      })
      setCurrentStep(0)
    }
  }, [open, teacher, form])

  const onSubmit = async (data: TeacherFormValues) => {
    setError(null)

    try {
      const url = isEditMode ? `/api/teachers/${teacher.id}` : "/api/teachers"
      const method = isEditMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isEditMode ? "update" : "create"} teacher`)
      }

      toast.success(
        isEditMode ? "Teacher updated successfully!" : "Teacher created successfully!",
        {
          description: `${data.firstName} ${data.lastName} has been ${isEditMode ? "updated" : "added"}.`,
        }
      )

      form.reset()
      setOpen(false)
      setCurrentStep(0)
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast.error(
        isEditMode ? "Failed to update teacher" : "Failed to create teacher",
        {
          description: errorMessage,
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
            Add Teacher
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the teacher information below."
              : "Create a new teacher profile. Fill in the required information below."
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
            <div className="flex justify-between mb-8">
              {STEPS.map((step, index) => (
                <div key={step} className="flex flex-col items-center text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                    index === currentStep ? "bg-blue-500" : "bg-gray-400"
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-xs mt-1 w-20">{step}</span>
                </div>
              ))}
            </div>
            
            {currentStep === 0 && <Step1BasicInfo form={form} />}
            {currentStep === 1 && <Step2DetailedProfile form={form} />}
            {currentStep === 2 && <Step3ContactFinance form={form} />}

            <DialogFooter className="flex justify-between pt-4">
              {currentStep > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={form.formState.isSubmitting}
                >
                  Previous
                </Button>
              ) : <div></div>}
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
                      : (isEditMode ? "Update Teacher" : "Create Teacher")
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

// Backward compatibility: CreateTeacherDialog for create mode
export function CreateTeacherDialog({ onTeacherCreated }: { onTeacherCreated?: () => void }) {
  return <TeacherDialog onSuccess={onTeacherCreated} />
}