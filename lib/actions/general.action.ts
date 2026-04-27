"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

// ─── Create Feedback (with Gemini fallback) ───────────────────────────────────

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    let object: z.infer<typeof feedbackSchema>;

    try {
      const result = await generateObject({
        model: google("gemini-2.0-flash", {
          structuredOutputs: false,
        }),
        schema: feedbackSchema,
        prompt: `
        You are an AI interviewer analyzing a mock voice interview transcript. Your task is to evaluate the candidate based on their answers to your questions.
        Transcript:
        ${formattedTranscript}

        Extract the specific questions asked by the interviewer and the candidate's answers. Evaluate each question and answer pair individually. Determine if the candidate's answer is correct/acceptable (isCorrect: boolean) and provide specific feedback for that answer. For open-ended behavioral questions, mark as correct if the answer is reasonably professional, detailed, and relevant.

        CRITICAL INSTRUCTION FOR SKIPPED QUESTIONS:
        If the candidate's answer is completely empty, very short, or explicitly states they are skipping the question or don't know, you MUST set "isSkipped": true, "isCorrect": false, and write the feedback as "Question was not attempted or skipped." Do not hallucinate or guess an answer.

        Also identify:
        - 3 Key strengths demonstrated overall
        - 3 Clear areas for improvement overall
        - A final overall assessment paragraph summarizing their performance
        
        Calculate totalScore as the number of correct answers. maxScore should be the total number of questions extracted.
        `,
        system:
          "You are a professional technical interviewer analyzing a mock interview transcript. Your task is to evaluate the candidate's specific answers.",
      });
      object = result.object;
    } catch {
      // Gemini quota/auth unavailable — score locally
      object = generateTranscriptFeedback(transcript);
    }

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      maxScore: object.maxScore || object.evaluations?.length || 1,
      evaluations: object.evaluations,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;
    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }
    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

// ─── Get Interview By ID ──────────────────────────────────────────────────────

export async function getInterviewById(id: string): Promise<Interview | null> {
  const doc = await db.collection("interviews").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Interview;
}

// ─── Get Feedback By Interview ID ────────────────────────────────────────────

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

// ─── Get Latest Interviews (community) ───────────────────────────────────────

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;
  if (!userId) return [];

  const RAW_FETCH_LIMIT = Math.max(limit * 5, 100);

  const snapshot = await db
    .collection("interviews")
    .where("finalized", "==", true)
    .limit(RAW_FETCH_LIMIT)
    .get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Interview))
    .filter((interview) => interview.userId !== userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

// ─── Get Interviews By User ID ────────────────────────────────────────────────

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  if (!userId) return [];

  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

// ─── Save a completed voice interview from the Vapi transcript ───────────────

export async function saveVoiceInterview(params: {
  userId: string;
  userName: string;
  transcript: { role: string; content: string }[];
}): Promise<{ success: boolean; interviewId?: string; feedbackId?: string }> {
  const { userId, transcript } = params;

  try {
    // Extract questions asked by the AI assistant from the transcript
    const questions = transcript
      .filter(
        (m) =>
          m.role === "assistant" &&
          (m.content.trim().endsWith("?") ||
            m.content.toLowerCase().includes("tell me") ||
            m.content.toLowerCase().includes("describe") ||
            m.content.toLowerCase().includes("explain") ||
            m.content.toLowerCase().includes("walk me through"))
      )
      .map((m) => m.content.trim())
      .filter((q) => q.length > 20)
      .slice(0, 15);

    const finalQuestions =
      questions.length >= 3
        ? questions
        : [
            "Tell me about your background and experience.",
            "What are your greatest technical strengths?",
            "Describe a challenging project you've worked on.",
            "How do you approach problem-solving under pressure?",
            "Where do you see yourself in 3 years?",
          ];

    // Try to detect role from transcript keywords
    const fullText = transcript.map((m) => m.content).join(" ").toLowerCase();
    const roleMap: [string, string][] = [
      ["frontend", "Frontend Developer"],
      ["backend", "Backend Developer"],
      ["full stack", "Full Stack Developer"],
      ["fullstack", "Full Stack Developer"],
      ["mobile", "Mobile Developer"],
      ["devops", "DevOps Engineer"],
      ["data scientist", "Data Scientist"],
      ["machine learning", "ML Engineer"],
      ["software engineer", "Software Engineer"],
    ];
    const role =
      roleMap.find(([key]) => fullText.includes(key))?.[1] ??
      "Software Developer";

    // Save the interview record with source: "voice"
    const interviewRef = await db.collection("interviews").add({
      userId,
      role,
      level: "Mid",
      type: "Mixed",
      techstack: [],
      questions: finalQuestions,
      finalized: true,
      source: "voice",
      createdAt: new Date().toISOString(),
    });

    // Generate feedback from the transcript
    const feedbackResult = await createFeedback({
      interviewId: interviewRef.id,
      userId,
      transcript,
    });

    return {
      success: true,
      interviewId: interviewRef.id,
      feedbackId: feedbackResult.feedbackId,
    };
  } catch (error) {
    console.error("Error saving voice interview:", error);
    return { success: false };
  }
}

// ─── Local fallback: score a voice transcript heuristically ──────────────────

function generateTranscriptFeedback(
  transcript: { role: string; content: string }[]
): z.infer<typeof feedbackSchema> {
  const evaluations: Array<{question: string, answer: string, isCorrect: boolean, feedback: string}> = [];
  
  let currentQuestion = "";
  let currentAnswer = "";
  
  for (const msg of transcript) {
    if (msg.role === "assistant") {
      // If we already have a question and an answer, save it
      if (currentQuestion && currentAnswer !== undefined) {
        const isSkipped = currentAnswer.trim().length === 0;
        const isCorrect = currentAnswer.trim().split(/\s+/).length >= 15;
        evaluations.push({
          question: currentQuestion,
          answer: currentAnswer.trim(),
          isCorrect: isCorrect && !isSkipped,
          isSkipped,
          feedback: isSkipped ? "Question was not attempted." : isCorrect ? "Good conversational answer." : "Answer was too brief. Try to elaborate more."
        });
        currentAnswer = "";
      }
      currentQuestion = msg.content;
    } else if (msg.role === "user") {
      currentAnswer += " " + msg.content;
    }
  }
  
  // push the last one
  if (currentQuestion && currentAnswer !== undefined) {
    const isSkipped = currentAnswer.trim().length === 0;
    const isCorrect = currentAnswer.trim().split(/\s+/).length >= 15;
    evaluations.push({
      question: currentQuestion,
      answer: currentAnswer.trim(),
      isCorrect: isCorrect && !isSkipped,
      isSkipped,
      feedback: isSkipped ? "Question was not attempted." : isCorrect ? "Good conversational answer." : "Answer was too brief. Try to elaborate more."
    });
  }

  const correctCount = evaluations.filter(e => e.isCorrect).length;
  const totalQuestions = Math.max(evaluations.length, 1);
  const percentCorrect = correctCount / totalQuestions;

  const tier = percentCorrect >= 0.7 ? "strong" : percentCorrect >= 0.4 ? "adequate" : "needs improvement";

  const assessments: Record<string, string> = {
    strong: `Excellent voice interview performance. You answered ${correctCount} out of ${totalQuestions} questions well. The candidate communicated clearly and demonstrated solid knowledge.`,
    adequate: `Good voice interview performance. You answered ${correctCount} out of ${totalQuestions} questions adequately. More detailed examples would strengthen future performances.`,
    "needs improvement": `You answered ${correctCount} out of ${totalQuestions} questions with sufficient detail. Focus on giving more detailed responses and practicing the STAR method.`,
  };

  return {
    totalScore: correctCount,
    maxScore: totalQuestions,
    evaluations,
    strengths: [
      "Completed the full voice interview demonstrating commitment.",
      evaluations.length > 5
        ? "Engaged consistently throughout all interview questions."
        : "Showed willingness to participate in a voice-based interview format.",
    ],
    areasForImprovement: [
      "Use the STAR method (Situation, Task, Action, Result) for behavioral questions.",
      "Aim for 60–100 words per answer for the ideal depth-to-conciseness ratio.",
    ],
    finalAssessment: assessments[tier],
  };
}

// ─── Delete Interview (and associated feedback) ───────────────────────────────

export async function deleteInterview(interviewId: string, userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const interviewRef = db.collection("interviews").doc(interviewId);
    const interviewDoc = await interviewRef.get();

    if (!interviewDoc.exists) {
      return { success: false, message: "Interview not found." };
    }

    if (interviewDoc.data()?.userId !== userId) {
      return { success: false, message: "Unauthorized to delete this interview." };
    }

    // Delete the interview
    await interviewRef.delete();

    // Delete associated feedback documents
    const feedbackQuery = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .get();

    const batch = db.batch();
    feedbackQuery.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return { success: true, message: "Interview deleted successfully." };
  } catch (error: any) {
    console.error("Error deleting interview:", error);
    return { success: false, message: "Failed to delete interview." };
  }
}
