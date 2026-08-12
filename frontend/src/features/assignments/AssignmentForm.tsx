"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { assignmentService } from "@/services/assignmentService";
import { classService } from "@/services/classService";
import { AssignmentDetail } from "@/types/assignment";
import { ClassListItem } from "@/types/class";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TextArea } from "@/components/ui/TextArea";
import { Card } from "@/components/ui/Card";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ROUTES } from "@/constants/routes";
import { Save } from "lucide-react";

const assignmentSchema = z.object({
  classId: z.number().min(1, "Please select an assigned class"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  instructions: z.string().optional(),
  deadlineUtc: z.string().min(1, "Deadline date & time is required"),
  maxMarks: z.number().min(1, "Max marks must be greater than 0"),
  allowResubmission: z.boolean(),
  allowLateSubmissions: z.boolean(),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

export function AssignmentForm({ initialData }: { initialData?: AssignmentDetail }) {
  const isEditing = !!initialData;
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState<ClassListItem[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      classId: initialData?.classId || 0,
      title: initialData?.title || "",
      description: initialData?.description || "",
      instructions: initialData?.instructions || "",
      deadlineUtc: initialData?.deadlineUtc
        ? new Date(initialData.deadlineUtc).toISOString().slice(0, 16)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      maxMarks: initialData?.maxMarks || 100,
      allowResubmission: initialData?.allowResubmission ?? true,
      allowLateSubmissions: (initialData as any)?.allowLateSubmissions ?? true,
    },
  });

  useEffect(() => {
    setIsLoadingClasses(true);
    classService
      .getClasses({ pageNumber: 1, pageSize: 100 })
      .then((res) => {
        setClasses(res.items);
        if (!initialData?.classId && res.items.length > 0) {
          setValue("classId", res.items[0].id);
        }
      })
      .catch(() => showToast("Failed to load your assigned classrooms.", "error"))
      .finally(() => setIsLoadingClasses(false));
  }, [initialData?.classId, setValue, showToast]);

  const onSubmit = async (data: AssignmentFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        deadlineUtc: new Date(data.deadlineUtc).toISOString(),
      };

      if (isEditing && initialData) {
        await assignmentService.updateAssignment(initialData.id, payload);
        showToast("Assignment updated successfully!", "success");
        router.push(ROUTES.ASSIGNMENT_DETAILS(initialData.id));
      } else {
        const created = await assignmentService.createAssignment(payload);
        showToast("Assignment created successfully!", "success");
        router.push(ROUTES.ASSIGNMENT_DETAILS(created.id));
      }
    } catch (err: any) {
      let msg = "Failed to save assignment.";
      if (err?.response?.data) {
        const d = err.response.data;
        if (d.message) msg = d.message;
        else if (d.errors && typeof d.errors === "object") {
          const firstKey = Object.keys(d.errors)[0];
          if (firstKey && Array.isArray(d.errors[firstKey]) && d.errors[firstKey].length > 0) {
            msg = d.errors[firstKey][0];
          }
        } else if (d.title) {
          msg = d.title;
        }
      }
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Breadcrumb
        items={[
          { label: "Assignments", href: ROUTES.ASSIGNMENTS },
          { label: isEditing ? `Edit: ${initialData.title}` : "Create Assignment" },
        ]}
      />

      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {isEditing ? "Edit Assignment" : "Create New Assignment"}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Fill out assignment details, submission deadlines, and grading specifications
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className={isEditing ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
            {!isEditing && (
              <Select
                label="Assigned Classroom / Subject *"
                disabled={isLoadingClasses || classes.length === 0}
                options={
                  isLoadingClasses
                    ? [{ value: 0, label: "Loading your assigned classes..." }]
                    : classes.length === 0
                    ? [{ value: 0, label: "No assigned classes found" }]
                    : classes.map((c) => ({
                        value: c.id,
                        label: `Class ${c.classLevel} — ${c.subjectName} (${c.subjectCode || "Subject"})`,
                      }))
                }
                error={errors.classId?.message}
                {...register("classId", { valueAsNumber: true })}
              />
            )}
            <Input
              label="Max Marks"
              type="number"
              error={errors.maxMarks?.message}
              {...register("maxMarks", { valueAsNumber: true })}
            />
          </div>

          <Input
            label="Assignment Title"
            placeholder="e.g. Midterm Physics Problem Set"
            error={errors.title?.message}
            {...register("title")}
          />

          <TextArea
            label="Description"
            placeholder="Overview of the assignment task..."
            error={errors.description?.message}
            {...register("description")}
          />

          <TextArea
            label="Detailed Instructions"
            placeholder="Step-by-step submission instructions..."
            error={errors.instructions?.message}
            {...register("instructions")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Deadline (UTC)"
              type="datetime-local"
              error={errors.deadlineUtc?.message}
              {...register("deadlineUtc")}
            />

            <div className="flex flex-col gap-2.5 pt-6 sm:pt-7">
              <div className="flex items-center gap-3">
                <input
                  id="allowResubmission"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                  {...register("allowResubmission")}
                />
                <label htmlFor="allowResubmission" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Allow Resubmission before deadline
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="allowLateSubmissions"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                  {...register("allowLateSubmissions")}
                />
                <label htmlFor="allowLateSubmissions" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Allow Late Submissions (after deadline)
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} leftIcon={<Save className="w-4 h-4" />}>
              {isEditing ? "Save Changes" : "Create Assignment"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
