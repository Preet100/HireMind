"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ResumeInterviewClientProps {
  interview: {
    id: string;
    role: string;
    level: string;
    type: string;
    techstack: string[];
    questions: string[];
  };
  userId: string;
}

export default function ResumeInterviewClient({ interview, userId }: ResumeInterviewClientProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<string[]>(
    Array(interview.questions.length).fill("")
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const total = interview.questions.length;
  const answered = answers.filter((a) => a.trim().length > 0).length;
  const progress = Math.round((answered / total) * 100);

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const submitInterview = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/resume-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: interview.id,
          userId,
          questions: interview.questions,
          answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate feedback");

      toast.success("Feedback generated successfully!");
      router.push(`/interview/${interview.id}/feedback`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      toast.error(err.message || "Something went wrong.");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (answered < total) {
      toast((t) => (
        <div className="flex flex-col gap-3 min-w-[250px]">
          <p className="font-semibold text-white">Submit Interview?</p>
          <p className="text-sm text-light-400">
            You have only answered {answered} out of {total} questions. Unanswered questions will be marked as skipped.
          </p>
          <div className="flex gap-2 justify-end mt-2">
            <button 
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-sm bg-dark-400 hover:bg-dark-300 text-white rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                toast.dismiss(t.id);
                submitInterview();
              }}
              className="px-3 py-1.5 text-sm bg-primary-200 hover:bg-primary-100 text-black font-semibold rounded-md transition-colors"
            >
              Submit Anyway
            </button>
          </div>
        </div>
      ), { 
        duration: Infinity, 
        style: { background: "#16171e", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } 
      });
      return;
    }

    submitInterview();
  };


  return (
    <div className="riq-layout">
      {/* Sidebar — Question Navigator */}
      <aside className="riq-sidebar">
        <div className="riq-sidebar-header">
          <p className="riq-sidebar-label">Questions</p>
          <span className="riq-sidebar-progress">{answered}/{total} answered</span>
        </div>

        {/* Progress Bar */}
        <div className="riq-progress-bar">
          <div className="riq-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Question Nav Buttons */}
        <div className="riq-nav-buttons">
          {interview.questions.map((_, i) => {
            const isAnswered = answers[i]?.trim().length > 0;
            const isCurrent = i === currentQ;
            return (
              <button
                key={i}
                className={`riq-nav-btn ${isCurrent ? "active" : ""} ${isAnswered ? "answered" : ""}`}
                onClick={() => setCurrentQ(i)}
                id={`question-nav-${i + 1}`}
              >
                <span className="riq-nav-num">Q{i + 1}</span>
                {isAnswered && (
                  <span className="riq-nav-check">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Submit Button */}
        <button
          id="submit-interview-btn"
          className="riq-submit-btn"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="riq-spinner" />
              Generating Feedback...
            </span>
          ) : (
            `Submit Interview (${answered}/${total})`
          )}
        </button>

        {error && (
          <div className="riq-error">
            <span>⚠️</span> {error}
          </div>
        )}
      </aside>

      {/* Main — Current Question */}
      <main className="riq-main">
        <div className="riq-question-card">
          {/* Question Header */}
          <div className="riq-question-header">
            <div className="riq-question-badge">
              Question {currentQ + 1} of {total}
            </div>
            <div className="riq-question-tags">
              <span className="riq-tag">{interview.type}</span>
              <span className="riq-tag riq-tag-level">{interview.level}</span>
            </div>
          </div>

          {/* Question Text */}
          <p className="riq-question-text">
            {interview.questions[currentQ]}
          </p>

          {/* Answer Textarea */}
          <div className="riq-answer-section">
            <label className="riq-answer-label" htmlFor={`answer-${currentQ}`}>
              Your Answer
            </label>
            <textarea
              id={`answer-${currentQ}`}
              className="riq-textarea"
              placeholder="Type your answer here. Be specific and detailed — mention examples, projects, or experiences from your background..."
              value={answers[currentQ]}
              onChange={(e) => handleAnswerChange(currentQ, e.target.value)}
              rows={10}
            />
            <div className="riq-char-count">
              {answers[currentQ]?.length ?? 0} characters
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="riq-nav-arrows">
            <button
              className="riq-arrow-btn"
              onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
              disabled={currentQ === 0}
            >
              ← Previous
            </button>
            <div className="riq-dots">
              {interview.questions.map((_, i) => (
                <button
                  key={i}
                  className={`riq-dot ${i === currentQ ? "active" : ""} ${answers[i]?.trim() ? "answered" : ""}`}
                  onClick={() => setCurrentQ(i)}
                />
              ))}
            </div>
            <button
              className="riq-arrow-btn riq-arrow-next"
              onClick={() => setCurrentQ((prev) => Math.min(total - 1, prev + 1))}
              disabled={currentQ === total - 1}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Tips Card */}
        <div className="riq-tips-card">
          <h4 className="riq-tips-title">💡 Tips for a great answer</h4>
          <ul className="riq-tips-list">
            <li>Use the STAR method: Situation, Task, Action, Result</li>
            <li>Reference specific projects or experiences from your resume</li>
            <li>Be concise but thorough — aim for 3-5 sentences minimum</li>
            <li>Mention specific technologies, metrics, or outcomes where relevant</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
