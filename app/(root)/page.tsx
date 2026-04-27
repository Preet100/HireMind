import Link from "next/link";
import Image from "next/image";

import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");

  let userInterviews: Interview[] = [];
  let allInterview: Interview[] = [];

  if (user?.id) {
    [userInterviews, allInterview] = await Promise.all([
      getInterviewsByUserId(user.id),
      getLatestInterviews({ userId: user.id }),
    ]);
  }

  const hasPastInterviews = (userInterviews?.length ?? 0) > 0;
  const hasUpcomingInterviews = (allInterview?.length ?? 0) > 0;

  return (
    <div className="dashboard-page relative overflow-hidden">
      {/* Background Static Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] max-w-[100vw] h-[500px] bg-primary-200/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-[400px] max-w-[100vw] h-[400px] bg-[#7c6ff7]/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
      
      {/* Centered Purple White Light Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] max-w-[100vw] h-[600px] mix-blend-screen pointer-events-none" 
           style={{ background: "radial-gradient(ellipse at center, rgba(168,156,247,0.2) 0%, rgba(168,156,247,0.05) 40%, transparent 70%)" }} />

      {/* Floating Sparkles */}
      <svg className="absolute top-20 left-[10%] text-white/50 w-6 h-6 animate-float-blink pointer-events-none" viewBox="0 0 24 24" fill="none" style={{ animationDelay: "0s" }}>
        <path d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z" fill="currentColor"/>
      </svg>
      <svg className="absolute top-40 right-[15%] text-primary-200/60 w-8 h-8 animate-float-blink pointer-events-none" viewBox="0 0 24 24" fill="none" style={{ animationDelay: "1.5s", animationDuration: "5s" }}>
        <path d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z" fill="currentColor"/>
      </svg>
      <svg className="absolute top-72 left-[20%] text-[#7c6ff7]/60 w-5 h-5 animate-float-blink pointer-events-none" viewBox="0 0 24 24" fill="none" style={{ animationDelay: "3s", animationDuration: "6s" }}>
        <path d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z" fill="currentColor"/>
      </svg>
      <svg className="absolute top-10 right-[35%] text-white/40 w-4 h-4 animate-float-blink pointer-events-none" viewBox="0 0 24 24" fill="none" style={{ animationDelay: "0.5s", animationDuration: "3.5s" }}>
        <path d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z" fill="currentColor"/>
      </svg>
      <svg className="absolute top-52 left-[5%] text-white/30 w-7 h-7 animate-float-blink pointer-events-none" viewBox="0 0 24 24" fill="none" style={{ animationDelay: "2.2s", animationDuration: "4.5s" }}>
        <path d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z" fill="currentColor"/>
      </svg>
      <svg className="absolute top-24 right-[8%] text-[#7c6ff7]/50 w-6 h-6 animate-float-blink pointer-events-none" viewBox="0 0 24 24" fill="none" style={{ animationDelay: "4s", animationDuration: "5.5s" }}>
        <path d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z" fill="currentColor"/>
      </svg>
      <svg className="absolute top-80 right-[30%] text-primary-200/40 w-5 h-5 animate-float-blink pointer-events-none" viewBox="0 0 24 24" fill="none" style={{ animationDelay: "1s", animationDuration: "4s" }}>
        <path d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z" fill="currentColor"/>
      </svg>
      <svg className="absolute top-96 left-[35%] text-white/50 w-4 h-4 animate-float-blink pointer-events-none" viewBox="0 0 24 24" fill="none" style={{ animationDelay: "3.5s", animationDuration: "6.5s" }}>
        <path d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z" fill="currentColor"/>
      </svg>
      <svg className="absolute top-[28rem] right-[10%] text-[#7c6ff7]/60 w-7 h-7 animate-float-blink pointer-events-none" viewBox="0 0 24 24" fill="none" style={{ animationDelay: "0.8s", animationDuration: "5s" }}>
        <path d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z" fill="currentColor"/>
      </svg>
      <svg className="absolute top-16 left-[40%] text-primary-200/50 w-3 h-3 animate-float-blink pointer-events-none" viewBox="0 0 24 24" fill="none" style={{ animationDelay: "2s", animationDuration: "3s" }}>
        <path d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z" fill="currentColor"/>
      </svg>

      {/* Hero Section */}
      <section className="hero-section relative z-10">
        <div className="hero-content">
          <div className="hero-badge">🚀 AI-Powered Mock Interviews</div>
          <h1 className="hero-title">
            Get Interview-Ready <br />
            <span className="hero-title-accent">with AI Feedback</span>
          </h1>
          <p className="hero-subtitle">
            Practice with realistic interview questions and receive instant,
            detailed AI feedback to sharpen your skills.
          </p>
          <div className="hero-actions">
            <Button asChild className="btn-primary hero-btn-main">
              <Link href="/interview">Start Interview</Link>
            </Button>
            <Button asChild className="btn-secondary hero-btn-secondary">
              <Link href="/resume-interview">📄 Upload Resume</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Divider Section */}
      <section className="flex justify-center w-full py-8 border-y border-white/10 bg-white/[0.02]">
        <div className="hero-stats !pt-0">
          <div className="hero-stat">
            <span className="hero-stat-value">5+</span>
            <span className="hero-stat-label">Interview Types</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-value">AI</span>
            <span className="hero-stat-label">Instant Feedback</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-value">100%</span>
            <span className="hero-stat-label">Free to Use</span>
          </div>
        </div>
      </section>

      {/* Feature Cards Row */}
      <section className="feature-cards-row">
        <div className="feature-card">
          <div className="feature-card-icon">🎯</div>
          <h3 className="feature-card-title">Targeted Practice</h3>
          <p className="feature-card-desc">Choose role, level, and tech stack for a custom interview experience.</p>
        </div>
        <div className="feature-card">
          <div className="feature-card-icon">🤖</div>
          <h3 className="feature-card-title">AI Analysis</h3>
          <p className="feature-card-desc">Get scored on communication, technical skills, confidence and more.</p>
        </div>
        <div className="feature-card">
          <div className="feature-card-icon">📄</div>
          <h3 className="feature-card-title">Resume Interviews</h3>
          <p className="feature-card-desc">Upload your CV for questions tailored to your exact experience.</p>
        </div>
        <div className="feature-card">
          <div className="feature-card-icon">📈</div>
          <h3 className="feature-card-title">Track Progress</h3>
          <p className="feature-card-desc">Review all past interviews and track your improvement over time.</p>
        </div>
      </section>

      {/* Your Interviews */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Your Interviews</h2>
          <span className="section-count">{userInterviews?.length ?? 0} total</span>
        </div>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                creatorId={interview.userId}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                source={interview.source}
              />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🎤</div>
              <p className="empty-state-text">You haven&apos;t taken any interviews yet.</p>
              <Button asChild className="btn-primary mt-4">
                <Link href="/interview">Start your first interview</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Community Interviews */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Explore Interviews</h2>
          <span className="section-badge">Community</span>
        </div>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                creatorId={interview.userId}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                source={interview.source}
              />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🌐</div>
              <p className="empty-state-text">No community interviews available yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
