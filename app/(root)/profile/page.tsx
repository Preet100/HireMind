import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId } from "@/lib/actions/general.action";
import InterviewCard from "@/components/InterviewCard";
import DeletableInterviewWrapper from "@/components/DeletableInterviewWrapper";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const interviews = await getInterviewsByUserId(user.id);
  const hasInterviews = interviews && interviews.length > 0;

  return (
    <section className="section-dashboard">
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">Your Profile</h1>
          <p className="text-light-400">
            Manage your created mock interviews. Hover over an interview to delete it.
          </p>
        </div>
        
        <div className="bg-dark-300 p-6 rounded-xl border border-dark-400 mb-6">
          <h2 className="text-xl font-semibold mb-2">Account Details</h2>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <p className="text-sm text-light-400">Name</p>
              <p className="text-white font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-light-400">Email</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-light-400">Total Interviews Created</p>
              <p className="text-white font-medium">{interviews?.length || 0}</p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-4">Manage Interviews</h2>
        
        <div className="flex flex-row gap-5 flex-wrap w-full mt-4">
          {hasInterviews ? (
            interviews.map((interview) => (
              <DeletableInterviewWrapper 
                key={interview.id} 
                interviewId={interview.id} 
                userId={user.id}
              >
                <InterviewCard
                  userId={user.id}
                  creatorId={interview.userId}
                  interviewId={interview.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                  source={interview.source}
                />
              </DeletableInterviewWrapper>
            ))
          ) : (
            <div className="flex w-full items-center justify-center p-10 bg-dark-300 rounded-xl border border-dark-400">
              <p className="text-light-400">You haven't created any interviews yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
