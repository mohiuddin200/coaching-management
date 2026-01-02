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

interface Step5DocumentsAndSocialProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
}

export function Step5DocumentsAndSocial({ form }: Step5DocumentsAndSocialProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Financial Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary</FormLabel>
              <FormControl>
                <Input type="number" placeholder="50000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paymentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SALARIED">Salaried</SelectItem>
                  <SelectItem value="HOURLY">Hourly</SelectItem>
                  <SelectItem value="PER_CLASS">Per Class</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <h3 className="text-lg font-medium pt-4">Documents</h3>
      <FormField
        control={form.control}
        name="nid"
        render={({ field }) => (
          <FormItem>
            <FormLabel>NID Number</FormLabel>
            <FormControl>
              <Input placeholder="Enter NID number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nidImageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>NID Image URL</FormLabel>
            <FormControl>
              <Input type="url" placeholder="https://example.com/nid-image.jpg" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="teacherPhotoUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teacher Photo URL</FormLabel>
            <FormControl>
              <Input type="url" placeholder="https://example.com/teacher-photo.jpg" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="universityIdCardUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>University ID Card URL</FormLabel>
            <FormControl>
              <Input type="url" placeholder="https://example.com/university-id.jpg" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-medium pt-4">Social Media Links</h3>
      <FormField
        control={form.control}
        name="facebookLink"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Facebook Profile</FormLabel>
            <FormControl>
              <Input type="url" placeholder="https://facebook.com/username" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="instagramLink"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Instagram Profile</FormLabel>
            <FormControl>
              <Input type="url" placeholder="https://instagram.com/username" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="linkedinLink"
        render={({ field }) => (
          <FormItem>
            <FormLabel>LinkedIn Profile</FormLabel>
            <FormControl>
              <Input type="url" placeholder="https://linkedin.com/in/username" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
