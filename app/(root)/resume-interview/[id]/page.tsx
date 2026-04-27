import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewById } from "@/lib/actions/general.action";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import ResumeInterviewClient from "@/components/ResumeInterviewClient";

const ResumeInterviewPage = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  return (
    <div className="riq-page">
      {/* Page Header */}
      <div className="riq-page-header">
        <div className="riq-page-header-left">
          <div className="riq-page-badge">📄 Resume Interview</div>
          <h1 className="riq-page-title">
            <span className="capitalize">{interview.role}</span> Interview
          </h1>
          <p className="riq-page-subtitle">
            {interview.questions.length} personalized questions generated from your resume.
            Take your time to answer each one thoughtfully — your responses will be evaluated by AI.
          </p>
        </div>
        <div className="riq-page-header-right">
          <DisplayTechIcons techStack={interview.techstack} />
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="riq-meta-tag">{interview.level}</span>
            <span className="riq-meta-tag">{interview.type}</span>
          </div>
        </div>
      </div>

      <ResumeInterviewClient
        interview={{
          id,
          role: interview.role,
          level: interview.level,
          type: interview.type,
          techstack: interview.techstack,
          questions: interview.questions,
        }}
        userId={user.id}
      />
    </div>
  );
};

export default ResumeInterviewPage;
