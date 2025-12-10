"use client"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { StudentFormValues } from "../create-student-dialog"
import { InlineLoader } from "@/components/data-loader"

interface Level {
  id: string
  name: string
}

interface Step1BasicInfoProps {
  form: UseFormReturn<StudentFormValues>
  levels: Level[]
  loadingLevels?: boolean
}

export function Step1BasicInfo({ form, levels, loadingLevels }: Step1BasicInfoProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                First Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Last Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input type="email" placeholder="student@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary Phone Number <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input type="tel" placeholder="+1234567890" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="studentPhoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Student Phone Number</FormLabel>
            <FormControl>
              <Input type="tel" placeholder="+1234567890" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="whatsappNumbers"
        render={({ field }) => (
          <FormItem>
            <FormLabel>WhatsApp Numbers (optional)</FormLabel>
            <FormControl>
              <Input 
                type="text" 
                placeholder="Enter numbers separated by commas (e.g., 01234567898, 01238736789)" 
                value={field.value?.join(', ') || ''}
                onChange={(e) => {
                  const numbers = e.target.value
                    .split(',')
                    .map(num => num.trim())
                    .filter(num => num.length > 0)
                  field.onChange(numbers)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="fatherName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Father&apos;s Name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="John Doe Sr." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fatherPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Father&apos;s Phone <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+1234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="motherName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mother&apos;s Name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Jane Doe Sr." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="motherPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mother&apos;s Phone <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+1234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="monthlyFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Fee</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  step="0.01"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input placeholder="123 Main St, City, State" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="levelId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Class Level <span className="text-red-500">*</span></FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={loadingLevels}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={loadingLevels ? "Loading levels..." : "Select class level"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {loadingLevels ? (
                  <div className="p-4">
                    <InlineLoader text="Loading levels..." />
                  </div>
                ) : levels.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No levels available
                  </div>
                ) : (
                  levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
