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
import type { AdminLesson, LessonFormData } from "@/lib/types"

interface LessonFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lesson?: AdminLesson | null
  nextOrder: number
  onSubmit: (data: LessonFormData) => Promise<void>
}

export function LessonFormDialog({
  open,
  onOpenChange,
  lesson,
  nextOrder,
  onSubmit,
}: LessonFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<LessonFormData>({
    title: "",
    description: "",
    order: nextOrder,
    published: false,
    isPreview: false,
  })

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
        published: lesson.published,
        isPreview: lesson.isPreview,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        order: nextOrder,
        published: false,
        isPreview: false,
      })
    }
  }, [lesson, nextOrder, open])

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
          <DialogTitle>{lesson ? "Edit Lesson" : "Create Lesson"}</DialogTitle>
          <DialogDescription>
            {lesson
              ? "Update the lesson details below."
              : "Fill in the details to create a new lesson."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="lesson-title">Title</FieldLabel>
              <Input
                id="lesson-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Introduction to Real Estate"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="lesson-description">Description</FieldLabel>
              <Textarea
                id="lesson-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="In this lesson, you will learn..."
                rows={3}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="lesson-order">Order</FieldLabel>
              <Input
                id="lesson-order"
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) || 1 })
                }
                required
              />
            </Field>
            <Field>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <FieldLabel htmlFor="lesson-published" className="mb-0">
                    Published
                  </FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Make this lesson visible to students
                  </p>
                </div>
                <Switch
                  id="lesson-published"
                  checked={formData.published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, published: checked })
                  }
                />
              </div>
            </Field>
            <Field>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <FieldLabel htmlFor="lesson-preview" className="mb-0">
                    Free Preview
                  </FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Allow non-purchasers to view this lesson
                  </p>
                </div>
                <Switch
                  id="lesson-preview"
                  checked={formData.isPreview}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPreview: checked })
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
              {lesson ? "Save Changes" : "Create Lesson"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
