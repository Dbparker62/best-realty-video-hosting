"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, MessageSquare, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Contact / Support
        </h1>
        <p className="mt-4 text-muted-foreground">
          Have a question or need help? We&apos;re here to assist you.
        </p>

        {/* Contact Info Cards */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">Email Us</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              support@bestrealtycourses.com
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">Live Chat</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Available Mon-Fri, 9am-5pm EST
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">Response Time</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Within 24-48 business hours
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="mt-12 rounded-xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-foreground">
            Send us a message
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill out the form below and we&apos;ll get back to you as soon as
            possible.
          </p>

          {isSubmitted ? (
            <div className="mt-8 rounded-lg border border-accent/50 bg-accent/10 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
                <MessageSquare className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Message Sent!
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Thank you for reaching out. We&apos;ll respond to your inquiry
                within 24-48 business hours.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => setIsSubmitted(false)}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select name="subject" required>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="course">Course Question</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="billing">Billing / Payment</SelectItem>
                    <SelectItem value="refund">Refund Request</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Order Number (optional)</Label>
                <Input
                  id="order"
                  name="order"
                  placeholder="e.g., ORD-12345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="How can we help you?"
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </div>

        {/* FAQ Quick Links */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-foreground">
            Common Questions
          </h2>
          <div className="mt-4 space-y-3">
            <Link
              href="/refund"
              className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
            >
              <p className="font-medium text-foreground">
                What is your refund policy?
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Learn about our 30-day money-back guarantee.
              </p>
            </Link>
            <Link
              href="/terms"
              className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
            >
              <p className="font-medium text-foreground">
                How long do I have access to courses?
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Course access details are covered in our Terms of Service.
              </p>
            </Link>
            <Link
              href="/privacy"
              className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
            >
              <p className="font-medium text-foreground">
                How is my data protected?
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Read our Privacy Policy to learn about data protection.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
