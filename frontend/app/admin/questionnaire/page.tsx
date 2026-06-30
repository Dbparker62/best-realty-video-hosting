"use client"

import { useState } from "react"
import useSWR from "swr"
import { ClipboardList, Plus, Trash2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  createAdminQuestionnaireQuestion,
  deleteAdminQuestionnaireQuestion,
  getAdminQuestionnaireQuestions,
  getAdminQuestionnaireSubmissions,
  updateAdminQuestionnaireQuestion,
  type QuestionnaireOptionAdmin,
  type QuestionnaireQuestionAdmin,
} from "@/lib/questionnaire-api"

type OptionDraft = QuestionnaireOptionAdmin

function newOptionId() {
  return `opt-${Math.random().toString(36).slice(2, 8)}`
}

function emptyForm(orderIndex: number) {
  return {
    prompt: "",
    orderIndex,
    isActive: true,
    options: [
      { id: newOptionId(), label: "", points: 10 },
      { id: newOptionId(), label: "", points: 5 },
    ] as OptionDraft[],
  }
}

export default function AdminQuestionnairePage() {
  const { data: questions, isLoading, mutate } = useSWR(
    "admin-questionnaire-questions",
    getAdminQuestionnaireQuestions
  )
  const { data: submissions, isLoading: submissionsLoading } = useSWR(
    "admin-questionnaire-submissions",
    getAdminQuestionnaireSubmissions
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<QuestionnaireQuestionAdmin | null>(null)
  const [form, setForm] = useState(emptyForm(1))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openCreate() {
    setEditing(null)
    setForm(emptyForm((questions?.length ?? 0) + 1))
    setError(null)
    setDialogOpen(true)
  }

  function openEdit(question: QuestionnaireQuestionAdmin) {
    setEditing(question)
    setForm({
      prompt: question.prompt,
      orderIndex: question.orderIndex,
      isActive: question.isActive,
      options: question.options.map((o) => ({ ...o })),
    })
    setError(null)
    setDialogOpen(true)
  }

  function updateOption(index: number, patch: Partial<OptionDraft>) {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => (i === index ? { ...o, ...patch } : o)),
    }))
  }

  function addOption() {
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, { id: newOptionId(), label: "", points: 5 }],
    }))
  }

  function removeOption(index: number) {
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const cleanedOptions = form.options
        .filter((o) => o.label.trim())
        .map((o) => ({ ...o, label: o.label.trim() }))

      if (!form.prompt.trim()) {
        throw new Error("Question prompt is required")
      }
      if (cleanedOptions.length < 2) {
        throw new Error("Each question needs at least 2 options")
      }

      if (editing) {
        await updateAdminQuestionnaireQuestion(editing.id, {
          prompt: form.prompt.trim(),
          orderIndex: form.orderIndex,
          isActive: form.isActive,
          options: cleanedOptions,
        })
      } else {
        await createAdminQuestionnaireQuestion({
          prompt: form.prompt.trim(),
          orderIndex: form.orderIndex,
          isActive: form.isActive,
          options: cleanedOptions,
        })
      }
      await mutate()
      setDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save question")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(questionId: string) {
    if (!confirm("Delete this question?")) return
    try {
      await deleteAdminQuestionnaireQuestion(questionId)
      await mutate()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not delete")
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Readiness Quiz</h1>
          <p className="text-muted-foreground">
            Manage multiple-choice questions. Higher option points mean stronger real estate readiness.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add question
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Questions
          </CardTitle>
          <CardDescription>
            Default questions are used until you save custom ones to DynamoDB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !questions?.length ? (
            <p className="py-8 text-center text-muted-foreground">No questions yet.</p>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="rounded-lg border p-4">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <Badge variant="outline">#{question.orderIndex}</Badge>
                        {!question.isActive && <Badge variant="secondary">Hidden</Badge>}
                      </div>
                      <p className="font-medium">{question.prompt}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(question)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {question.options.map((opt) => (
                      <li key={opt.id}>
                        {opt.label}{" "}
                        <span className="text-xs">({opt.points} pts)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent submissions</CardTitle>
          <CardDescription>
            Leads who completed the quiz and received a readiness score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissionsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !submissions?.length ? (
            <p className="py-8 text-center text-muted-foreground">
              No submissions yet (requires QUESTIONNAIRE_SUBMISSIONS_TABLE).
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Career path</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell className="text-sm capitalize">
                      {row.careerPath?.replace("_", " ") ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit question" : "Add question"}</DialogTitle>
            <DialogDescription>
              Multiple-choice options with point values (higher = more ready for real estate).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="prompt">Question</Label>
              <Input
                id="prompt"
                value={form.prompt}
                onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
                placeholder="Why are you looking into real estate?"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  min={0}
                  value={form.orderIndex}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, orderIndex: Number(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="flex items-end gap-3 pb-1">
                <Switch
                  id="active"
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, isActive: checked }))
                  }
                />
                <Label htmlFor="active">Active (visible on public quiz)</Label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Answer options</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  Add option
                </Button>
              </div>
              {form.options.map((option, index) => (
                <div key={option.id} className="flex gap-2">
                  <Input
                    value={option.label}
                    onChange={(e) => updateOption(index, { label: e.target.value })}
                    placeholder="Answer text"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={option.points}
                    onChange={(e) =>
                      updateOption(index, { points: Number(e.target.value) || 0 })
                    }
                    className="w-20"
                    aria-label="Points"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={form.options.length <= 2}
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
