"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { getVideoUploadUrl, saveVideoKey } from "@/lib/admin-api"
import type { AdminLesson } from "@/lib/types"
import { Upload, CheckCircle, XCircle, FileVideo } from "lucide-react"

type UploadStep = "select" | "uploading" | "saving" | "complete" | "error"

interface VideoUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lesson: AdminLesson | null
  onSuccess: () => void
}

export function VideoUploadDialog({
  open,
  onOpenChange,
  lesson,
  onSuccess,
}: VideoUploadDialogProps) {
  const [step, setStep] = useState<UploadStep>("select")
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const resetState = useCallback(() => {
    setStep("select")
    setProgress(0)
    setSelectedFile(null)
    setErrorMessage("")
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("video/")) {
        setErrorMessage("Please select a video file")
        return
      }
      setSelectedFile(file)
      setErrorMessage("")
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !lesson) return

    try {
      // Step 1: Request upload URL
      setStep("uploading")
      setProgress(10)

      const { uploadUrl, videoKey } = await getVideoUploadUrl(
        lesson.id,
        selectedFile.name || "lesson-video.mp4"
      )
      setProgress(25)

      await putVideoToPresignedUrl(uploadUrl, selectedFile, (p) => {
        setProgress(25 + p * 0.5)
      })
      setProgress(75)

      // Step 3: Save video key to backend
      setStep("saving")
      await saveVideoKey(lesson.id, videoKey)
      setProgress(100)

      // Complete
      setStep("complete")
      onSuccess()
    } catch (error) {
      setStep("error")
      setErrorMessage(
        error instanceof Error ? error.message : "Upload failed"
      )
    }
  }

  const putVideoToPresignedUrl = async (
    url: string,
    file: File,
    onProgress: (progress: number) => void
  ) => {
    onProgress(0)
    const res = await fetch(url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type || "video/mp4",
      },
    })
    onProgress(1)
    if (!res.ok) {
      throw new Error(`Upload failed (${res.status})`)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(resetState, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
          <DialogDescription>
            Upload a video for &quot;{lesson?.title}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {step === "select" && (
            <div className="space-y-4">
              <label
                htmlFor="video-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-muted/50"
              >
                {selectedFile ? (
                  <>
                    <FileVideo className="mb-2 h-10 w-10 text-primary" />
                    <p className="font-medium text-foreground">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                    <p className="font-medium text-foreground">
                      Click to select a video
                    </p>
                    <p className="text-sm text-muted-foreground">
                      MP4, MOV, or WebM up to 2GB
                    </p>
                  </>
                )}
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  className="sr-only"
                  onChange={handleFileSelect}
                />
              </label>
              {errorMessage && (
                <p className="text-center text-sm text-destructive">
                  {errorMessage}
                </p>
              )}
            </div>
          )}

          {(step === "uploading" || step === "saving") && (
            <div className="space-y-4 text-center">
              <Spinner className="mx-auto h-10 w-10" />
              <div>
                <p className="font-medium text-foreground">
                  {step === "uploading" ? "Uploading video..." : "Saving..."}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedFile?.name}
                </p>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">{progress}%</p>
            </div>
          )}

          {step === "complete" && (
            <div className="space-y-4 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-accent" />
              <div>
                <p className="font-medium text-foreground">Upload Complete</p>
                <p className="text-sm text-muted-foreground">
                  Video has been uploaded successfully
                </p>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="space-y-4 text-center">
              <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <div>
                <p className="font-medium text-foreground">Upload Failed</p>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "select" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={!selectedFile}>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </>
          )}
          {(step === "complete" || step === "error") && (
            <Button onClick={handleClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
