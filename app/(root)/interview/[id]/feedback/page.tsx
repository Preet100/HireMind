import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  const skippedCount = feedback?.evaluations?.filter(e => e.isSkipped).length || 0;

  return (
    <section className="section-feedback">
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold">
          Feedback on the Interview -{" "}
          <span className="capitalize">{interview.role}</span> Interview
        </h1>
      </div>

      <div className="flex flex-row justify-center ">
        <div className="flex flex-row gap-5">
          <div className="flex flex-col gap-1">
            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" width={22} height={22} alt="star" />
              <p>
                Overall Impression:{" "}
                <span className="text-primary-200 font-bold">
                  {feedback?.totalScore}
                </span>
                /{feedback?.maxScore ?? 100}
              </p>
            </div>
            {skippedCount > 0 && (
              <p className="text-sm text-light-400 font-medium ml-7">
                Not Attempted: {skippedCount}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="flex flex-row gap-2">
            <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
            <p>
              {feedback?.createdAt
                ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <hr />

      <p>{feedback?.finalAssessment}</p>

      {/* Interview Breakdown */}
      <div className="flex flex-col gap-6">
        <h2>Question & Answer Review:</h2>
        
        {/* Render New Evaluations Array */}
        {feedback?.evaluations && feedback.evaluations.length > 0 ? (
          feedback.evaluations.map((evaluation, index) => (
            <div key={index} className="bg-dark-300 p-5 rounded-lg flex flex-col gap-3">
              <h3 className="font-semibold text-lg">
                <span className="text-primary-200">Q{index + 1}:</span> {evaluation.question}
              </h3>
              
              <div className="flex flex-col gap-1">
                <p className="text-sm text-light-400 font-semibold">Your Answer:</p>
                <p className="italic bg-dark-400 p-3 rounded-md text-light-200 border-l-2 border-primary-200">
                  {evaluation.isSkipped || !evaluation.answer?.trim() ? (
                    <span className="text-light-400">[No Answer Provided]</span>
                  ) : (
                    `"${evaluation.answer}"`
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {evaluation.isSkipped ? (
                  <span className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full text-xs font-bold border border-gray-500/30">
                    Not Attempted
                  </span>
                ) : evaluation.isCorrect ? (
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">
                    Correct / Acceptable
                  </span>
                ) : (
                  <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30">
                    Needs Improvement
                  </span>
                )}
              </div>

              <div className="mt-1">
                <p className="text-sm font-semibold text-light-400">AI Feedback:</p>
                <p className="text-sm text-light-200">{evaluation.feedback}</p>
              </div>
            </div>
          ))
        ) : (
          /* Fallback for old interviews before the schema change */
          feedback?.categoryScores?.map((category, index) => (
            <div key={index} className="bg-dark-300 p-4 rounded-lg">
              <p className="font-bold mb-1 text-primary-200">
                {index + 1}. {category.name} ({category.score}/100)
              </p>
              <p className="text-sm text-light-200">{category.comment}</p>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h3>Strengths</h3>
        <ul>
          {feedback?.strengths?.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h3>Areas for Improvement</h3>
        <ul>
          {feedback?.areasForImprovement?.map((area, index) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      </div>

      <div className="buttons">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">
              Back to dashboard
            </p>
          </Link>
        </Button>

        <Button className="btn-primary flex-1">
          <Link
            href={
              interview.source === "resume"
                ? `/resume-interview/${id}`
                : `/interview/${id}`
            }
            className="flex w-full justify-center"
          >
            <p className="text-sm font-semibold text-black text-center">
              Retake Interview
            </p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;
