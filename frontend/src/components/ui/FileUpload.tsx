"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatFileSize } from "@/utils/formatters";

export interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSizeMb?: number;
  label?: string;
  error?: string;
}

export function FileUpload({
  onFileSelect,
  accept = ".pdf,.docx",
  maxSizeMb = 10,
  label = "Upload File",
  error,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    setLocalError(null);
    if (!file) {
      setSelectedFile(null);
      onFileSelect(null);
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setLocalError(`File size exceeds maximum limit of ${maxSizeMb} MB.`);
      return;
    }

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    const acceptedTypes = accept.split(",").map((t) => t.trim().toLowerCase());
    if (!acceptedTypes.includes(ext)) {
      setLocalError(`Invalid file format. Only ${accept} files are allowed.`);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100/50 dark:hover:bg-slate-800",
          dragActive && "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40",
          (error || localError) && "border-red-500 bg-red-50/20"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
        {selectedFile ? (
          <div className="flex items-center justify-between w-full p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 overflow-hidden">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFile(null);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-full text-blue-600 dark:text-blue-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Click to upload or drag & drop
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Supported formats: PDF, DOCX (Max {maxSizeMb} MB)
              </p>
            </div>
          </div>
        )}
      </div>
      {(error || localError) && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{error || localError}</p>}
    </div>
  );
}
