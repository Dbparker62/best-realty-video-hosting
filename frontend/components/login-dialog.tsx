"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { login, cognitoConfigured } = useAuth()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in</DialogTitle>
          <DialogDescription>
            Use your account to purchase courses, watch lessons, and track
            progress.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {!cognitoConfigured && (
            <Alert variant="destructive">
              <AlertTitle>Missing Cognito configuration</AlertTitle>
              <AlertDescription className="text-sm">
                Set{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  NEXT_PUBLIC_COGNITO_DOMAIN
                </code>
                ,{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  NEXT_PUBLIC_COGNITO_CLIENT_ID
                </code>
                , and optionally{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  NEXT_PUBLIC_COGNITO_REDIRECT_URI
                </code>{" "}
                (must match your Cognito app client and API{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  COGNITO_REDIRECT_URI
                </code>
                ).
              </AlertDescription>
            </Alert>
          )}
          <Button
            type="button"
            className="w-full"
            disabled={!cognitoConfigured}
            onClick={() => {
              login()
              onOpenChange(false)
            }}
          >
            Continue with Cognito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
