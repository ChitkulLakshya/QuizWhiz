# PROJECT_AUDIT.md

## The One-Liner

A real-time, serverless competitive quiz platform that synchronizes game states across multiple devices instantly using Firestore snapshots.

## The 'Technical Hook' (Crucial)

**Serverless Real-Time Game Loop**

The most impressive piece of logic is the orchestration of a live, synchronized game state without a traditional WebSocket server. The application leverages Firestore's `onSnapshot` listeners to create a reactive "message bus" that pushes state changes (Lobby → Question Active → Leaderboard) to all connected clients simultaneously.

This logic resides in: `src/lib/firebase-service.ts`

Specifically, the `subscribeToQuiz`, `startQuestion`, and `submitAnswer` functions work together to maintain a consistent state across the Admin (host) and potentially hundreds of Participants (clients), calculating scores based on server timestamps and client response times.

## The True Stack (Evidence-Based)

Based on `package.json` and imports:

*   **Core Framework**: Next.js 16 (App Router), React 19
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, Radix UI (Headless components via shadcn/ui), Lucide React
*   **Backend & Real-Time**: Firebase (Firestore, Authentication)
*   **AI Integration**: Genkit (Google GenAI SDK), Zod (Schema validation for AI output)
*   **Form Management**: React Hook Form, Zod
*   **Visualization**: Recharts

## Architecture & Scale Indicators

*   **Database**: **Google Cloud Firestore** (NoSQL). The schema uses a subcollection pattern (`quizzes/{quizId}/participants/{participantId}`) which is a strong indicator of scalable design, ensuring that fetching a list of quizzes doesn't accidentally load thousands of participant records.
*   **Authentication**:
    *   **Admin**: Firebase Authentication (Google Provider).
    *   **Participants**: Anonymous/Session-based authentication using `localStorage` and Firestore document IDs (low friction for joining).
*   **Deployment**: The project is configured for Vercel (indicated by `next.config.ts` and `homepage` URL) and uses Firebase for backend services (`firebase.json`).
*   **AI-Native**: The presence of `src/ai/dev.ts` and `src/ai/flows` indicates the application was built with AI generation as a core feature, not an afterthought.

## Product Features

1.  **Live Game Synchronization**: A host can control the pace of the quiz (starting questions, showing results), and all participant screens update instantly in real-time.
2.  **AI-Powered Quiz Generation**: Users can generate entire quizzes with distractors and correct answers simply by providing a topic or uploading an image, powered by Google Genkit.
3.  **Real-Time Leaderboard**: The application calculates scores dynamically based on answer speed and correctness, displaying a live ranking of top participants after every round.
