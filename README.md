<div align="center">
  <br />
  <div>
    <img src="https://img.shields.io/badge/-Next.JS-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=black" alt="next.js" />
    <img src="https://img.shields.io/badge/-Vapi-white?style=for-the-badge&color=5dfeca" alt="vapi" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="tailwindcss" />
    <img src="https://img.shields.io/badge/-Firebase-black?style=for-the-badge&logoColor=white&logo=firebase&color=DD2C00" alt="firebase" />
  </div>

  <h3 align="center">HireMind AI: An Intelligent Job Interview Preparation Platform</h3>
</div>

## 📋 Table of Contents

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🤸 [Quick Start](#quick-start)

## <a name="introduction">🤖 Introduction</a>

Built with Next.js for the user interface and backend logic, Firebase for authentication and data storage, styled with TailwindCSS, and using Vapi's AI voice agents, **HireMind AI** is an advanced platform offering a sleek and modern experience for job interview preparation. It leverages AI models to generate realistic mock interviews and provides in-depth, structured feedback on candidate performance.

## <a name="tech-stack">⚙️ Tech Stack</a>

- **Next.js**
- **Firebase**
- **Tailwind CSS**
- **Vapi AI**
- **shadcn/ui**
- **Google Gemini**
- **Zod**

## <a name="features">🔋 Features</a>

👉 **Authentication**: Secure Sign Up and Sign In using email/password, handled by Firebase.

👉 **Create Interviews**: Automatically generate customized job interviews tailored to a specific role, experience level, and tech stack using Google Gemini and Vapi.

👉 **Resume Parsing**: Extract insights directly from uploaded resumes to shape customized interview questions.

👉 **AI Voice Interviews**: Take the interview with a highly responsive AI voice agent, facilitating a realistic, real-time conversational experience.

👉 **Instant Feedback & Scoring**: Receive comprehensive, structured feedback based on your performance, scoring communication skills, technical knowledge, problem-solving, and confidence.

👉 **Modern UI/UX**: A sleek, beautifully designed interface with glassmorphism effects, responsive layout, and intuitive navigation.

👉 **Dashboard**: Easily manage, view, and track all past mock interviews and their corresponding performance metrics.

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) (Node Package Manager)

**1. Clone the Repository**

```bash
git clone https://github.com/Satish-Raut/HireMind-AI.git
cd HireMind-AI
```

*(Note: If you have already cloned the repository under a different folder name, simply navigate into it).*

**2. Install Dependencies**

Install the project dependencies using npm:

```bash
npm install
```

**3. Set Up Environment Variables**

Create a new file named `.env.local` in the root of your project and add the following keys. You will need to generate these credentials from their respective platforms:

```env
NEXT_PUBLIC_VAPI_WEB_TOKEN=
NEXT_PUBLIC_VAPI_WORKFLOW_ID=

GOOGLE_GENERATIVE_AI_API_KEY=

NEXT_PUBLIC_BASE_URL=http://localhost:3000

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

- **Firebase**: Obtain from your Firebase Console.
- **Vapi**: Obtain from the Vapi Dashboard.
- **Google Gemini**: Obtain an API key from Google AI Studio.

**4. Run the Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.
