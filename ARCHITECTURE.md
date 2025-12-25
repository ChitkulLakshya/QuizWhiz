# System Architecture

## 1. Overview

QuizWhiz is a serverless, real-time quiz platform built on the **JAMstack** architecture. It leverages **Next.js** for the frontend and **Firebase** for the backend-as-a-service (BaaS). The system is designed to handle real-time state synchronization between a single admin (host) and multiple participants (clients) with low latency.

## 2. High-Level Design

```ascii
+-----------------+       +-------------------+       +-----------------+
|  Admin Client   |       |  Firebase Cloud   |       | Participant(s)  |
| (Next.js / Web) |<----->|    (Firestore)    |<----->| (Next.js / Web) |
+-----------------+       +-------------------+       +-----------------+
        |                           ^                          |
        |                           |                          |
        +---[1. Update State]-------+                          |
                                    |                          |
        +---[4. Read Results]-------+                          |
                                    |                          |
                                    +-----[2. Sync State]------+
                                    |
                                    +-----[3. Submit Answer]---+
```

1.  **Admin** updates the game state (e.g., "Next Question") in Firestore.
2.  **Firestore** pushes the new state to all connected **Participants** via `onSnapshot` listeners.
3.  **Participants** submit answers to their specific document in Firestore.
4.  **Admin** listens to participant updates to calculate and display the leaderboard.

## 3. Frontend Architecture

The frontend is a **Next.js 16** application using the **App Router**.

### Tech Stack
*   **Framework**: Next.js 16.1.1
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **UI Components**: Radix UI (via shadcn/ui)
*   **State Management**: React Hooks (`useState`, `useEffect`) + Firebase Real-time Listeners

### Key Modules
*   **`src/app/admin`**: Protected route for quiz creation and game management.
*   **`src/app/join`**: Public entry point for participants to enter a game code.
*   **`src/app/play/[quizId]`**: The main game loop component. Handles:
    *   Real-time subscription to the Quiz document.
    *   Countdown timers.
    *   Answer submission logic.
*   **`src/lib/firebase-service.ts`**: The abstraction layer for all Firestore interactions.

## 4. Backend Architecture (Firebase)

The backend is entirely serverless, relying on **Google Cloud Firestore** (NoSQL).

### Data Model

The database is structured hierarchically to optimize for read/write patterns during a live game.

```
quizzes/ (Collection)
  ├── {quizId} (Document)
  │     ├── title: string
  │     ├── status: 'draft' | 'lobby' | 'active' | 'ended'
  │     ├── currentQuestionIndex: number
  │     ├── questionStartTime: number (timestamp)
  │     │
  │     ├── questions/ (Subcollection)
  │     │     ├── {questionId}
  │     │     │     ├── questionText: string
  │     │     │     ├── options: string[]
  │     │     │     ├── correctOptionIndex: number
  │     │     │     └── timeLimit: number
  │     │
  │     └── participants/ (Subcollection)
  │           ├── {participantId}
  │           │     ├── name: string
  │           │     ├── totalScore: number
  │           │     └── answers: Array<{
  │           │           questionId: string
  │           │           selectedOptionIndex: number
  │           │           pointsEarned: number
  │           │         }>
```

### Responsibilities
*   **Firestore**: Acts as the "Source of Truth" and the message bus for real-time events.
*   **Firebase Auth**: Handles identity for Administrators.

## 5. Authentication Flow

The system uses a dual-auth strategy:

### Administrator (Secure)
*   **Method**: Firebase Authentication (Google OAuth Provider).
*   **Flow**:
    1.  User clicks "Sign in with Google".
    2.  Firebase returns an ID Token.
    3.  App checks `onAuthStateChanged`.
    4.  If authenticated, access to `/admin` is granted.

### Participant (Anonymous)
*   **Method**: Session-based (LocalStorage + Firestore ID).
*   **Flow**:
    1.  User enters Name and Game Code.
    2.  System creates a document in `quizzes/{quizId}/participants`.
    3.  The returned `participantId` is stored in the browser's `localStorage`.
    4.  No password or email is required (low friction).

## 6. Real-Time Data Flow (The Game Loop)

The core of QuizWhiz is the synchronization loop:

1.  **Lobby Phase**:
    *   Admin sets Quiz Status to `lobby`.
    *   Participants join; their names appear in the Admin's "Waiting Room" via a listener on the `participants` subcollection.

2.  **Question Start**:
    *   Admin clicks "Start Question".
    *   Admin updates `quizzes/{quizId}` -> `{ status: 'active', currentQuestionIndex: N, questionStartTime: Now }`.

3.  **Propagation**:
    *   Participants' `onSnapshot` listener fires.
    *   Client UI switches to "Question View".
    *   Local countdown timer starts (synced with `questionStartTime`).

4.  **Answer Submission**:
    *   Participant selects an option.
    *   **Client-Side Scoring**: Points are calculated based on speed:
        `Points = BasePoints * max(0.5, 1 - (TimeTaken / TimeLimit))`
    *   Client writes to `quizzes/{quizId}/participants/{participantId}`.

5.  **Leaderboard**:
    *   Admin (or everyone) views the leaderboard.
    *   The view fetches/listens to `participants` sorted by `totalScore`.

## 7. Security & Scalability Considerations

*   **Scalability**: Firestore scales automatically. The subcollection pattern (`participants` inside `quizzes`) ensures that fetching a list of quizzes doesn't load all participants, keeping queries efficient.
*   **Security Rules (Current)**:
    *   **Read**: Public (for simplicity in this demo version).
    *   **Write**: Public (allows participants to join and submit answers).
    *   *Future Improvement*: Lock down `quizzes` write access to the creator (Admin) only, and allow participants to only update their own document.
*   **Trust Model**: Currently, the client calculates its own score. In a production environment with high stakes, scoring should be moved to a **Firebase Cloud Function** triggered by the answer submission to prevent cheating.
