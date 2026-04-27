"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ResumeUploadProps {
  userId: string;
  userName: string;
}

type UploadStep = "idle" | "parsing" | "generating" | "saving" | "done" | "error";

const stepMessages: Record<UploadStep, string> = {
  idle: "",
  parsing: "📄 Extracting text from resume...",
  generating: "🤖 Gemini AI is generating 10-15 questions for you (15-30s)...",
  saving: "💾 Creating your interview session...",
  done: "✅ Interview ready! Redirecting...",
  error: "",
};

export default function ResumeUpload({ userId, userName }: ResumeUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<UploadStep>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Please upload a PDF file only.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File size must be under 5MB.");
      return;
    }
    setErrorMessage("");
    setSelectedFile(file);
    setStep("idle");
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;

    setErrorMessage("");
    setStep("parsing");

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);
      formData.append("userId", userId);

      setStep("generating");

      const res = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze resume.");
      }

      setStep("saving");
      await new Promise((r) => setTimeout(r, 800));

      setStep("done");
      router.push(`/resume-interview/${data.interviewId}`);
    } catch (err: any) {
      setStep("error");
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    }
  };

  const isLoading = ["parsing", "generating", "saving", "done"].includes(step);

  return (
    <div className="resume-upload-wrapper">
      {/* Upload Zone */}
      <div
        className={`resume-drop-zone ${isDragging ? "dragging" : ""} ${selectedFile ? "has-file" : ""}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={onFileChange}
          disabled={isLoading}
        />

        {selectedFile ? (
          <div className="file-selected-state">
            <div className="file-icon-wrapper">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="#CAC5FE" fillOpacity="0.15" />
                <path d="M14 8h20a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z" fill="#CAC5FE" fillOpacity="0.3" stroke="#CAC5FE" strokeWidth="1.5" />
                <path d="M18 18h12M18 23h12M18 28h8" stroke="#CAC5FE" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="file-name">{selectedFile.name}</p>
            <p className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            {!isLoading && (
              <p className="change-file-hint">Click to change file</p>
            )}
          </div>
        ) : (
          <div className="upload-prompt-state">
            <div className="upload-icon-wrapper">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <rect width="56" height="56" rx="16" fill="#CAC5FE" fillOpacity="0.1" />
                <path d="M28 20v16M20 28l8-8 8 8" stroke="#CAC5FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 40h20" stroke="#CAC5FE" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="upload-main-text">
              {isDragging ? "Drop your resume here" : "Drag & drop your resume here"}
            </p>
            <p className="upload-sub-text">or click to browse files</p>
            <span className="upload-format-badge">PDF only · Max 5MB</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="resume-error-box">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#f75353" strokeWidth="1.5" />
            <path d="M8 5v4M8 11v.5" stroke="#f75353" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Upload Steps Progress */}
      {isLoading && (
        <div className="upload-progress-card">
          <div className="upload-steps">
            {(["parsing", "generating", "saving", "done"] as UploadStep[]).map((s, i) => {
              const stepIndex = ["parsing", "generating", "saving", "done"].indexOf(step);
              const thisIndex = i;
              const isComplete = thisIndex < stepIndex || step === "done";
              const isCurrent = s === step;

              return (
                <div key={s} className={`upload-step ${isCurrent ? "current" : ""} ${isComplete ? "complete" : ""}`}>
                  <div className="step-indicator">
                    {isComplete ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7l3 3 5-5" stroke="#49de50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : isCurrent ? (
                      <div className="step-spinner" />
                    ) : (
                      <div className="step-dot" />
                    )}
                  </div>
                  <span className="step-label">{stepMessages[s]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Button */}
      {!isLoading && (
        <button
          id="start-resume-interview-btn"
          className="btn-primary resume-upload-btn"
          onClick={handleUpload}
          disabled={!selectedFile || isLoading}
        >
          {selectedFile ? "Analyze Resume & Start Interview" : "Select a Resume First"}
        </button>
      )}
    </div>
  );
}
