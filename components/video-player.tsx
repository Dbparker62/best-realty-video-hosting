"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

/** WebKit (iOS Safari): native fullscreen; standard Fullscreen API is often unsupported on iPhone. */
type VideoElementWithWebKit = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void
}

interface VideoPlayerProps {
  videoUrl: string
  title: string
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hasRestoredTimeRef = useRef(false)
  const lastTimeRef = useRef(0)
  const lastPersistedTimeRef = useRef(0)
  const wasPlayingBeforeHideRef = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(true)

  const normalizedVideoKey = (() => {
    // Many video hosts use expiring/signed URLs (changing query params).
    // Normalize so "same video" resumes across remounts.
    try {
      const u = new URL(videoUrl, typeof window !== "undefined" ? window.location.href : undefined)
      return `${u.origin}${u.pathname}`
    } catch {
      return videoUrl.split("#")[0]?.split("?")[0] ?? videoUrl
    }
  })()

  const storageKey = `video-player:time:${normalizedVideoKey}`

  const persistTime = () => {
    try {
      // Avoid overwriting a good timestamp with a transient 0 during backgrounding.
      if (lastTimeRef.current > 0) {
        sessionStorage.setItem(storageKey, String(lastTimeRef.current))
        lastPersistedTimeRef.current = lastTimeRef.current
      }
    } catch {
      // ignore (private mode / disabled storage)
    }
  }

  const restoreTimeIfPossible = () => {
    const el = videoRef.current
    if (!el || hasRestoredTimeRef.current) return
    try {
      const raw = sessionStorage.getItem(storageKey)
      const t = raw ? Number(raw) : 0
      if (Number.isFinite(t) && t > 0 && Number.isFinite(el.duration) && el.duration > 0) {
        el.currentTime = Math.min(t, Math.max(0, el.duration - 0.25))
        lastTimeRef.current = el.currentTime
        lastPersistedTimeRef.current = el.currentTime
      }
    } catch {
      // ignore
    } finally {
      hasRestoredTimeRef.current = true
    }
  }

  useEffect(() => {
    const syncFromElement = () => {
      const el = videoRef.current
      if (!el) return
      const currentlyPlaying = !el.paused && !el.ended
      setIsPlaying(currentlyPlaying)

      // If the tab is being hidden, capture the most recent time and whether we were playing.
      if (document.visibilityState === "hidden") {
        wasPlayingBeforeHideRef.current = currentlyPlaying
        if (Number.isFinite(el.currentTime) && el.currentTime > 0) {
          lastTimeRef.current = el.currentTime
        }
        persistTime()
        return
      }

      // If we became visible again and the element got reset, put it back.
      if (
        document.visibilityState === "visible" &&
        lastPersistedTimeRef.current > 0 &&
        Number.isFinite(el.duration) &&
        el.duration > 0 &&
        el.currentTime + 0.5 < lastPersistedTimeRef.current
      ) {
        el.currentTime = Math.min(
          lastPersistedTimeRef.current,
          Math.max(0, el.duration - 0.25)
        )
        lastTimeRef.current = el.currentTime
      }

      if (document.visibilityState === "visible" && wasPlayingBeforeHideRef.current) {
        void el.play().catch(() => {})
        wasPlayingBeforeHideRef.current = false
      }
    }

    document.addEventListener("visibilitychange", syncFromElement)
    return () => document.removeEventListener("visibilitychange", syncFromElement)
  }, [])

  useEffect(() => {
    hasRestoredTimeRef.current = false
  }, [storageKey])

  useEffect(() => {
    return () => {
      persistTime()
    }
  }, [storageKey])

  const togglePlay = () => {
    const el = videoRef.current
    if (!el) return
    if (!el.paused && !el.ended) {
      el.pause()
    } else {
      void el.play().catch(() => {})
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      lastTimeRef.current = videoRef.current.currentTime
      // Persist occasionally so switching UI tabs can restore accurately.
      if (Math.abs(lastTimeRef.current - lastPersistedTimeRef.current) >= 1) {
        persistTime()
      }
      const percent =
        (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(percent)
    }
  }

  const scrubToClientX = (target: HTMLDivElement, clientX: number) => {
    const el = videoRef.current
    if (!el || !Number.isFinite(el.duration) || el.duration <= 0) return
    const rect = target.getBoundingClientRect()
    const percent = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    el.currentTime = percent * el.duration
  }

  const handleProgressPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    scrubToClientX(e.currentTarget, e.clientX)
  }

  const handleFullscreen = () => {
    const video = videoRef.current as VideoElementWithWebKit | null
    if (!video) return

    if (document.fullscreenElement) {
      void document.exitFullscreen?.()
      return
    }

    if (typeof video.webkitEnterFullscreen === "function") {
      video.webkitEnterFullscreen()
      return
    }

    void video.requestFullscreen?.()
  }

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-xl bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(isPlaying ? false : true)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full object-contain"
        playsInline
        preload="metadata"
        controls={false}
        onLoadedMetadata={restoreTimeIfPossible}
        onCanPlay={restoreTimeIfPossible}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Play overlay for initial state */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30"
          aria-label={`Play ${title}`}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-foreground transition-transform hover:scale-110">
            <Play className="ml-1 h-8 w-8" />
          </div>
        </button>
      )}

      {/* Controls */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress bar */}
        <div
          className="mb-3 h-2 cursor-pointer touch-manipulation rounded-full bg-white/30 md:h-1"
          onPointerDown={handleProgressPointer}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Seek"
        >
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
              onClick={handleFullscreen}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
