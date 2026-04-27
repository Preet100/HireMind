"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteInterview } from "@/lib/actions/general.action";
import toast from "react-hot-toast";

export default function DeletableInterviewWrapper({
  interviewId,
  userId,
  children
}: {
  interviewId: string;
  userId: string;
  children: React.ReactNode;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = () => {
    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[200px]">
        <p className="font-semibold text-white">Delete this interview?</p>
        <p className="text-sm text-light-400">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end mt-2">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm bg-dark-400 hover:bg-dark-300 text-white rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              setIsDeleting(true);
              const result = await deleteInterview(interviewId, userId);
              if (result.success) {
                toast.success("Interview deleted");
                router.refresh();
              } else {
                toast.error(result.message);
                setIsDeleting(false);
              }
            }}
            className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), { 
      duration: Infinity, 
      style: { background: "#16171e", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } 
    });
  };

  return (
    <div className="relative group">
      {children}
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-4 left-4 z-10 bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 shadow-lg flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
        title="Delete Interview"
      >
        {isDeleting ? (
           <span className="w-4 h-4 block border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        )}
      </button>
    </div>
  );
}
