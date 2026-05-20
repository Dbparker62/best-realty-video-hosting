"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { LessonFormDialog } from "@/components/admin/lesson-form-dialog"
import { VideoUploadDialog } from "@/components/admin/video-upload-dialog"
import {
  getAdminCourses,
  getAdminLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} from "@/lib/admin-api"
import type { AdminLesson, LessonFormData } from "@/lib/types"
import { Plus, MoreHorizontal, Pencil, Trash2, Upload, ArrowLeft, Eye, Video } from "lucide-react"

export default function AdminLessonsPage() {
  const params = useParams()
  const courseId = params.courseId as string

  const { data: courses } = useSWR("admin-courses", getAdminCourses)
  const course = courses?.find((c) => c.id === courseId)

  const {
    data: lessons,
    isLoading,
    mutate,
  } = useSWR(`admin-lessons-${courseId}`, () => getAdminLessons(courseId))

  const [formOpen, setFormOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<AdminLesson | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadingLesson, setUploadingLesson] = useState<AdminLesson | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [lessonToDelete, setLessonToDelete] = useState<AdminLesson | null>(null)

  const nextOrder = (lessons?.length || 0) + 1

  const handleCreate = async (data: LessonFormData) => {
    await createLesson(courseId, data)
    mutate()
  }

  const handleUpdate = async (data: LessonFormData) => {
    if (!editingLesson) return
    await updateLesson(editingLesson.id, data)
    mutate()
    setEditingLesson(null)
  }

  const handleDelete = async () => {
    if (!lessonToDelete) return
    await deleteLesson(lessonToDelete.id)
    mutate()
    setLessonToDelete(null)
    setDeleteDialogOpen(false)
  }

  const sortedLessons = lessons?.sort((a, b) => a.order - b.order)

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/courses"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Courses
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {course?.title || "Course"} - Lessons
            </h1>
            <p className="text-muted-foreground">
              Manage lessons and video content
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lesson
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lessons</CardTitle>
          <CardDescription>
            {lessons?.length || 0} lessons in this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : sortedLessons?.length === 0 ? (
            <div className="py-12 text-center">
              <Video className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-medium text-foreground">No lessons yet</p>
              <p className="text-sm text-muted-foreground">
                Add your first lesson to get started
              </p>
              <Button onClick={() => setFormOpen(true)} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Lesson
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Order</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Video</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLessons?.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-medium">{lesson.order}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {lesson.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lesson.videoKey ? (
                        <Badge variant="secondary" className="gap-1">
                          <Video className="h-3 w-3" />
                          Uploaded
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          No video
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            lesson.published
                              ? "bg-accent/10 text-accent"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {lesson.published ? "Published" : "Draft"}
                        </span>
                        {lesson.isPreview && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            <Eye className="h-3 w-3" />
                            Preview
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingLesson(lesson)
                              setFormOpen(true)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setUploadingLesson(lesson)
                              setUploadDialogOpen(true)
                            }}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Video
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setLessonToDelete(lesson)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <LessonFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingLesson(null)
        }}
        lesson={editingLesson}
        nextOrder={nextOrder}
        onSubmit={editingLesson ? handleUpdate : handleCreate}
      />

      <VideoUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        lesson={uploadingLesson}
        onSuccess={() => mutate()}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{lessonToDelete?.title}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
