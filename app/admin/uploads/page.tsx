"use client"

import { useState } from "react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { VideoUploadDialog } from "@/components/admin/video-upload-dialog"
import { getAdminCourses, getAdminLessons } from "@/lib/admin-api"
import type { AdminLesson } from "@/lib/types"
import { Upload, Video, CheckCircle, XCircle } from "lucide-react"

export default function AdminUploadsPage() {
  const { data: courses, isLoading: coursesLoading } = useSWR(
    "admin-courses",
    getAdminCourses
  )
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<AdminLesson | null>(null)

  const {
    data: lessons,
    isLoading: lessonsLoading,
    mutate,
  } = useSWR(
    selectedCourseId ? `admin-lessons-${selectedCourseId}` : null,
    () => getAdminLessons(selectedCourseId)
  )

  const isLoading = coursesLoading || (selectedCourseId && lessonsLoading)

  const sortedLessons = lessons?.sort((a, b) => a.order - b.order)

  const uploadedCount = lessons?.filter((l) => l.videoKey).length || 0
  const pendingCount = (lessons?.length || 0) - uploadedCount

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Video Uploads</h1>
        <p className="text-muted-foreground">
          Manage video uploads for your lessons
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessons?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Uploaded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-2xl font-bold text-accent">
              <CheckCircle className="h-5 w-5" />
              {uploadedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-2xl font-bold text-muted-foreground">
              <XCircle className="h-5 w-5" />
              {pendingCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Lesson Videos</CardTitle>
              <CardDescription>
                Select a course to manage its video uploads
              </CardDescription>
            </div>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedCourseId ? (
            <div className="py-12 text-center">
              <Video className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-medium text-foreground">Select a course</p>
              <p className="text-sm text-muted-foreground">
                Choose a course from the dropdown to view and manage video uploads
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : sortedLessons?.length === 0 ? (
            <div className="py-12 text-center">
              <Video className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-medium text-foreground">No lessons found</p>
              <p className="text-sm text-muted-foreground">
                Add lessons to this course first
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Order</TableHead>
                  <TableHead>Lesson</TableHead>
                  <TableHead>Video Status</TableHead>
                  <TableHead className="w-[120px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLessons?.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-medium">{lesson.order}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {lesson.duration}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lesson.videoKey ? (
                        <Badge className="gap-1 bg-accent/10 text-accent hover:bg-accent/20">
                          <CheckCircle className="h-3 w-3" />
                          Uploaded
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <XCircle className="mr-1 h-3 w-3" />
                          No video
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={lesson.videoKey ? "outline" : "default"}
                        size="sm"
                        onClick={() => {
                          setSelectedLesson(lesson)
                          setUploadDialogOpen(true)
                        }}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {lesson.videoKey ? "Replace" : "Upload"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <VideoUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        lesson={selectedLesson}
        onSuccess={() => mutate()}
      />
    </div>
  )
}
