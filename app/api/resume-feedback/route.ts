import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const { interviewId, userId, questions, answers } = await req.json();

    if (!interviewId || !userId || !questions || !answers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Build a Q&A transcript for Gemini to analyze
    const qaTranscript = questions
      .map(
        (q: string, i: number) =>
          `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i] || "(No answer provided)"}`
      )
      .join("\n\n");

    // Try Gemini first — fall back to local scorer if quota/auth fails
    let object: z.infer<typeof feedbackSchema>;

    try {
      const result = await generateObject({
        model: google("gemini-2.0-flash", {
          structuredOutputs: false,
        }),
        schema: feedbackSchema,
        prompt: `You are an expert technical interviewer evaluating a candidate's written responses to interview questions.

Interview Q&A:
${qaTranscript}

Evaluate each question and answer pair individually. Determine if the candidate's answer is correct/acceptable (isCorrect: boolean) and provide specific feedback for that answer (why it was good or how to improve). For open-ended behavioral questions, mark as correct if the answer is reasonably professional, detailed, and relevant. 

CRITICAL INSTRUCTION FOR SKIPPED QUESTIONS:
If the candidate's answer is completely empty, missing, or explicitly states they are skipping the question, you MUST set "isSkipped": true, "isCorrect": false, and write the feedback as "Question was not attempted." Do not hallucinate or guess an answer.

Also identify:
- 3 Key strengths demonstrated overall
- 3 Clear areas for improvement overall
- A final overall assessment paragraph summarizing their performance

Calculate totalScore as the number of correct answers. maxScore should be the total number of questions.`,
        system:
          "You are a professional technical interviewer evaluating written interview responses. Focus on determining if each answer is correct/acceptable.",
      });
      object = result.object;
    } catch (aiError: any) {
      // Fallback: score locally when Gemini quota/auth is unavailable
      console.warn(
        "Gemini unavailable for feedback, using local scorer:",
        aiError.message
      );
      object = generateFallbackFeedback(questions, answers);
    }

    const feedback = {
      interviewId,
      userId,
      totalScore: object.totalScore,
      maxScore: questions.length,
      evaluations: object.evaluations,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    // Check if feedback already exists for this interview
    const existingFeedback = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    let feedbackRef;
    if (!existingFeedback.empty) {
      feedbackRef = existingFeedback.docs[0].ref;
      await feedbackRef.update(feedback);
    } else {
      feedbackRef = await db.collection("feedback").add(feedback);
    }

    return NextResponse.json(
      { success: true, feedbackId: feedbackRef.id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Feedback generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate feedback." },
      { status: 500 }
    );
  }
}

// ─── Local fallback: scores answers heuristically ────────────────────────────

function generateFallbackFeedback(
  questions: string[],
  answers: string[]
): z.infer<typeof feedbackSchema> {
  let correctCount = 0;
  
  const evaluations = questions.map((q, i) => {
    const answer = answers[i] || "";
    const len = answer.trim().length;
    const words = answer.trim().split(/\s+/).length;

    // Simple heuristic for correct: length and detail
    // If it's a "I don't know" or very short, it's incorrect.
    const isSkipped = len === 0;
    const isCorrect = words >= 20;
    
    if (isCorrect && !isSkipped) correctCount++;

    let feedbackText = "";
    if (isSkipped) {
      feedbackText = "Question was not attempted.";
    } else if (!isCorrect) {
      feedbackText = "Your answer was too brief. Expand on your experience and provide specific examples or technical details.";
    } else {
      const hasExample = /example|instance|project|built|implemented|when i/i.test(answer);
      if (hasExample) {
        feedbackText = "Good answer. Providing specific examples makes your response much stronger and more credible.";
      } else {
        feedbackText = "Acceptable answer, but could be improved by using the STAR method (Situation, Task, Action, Result) to provide a real-world example.";
      }
    }

    return {
      question: q,
      answer: answer,
      isCorrect: isCorrect && !isSkipped,
      isSkipped,
      feedback: feedbackText
    };
  });

  const percentCorrect = correctCount / questions.length;
  const tier = percentCorrect >= 0.8 ? "strong" : percentCorrect >= 0.5 ? "adequate" : "needs improvement";

  const strengths = percentCorrect >= 0.5 
    ? ["Demonstrated ability to answer most questions with sufficient detail.", "Showed engagement with the interview topics."]
    : ["Completed the interview, showing willingness to practice."];

  const areasForImprovement = percentCorrect < 0.8
    ? ["Ensure every answer is detailed and uses concrete examples.", "Practice expanding on brief answers.", "Use the STAR method for behavioral questions."]
    : ["Continue refining answers to be concise yet highly detailed."];

  const finalAssessment = tier === "strong"
    ? `Great job! You answered ${correctCount} out of ${questions.length} questions well. You provided detailed and relevant responses.`
    : tier === "adequate"
    ? `Good effort. You answered ${correctCount} out of ${questions.length} questions adequately, but several answers lacked sufficient depth or examples.`
    : `You answered ${correctCount} out of ${questions.length} questions with enough detail. You need to focus on expanding your answers significantly and providing real-world examples from your experience.`;

  return {
    totalScore: correctCount,
    maxScore: questions.length,
    evaluations,
    strengths,
    areasForImprovement,
    finalAssessment,
  };
}
