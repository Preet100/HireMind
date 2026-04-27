import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { db } from "@/firebase/admin";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing resume file or userId" },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 }
      );
    }

    // Step 1: Extract text using unpdf (WebAssembly-based, zero native deps)
    const arrayBuffer = await file.arrayBuffer();
    const { extractText } = await import("unpdf");
    const { text: pages } = await extractText(new Uint8Array(arrayBuffer), {
      mergePages: true,
    });

    const resumeText = Array.isArray(pages)
      ? pages.join("\n")
      : String(pages ?? "").trim();

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract text from this PDF. Please use a text-based (not scanned) PDF.",
        },
        { status: 400 }
      );
    }

    // Step 2: Try Gemini — fall back to local generator if quota/auth fails
    const resumeSchema = z.object({
      role: z.string(),
      level: z.enum(["Junior", "Mid", "Senior"]),
      type: z.enum(["Technical", "Behavioral", "Mixed"]),
      techstack: z.array(z.string()).max(8),
      questions: z.array(z.string()).min(10).max(15),
    });

    let object: z.infer<typeof resumeSchema>;

    try {
      const result = await generateObject({
        model: google("gemini-2.0-flash", {
          structuredOutputs: false,
        }),
        schema: resumeSchema,
        prompt: `Analyze this resume and generate a comprehensive tailored mock interview.

Resume content:
${resumeText.slice(0, 6000)}

Based on the above resume, return:
- role: the most suitable job title for this candidate
- level: Junior (0-2 years), Mid (2-5 years), or Senior (5+ years)
- type: Technical (strong coding/tech focus), Behavioral (soft skills), or Mixed
- techstack: up to 8 key technologies/frameworks mentioned in the resume
- questions: between 10 and 15 specific interview questions tailored to THIS candidate's actual skills, projects, and experience. Spread questions across:
  * Technical depth (e.g. architecture decisions, technologies they used)
  * Behavioral / situational (e.g. challenges faced, teamwork, leadership)
  * Project-specific (dig into real projects listed on their resume)
  * Problem-solving & critical thinking
  * Role-fit & motivation
  Make every question specific to what is actually written in this resume — avoid generic questions.`,
      });
      object = result.object;
    } catch (aiError: any) {
      // Fallback: parse resume locally when Gemini quota/auth is unavailable
      console.warn("Gemini unavailable, using local fallback:", aiError.message);
      object = generateFallbackInterview(resumeText);
    }

    // Step 3: Save to Firestore
    const interviewRef = await db.collection("interviews").add({
      userId,
      role: object.role,
      level: object.level,
      type: object.type,
      techstack: object.techstack,
      questions: object.questions,
      finalized: true,
      source: "resume",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ interviewId: interviewRef.id }, { status: 200 });
  } catch (error: any) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze resume. Please try again." },
      { status: 500 }
    );
  }
}

// ─── Local fallback: parses resume text and generates relevant questions ──────

function generateFallbackInterview(resumeText: string): {
  role: string;
  level: "Junior" | "Mid" | "Senior";
  type: "Technical" | "Behavioral" | "Mixed";
  techstack: string[];
  questions: string[];
} {
  const text = resumeText.toLowerCase();

  // Detect tech stack with word boundaries to avoid partial matches
  const techMap: Record<string, string> = {
    "\\breact\\b": "React", "\\bnext\\.?js\\b": "Next.js",
    "\\btypescript\\b": "TypeScript", "\\bjavascript\\b": "JavaScript",
    "\\bnode\\.?js\\b": "Node.js", "\\bexpress\\b": "Express.js",
    "\\bpython\\b": "Python", "\\bdjango\\b": "Django", "\\bfastapi\\b": "FastAPI",
    "\\bjava\\b": "Java", "\\bspring\\b": "Spring Boot", "\\bkotlin\\b": "Kotlin",
    "\\bmongodb\\b": "MongoDB", "\\bpostgresql\\b": "PostgreSQL", "\\bmysql\\b": "MySQL",
    "\\bfirebase\\b": "Firebase", "\\bsupabase\\b": "Supabase", "\\bredis\\b": "Redis",
    "\\bdocker\\b": "Docker", "\\bkubernetes\\b": "Kubernetes", "\\baws\\b": "AWS",
    "\\bazure\\b": "Azure", "\\bgcp\\b": "GCP", "\\bgit\\b": "Git", "\\bgraphql\\b": "GraphQL",
    "\\btailwind\\b": "Tailwind CSS", "\\bflutter\\b": "Flutter", "\\bswift\\b": "Swift",
    "\\brust\\b": "Rust", "\\bgolang\\b": "Go", "\\bgo\\b": "Go", "\\bc\\+\\+\\b": "C++", "\\bc#\\b": "C#",
    "\\bmachine learning\\b": "Machine Learning", "\\btensorflow\\b": "TensorFlow", "\\bpytorch\\b": "PyTorch",
    "\\bkeras\\b": "Keras", "\\bscikit-learn\\b": "Scikit-Learn", "\\bpandas\\b": "Pandas"
  };

  const detectedStack: string[] = [];
  for (const [regex, label] of Object.entries(techMap)) {
    if (new RegExp(regex, "i").test(text) && !detectedStack.includes(label)) {
      detectedStack.push(label);
    }
  }

  const techstack = detectedStack.length > 0
    ? detectedStack.slice(0, 8)
    : ["JavaScript", "HTML/CSS", "Git"];

  // Estimate level
  const seniorKeywords = ["senior", "lead", "architect", "principal", "7 year", "8 year", "9 year", "10 year"];
  const juniorKeywords = ["fresher", "intern", "graduate", "entry", "1 year", "0-1", "< 1"];
  const level: "Junior" | "Mid" | "Senior" =
    seniorKeywords.some((k) => text.includes(k)) ? "Senior"
    : juniorKeywords.some((k) => text.includes(k)) ? "Junior"
    : "Mid";

  // Detect role with strict boundaries to avoid matching phone numbers like "Mobile: 123"
  const roleMap: [RegExp, string][] = [
    [/\b(machine learning|ml engineer|ai engineer|data scientist|data engineer)\b/i, "ML Engineer"],
    [/\b(ios|android|react native|flutter|mobile application)\b/i, "Mobile Developer"],
    [/\b(cloud engineer|devops|sre|site reliability)\b/i, "DevOps Engineer"],
    [/\b(frontend|front-end|front end|ui developer)\b/i, "Frontend Developer"],
    [/\b(backend|back-end|back end)\b/i, "Backend Developer"],
    [/\b(full stack|full-stack|fullstack)\b/i, "Full Stack Developer"],
    [/\b(web developer|software engineer|software developer)\b/i, "Software Engineer"],
  ];

  let role = "Software Engineer";
  for (const [regex, label] of roleMap) {
    if (regex.test(text)) {
      role = label;
      break;
    }
  }

  // Generate dynamic questions based on extracted data
  const questions: string[] = [];
  
  // 1. Role specific introduction
  questions.push(`Could you walk me through your background and how your experience aligns with a ${role} position?`);
  
  // 2. Tech stack specific questions
  if (techstack.length > 0) {
    questions.push(`I see you have experience with ${techstack[0]}. Can you describe a complex problem you solved using it?`);
  }
  if (techstack.length > 1) {
    questions.push(`When working with ${techstack[1]}, what are some of the best practices you follow to ensure scalability?`);
  }
  if (techstack.length > 2) {
    questions.push(`How do you decide when to use ${techstack[2]} versus alternative technologies?`);
  }

  // 3. Level specific questions
  if (level === "Senior") {
    questions.push("As a senior developer, how do you approach system architecture and mentoring junior team members?");
    questions.push("Describe a time you led a major technical initiative. What was the outcome?");
  } else if (level === "Mid") {
    questions.push("Describe a project where you had to take ownership of a significant feature. How did you manage it?");
    questions.push("How do you handle technical debt while still meeting business deadlines?");
  } else {
    questions.push("What is the most challenging bug you've faced recently, and what steps did you take to resolve it?");
    questions.push("How do you typically approach learning a new programming language or framework?");
  }

  // 4. Role specific technicals
  if (role.includes("ML") || role.includes("Data")) {
    questions.push("Explain how you handle overfitting in your machine learning models.");
    questions.push("Walk me through your pipeline for cleaning and preprocessing data before training.");
  } else if (role.includes("Frontend")) {
    questions.push("How do you ensure your web applications are accessible and performant?");
    questions.push("Describe your strategy for managing complex state in a frontend application.");
  } else if (role.includes("Backend")) {
    questions.push("How do you design RESTful APIs for performance and security?");
    questions.push("Explain how you optimize database queries in high-traffic applications.");
  } else if (role.includes("Mobile")) {
    questions.push("What strategies do you use to manage battery life and memory in mobile applications?");
    questions.push("How do you handle offline functionality and data synchronization?");
  }

  // 5. Standard Behavioral
  questions.push(`Describe a situation where you disagreed with a technical decision on your team. What did you do?`);
  questions.push(`Tell me about a time you had to deliver a project under a very tight deadline.`);
  questions.push(`What does a good code review process look like to you?`);

  // Determine random target number of questions between 10 and 15
  const targetCount = Math.floor(Math.random() * 6) + 10; // 10, 11, 12, 13, 14, 15

  // Fallback padding if we don't reach the target count
  const padding = [
    "How do you stay current with new technologies in your field?",
    "Describe your ideal development workflow — from requirement to deployment.",
    "What aspect of your work are you most passionate about, and why?",
    "Can you describe a time when you received constructive criticism and how you applied it?",
    "What's a technology you're currently learning, and why did you choose it?",
    "If you had a disagreement with a product manager about a feature requirement, how would you resolve it?",
    "Walk me through how you prioritize tasks when you have multiple urgent deadlines.",
    "Describe the most successful project you've ever worked on. What made it a success?"
  ];

  while (questions.length < targetCount && padding.length > 0) {
    questions.push(padding.shift()!);
  }

  return {
    role,
    level,
    type: "Mixed",
    techstack,
    questions: questions.slice(0, targetCount),
  };
}
