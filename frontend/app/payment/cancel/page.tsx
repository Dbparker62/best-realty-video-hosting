import Link from "next/link"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react"

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
        <XCircle className="h-10 w-10 text-destructive" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Payment Canceled
      </h1>

      <p className="mt-4 text-lg text-muted-foreground">
        Your payment was not completed. No charges have been made to your
        account.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Courses
          </Link>
        </Button>
      </div>

      <div className="mt-12 rounded-xl border bg-card p-6 text-left">
        <h3 className="font-semibold text-foreground">Need help?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          If you experienced any issues during checkout, please don&apos;t
          hesitate to reach out to our support team.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="mailto:support@bestrealtycourses.com">
            <HelpCircle className="mr-2 h-4 w-4" />
            Contact Support
          </Link>
        </Button>
      </div>
    </div>
  )
}
