"use client"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"

interface Step4EducationBackgroundProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
}

export function Step4EducationBackground({ form }: Step4EducationBackgroundProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Educational Background</h3>
      <FormField
        control={form.control}
        name="qualifications"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qualifications</FormLabel>
            <FormControl>
              <Input placeholder="B.Ed, M.Sc, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="passedSchool"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School Passed</FormLabel>
              <FormControl>
                <Input placeholder="School name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passedCollege"
          render={({ field }) => (
            <FormItem>
              <FormLabel>College Passed</FormLabel>
              <FormControl>
                <Input placeholder="College name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="universityName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>University Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Harvard University" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cgpa"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CGPA</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" placeholder="e.g. 3.8" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-medium pt-4">Professional Background</h3>
      <FormField
        control={form.control}
        name="previousInstitute"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Previous Institute</FormLabel>
            <FormControl>
              <Input placeholder="Previous workplace/institute" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="experience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Experience (in years)</FormLabel>
            <FormControl>
              <Input type="number" step="0.1" placeholder="e.g. 5" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="reference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reference</FormLabel>
            <FormControl>
              <Input placeholder="Reference contact details" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
