import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";
import { getUserById } from "@/lib/actions/auth.action";

const InterviewCard = async ({
  interviewId,
  userId,
  creatorId,
  role,
  type,
  techstack,
  createdAt,
  source,
}: InterviewCardProps) => {
  const [feedback, creator] = await Promise.all([
    userId && interviewId
      ? getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null,
    creatorId ? getUserById(creatorId) : null,
  ]);

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-light-400 text-white",
      Mixed: "bg-primary-200 text-dark-100",
      Technical: "bg-light-800 text-light-100",
    }[normalizedType] || "bg-light-600 text-white";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="group card-border w-[360px] max-sm:w-full min-h-[420px] relative transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(202,197,254,0.2)]">
      <div className="card-interview h-full relative z-10 transition-colors duration-300 group-hover:bg-[#1a1b26]/80 flex flex-col justify-between">
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-200/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="flex flex-col flex-grow relative z-10">
          {/* Header Row */}
          <div className="flex justify-between items-start w-full relative">
            <div className="relative size-[80px] rounded-full p-1 bg-white/5 border border-white/10 group-hover:border-primary-200/50 transition-colors duration-300 shadow-lg">
              <Image
                src="/logo.png"
                alt="LPU Logo"
                fill
                sizes="80px"
                className="rounded-full object-contain p-1"
              />
            </div>

            {/* Type Badge */}
            <div
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm transition-transform duration-300 group-hover:scale-105",
                badgeColor
              )}
            >
              {normalizedType}
            </div>
          </div>

          {/* Interview Role */}
          <h3 className="mt-6 text-xl font-bold capitalize text-white tracking-tight group-hover:text-primary-100 transition-colors duration-300">
            {role} Interview
          </h3>

          {/* Date & Score */}
          <div className="flex flex-row items-center gap-4 mt-3 text-sm text-light-400">
            <div className="flex items-center gap-1.5">
              <Image src="/calendar.svg" width={16} height={16} alt="calendar" className="opacity-70 group-hover:opacity-100 transition-opacity" />
              <p className="font-medium">{formattedDate}</p>
            </div>

            <div className="w-1 h-1 rounded-full bg-light-600" />

            <div className="flex items-center gap-1.5">
              <Image src="/star.svg" width={16} height={16} alt="star" className="opacity-70 group-hover:opacity-100 transition-opacity" />
              <p className="font-medium text-white">
                {feedback ? (feedback.maxScore ? `${feedback.totalScore}/${feedback.maxScore}` : `${feedback.totalScore}/100`) : "---"}
              </p>
            </div>
          </div>

          {/* Creator Badge */}
          {creator && (
            <div className="flex flex-row gap-2.5 mt-5 items-center bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/5 transition-colors duration-300 group-hover:bg-white/10 group-hover:border-white/10">
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-dark-100 shadow-sm"
                style={{ background: "linear-gradient(135deg, #CAC5FE, #a89cf7)" }}
              >
                {creator.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-light-400">
                Created by <span className="text-white font-semibold">{creator.name}</span>
              </span>
            </div>
          )}

          {/* Feedback or Placeholder Text */}
          <div className="mt-5 relative">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary-200/30 rounded-full group-hover:bg-primary-200 transition-colors duration-300" />
            <p className="pl-4 text-sm leading-relaxed text-light-100 line-clamp-2 italic">
              "{feedback?.finalAssessment || "You haven't taken this interview yet. Take it now to improve your skills."}"
            </p>
          </div>
        </div>

        <div className="flex flex-row justify-between items-center mt-6 pt-5 border-t border-white/10 group-hover:border-white/20 transition-colors duration-300 relative z-10">
          <DisplayTechIcons techStack={techstack} />

          <Button asChild className="btn-primary shadow-lg shadow-primary-200/20 group-hover:shadow-primary-200/40 transition-all duration-300 group-hover:-translate-y-0.5">
            <Link
              href={
                feedback
                  ? `/interview/${interviewId}/feedback`
                  : source === "resume"
                  ? `/resume-interview/${interviewId}`
                  : `/interview/${interviewId}`
              }
            >
              {feedback ? "Check Feedback" : source === "resume" ? "Answer Questions" : "View Interview"}
            </Link>
          </Button>
        </div>

        {/* Resume badge */}
        {source === "resume" && (
          <div className="absolute -bottom-1 -right-1 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-300 pointer-events-none z-0">
            <Image src="/file.svg" width={140} height={140} alt="resume background" className="rotate-[-15deg] translate-y-4" />
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewCard;
