import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import ResumeUpload from "@/components/ResumeUpload";

export const metadata = {
  title: "Resume Interview | HireMind AI",
  description: "Upload your resume and get a personalized AI-powered mock interview tailored to your skills and experience.",
};

const ResumeInterviewPage = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="resume-interview-page">
      {/* Header */}
      <div className="resume-page-header">
        <div className="resume-header-badge">
          <span>✨ AI-Powered</span>
        </div>
        <h1 className="resume-page-title">Resume-Based Interview</h1>
        <p className="resume-page-subtitle">
          Upload your CV or resume and our AI will analyze your skills,
          experience, and background to generate a personalized interview
          with questions tailored specifically to you.
        </p>
      </div>

      {/* How it works */}
      <div className="resume-steps-row">
        <div className="resume-step-card">
          <div className="resume-step-number">01</div>
          <h3 className="resume-step-title">Upload Resume</h3>
          <p className="resume-step-desc">Upload your PDF resume or CV</p>
        </div>
        <div className="resume-step-divider" />
        <div className="resume-step-card">
          <div className="resume-step-number">02</div>
          <h3 className="resume-step-title">AI Analysis</h3>
          <p className="resume-step-desc">Gemini AI extracts your skills and generates custom questions</p>
        </div>
        <div className="resume-step-divider" />
        <div className="resume-step-card">
          <div className="resume-step-number">03</div>
          <h3 className="resume-step-title">Start Interview</h3>
          <p className="resume-step-desc">Answer questions in a live voice interview session</p>
        </div>
        <div className="resume-step-divider" />
        <div className="resume-step-card">
          <div className="resume-step-number">04</div>
          <h3 className="resume-step-title">Get Feedback</h3>
          <p className="resume-step-desc">Receive detailed AI feedback and a performance score</p>
        </div>
      </div>

      {/* Upload Card */}
      <div className="resume-upload-card">
        <div className="resume-upload-card-header">
          <h2 className="resume-upload-card-title">Upload Your Resume</h2>
          <p className="resume-upload-card-desc">
            Hello, <span className="text-primary-200 font-semibold">{user.name}</span>! Drop your resume below to get started.
          </p>
        </div>
        <ResumeUpload userId={user.id} userName={user.name} />
      </div>
    </div>
  );
};

export default ResumeInterviewPage;
