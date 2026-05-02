"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import type { Course, CourseFormData } from "@/lib/types"

interface CourseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course?: Course | null
  onSubmit: (data: CourseFormData) => Promise<void>
}

export function CourseFormDialog({
  open,
  onOpenChange,
  course,
  onSubmit,
}: CourseFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    price: 0,
    published: false,
  })

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        price: course.price,
        published: course.published,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        price: 0,
        published: false,
      })
    }
  }, [course, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{course ? "Edit Course" : "Create Course"}</DialogTitle>
          <DialogDescription>
            {course
              ? "Update the course details below."
              : "Fill in the details to create a new course."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Real Estate Fundamentals"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="A comprehensive course on..."
                rows={4}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="price">Price ($)</FieldLabel>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </Field>
            <Field>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <FieldLabel htmlFor="published" className="mb-0">
                    Published
                  </FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Make this course visible to customers
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, published: checked })
                  }
                />
              </div>
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="mr-2" /> : null}
              {course ? "Save Changes" : "Create Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
