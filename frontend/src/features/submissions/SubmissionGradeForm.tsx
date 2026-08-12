import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submissionService } from "@/services/submissionService";
import { SubmissionDetail } from "@/types/submission";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Modal } from "@/components/ui/Modal";
import { Award, Lock, AlertTriangle } from "lucide-react";

export function createGradeSchema(maxMarks: number) {
  return z.object({
    marks: z
      .number()
      .min(0, "Marks cannot be negative")
      .max(maxMarks, `Marks cannot exceed max limit of ${maxMarks}`),
    feedback: z.string().optional(),
  });
}

export function SubmissionGradeForm({
  submission,
  onGraded,
}: {
  submission: SubmissionDetail;
  onGraded: () => void;
}) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState<{ marks: number; feedback?: string } | null>(null);

  const isAlreadyGraded = submission.status === "Graded";

  const schema = createGradeSchema(submission.maxMarks);
  type GradeFormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GradeFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      marks: submission.marks ?? 0,
      feedback: submission.feedback ?? "",
    },
  });

  const handleFormSubmit = (data: GradeFormData) => {
    if (isAlreadyGraded) return;
    setPendingData(data);
    setShowConfirmModal(true);
  };

  const handleConfirmGrade = async () => {
    if (!pendingData) return;
    setIsSubmitting(true);
    try {
      await submissionService.gradeSubmission(submission.id, {
        ...pendingData,
        status: "Graded",
      });
      showToast("Grade finalized and saved successfully!", "success");
      setShowConfirmModal(false);
      onGraded();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to grade submission.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAlreadyGraded) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
          <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-200">Grade Finalized & Locked</h4>
            <p className="text-emerald-700 dark:text-emerald-300">
              This submission has been official evaluated. Grade records are final and cannot be modified further.
            </p>
          </div>
        </div>

        <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-500">Marks Awarded</span>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {submission.marks} / {submission.maxMarks}
            </p>
          </div>
          {submission.feedback && (
            <div>
              <span className="text-xs font-semibold text-slate-500">Feedback</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic mt-0.5">
                "{submission.feedback}"
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label={`Marks (Out of ${submission.maxMarks})`}
          type="number"
          error={errors.marks?.message}
          {...register("marks", { valueAsNumber: true })}
        />

        <TextArea
          label="Teacher Feedback"
          placeholder="Provide constructive feedback for the student..."
          error={errors.feedback?.message}
          {...register("feedback")}
        />

        <Button type="submit" isLoading={isSubmitting} leftIcon={<Award className="w-4 h-4" />}>
          Submit Grade
        </Button>
      </form>

      {/* CONFIRMATION POPUP */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Grade Submission"
        description="Are you sure you want to finalize this grade?"
        maxWidth="md"
      >
        <div className="space-y-4 pt-1">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h5 className="font-bold text-amber-900 dark:text-amber-200">Warning: Permanent Action</h5>
              <p className="text-amber-800 dark:text-amber-300">
                Once saved, this grade will be finalized and <strong>cannot be changed</strong>. Please double-check the awarded marks and feedback.
              </p>
            </div>
          </div>

          {pendingData && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <p><span className="font-semibold text-slate-500">Marks to be assigned:</span> <strong className="text-blue-600 dark:text-blue-400">{pendingData.marks} / {submission.maxMarks}</strong></p>
              {pendingData.feedback && (
                <p><span className="font-semibold text-slate-500">Feedback:</span> "{pendingData.feedback}"</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowConfirmModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button size="sm" isLoading={isSubmitting} onClick={handleConfirmGrade} leftIcon={<Lock className="w-3.5 h-3.5" />}>
              Confirm & Save Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
