# QuizWhiz

QuizWhiz is a real-time quiz application designed for interactive presentations and classroom settings. It enables administrators to create quizzes, manage live sessions, and track participant performance through a synchronized dashboard.

## Architecture Overview

The application follows a serverless architecture using Next.js for the frontend and API routes, with Firebase serving as the backend-as-a-service (BaaS) for real-time data synchronization and authentication.

### Core Technologies

*   **Frontend Framework**: Next.js 16.1.1 (App Router)
*   **Language**: TypeScript
*   **UI Library**: React 19
*   **Styling**: Tailwind CSS, Radix UI (via shadcn/ui)
*   **Backend/Database**: Firebase Firestore (NoSQL)
*   **Authentication**: Firebase Authentication (Google Provider)
*   **Build Tool**: Turbopack

## Key Features

### 1. Administration & Content Management
*   **Quiz Creation**: CRUD operations for quizzes and questions.
*   **Question Types**: Multiple-choice questions with configurable time limits and point values.
*   **Access Control**: Route protection ensures only authenticated administrators can access the dashboard and edit quizzes.
*   **Security**: Firestore security rules enforce read/write permissions based on authentication state.

### 2. Real-Time Session Management
*   **Lobby System**: Participants join via a unique 6-digit code.
*   **State Synchronization**: The application uses Firestore listeners (`onSnapshot`) to synchronize game state (Lobby -> Question -> Results -> Leaderboard) across all connected clients instantly.
*   **Game Loop**:
    *   Admin controls the flow (Start Question, Show Results, Next Question).
    *   Server-side timestamp validation prevents late submissions.
    *   Automated scoring based on correctness and response time.

### 3. Participant Experience
*   **Anonymous Entry**: No account creation required for participants; session storage handles identity persistence.
*   **Live Feedback**: Immediate visual feedback on answer submission and correct/incorrect status after the round ends.
*   **Leaderboard**: Dynamic ranking system calculated after each question.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Protected admin routes (Dashboard, Create, Edit, Control)
│   ├── join/               # Participant entry point
│   ├── play/               # Main game interface for participants
│   └── login/              # Admin authentication
├── components/             # Reusable UI components
│   ├── ui/                 # Radix UI primitives
│   └── ...                 # Feature-specific components
├── lib/
│   ├── firebase.ts         # Firebase initialization
│   └── firebase-service.ts # Firestore data access layer (DAL)
└── types/                  # TypeScript interfaces (Quiz, Question, Participant)
```

## Data Model

### Collections
*   `quizzes`: Stores quiz metadata (title, status, current question index).
    *   `questions` (Subcollection): Individual question data.
    *   `participants` (Subcollection): Player data, scores, and answer logs.
*   `admins`: Allowlist for administrative access.

## Setup & Deployment

### Prerequisites
*   Node.js 18+
*   Firebase Project (Firestore & Auth enabled)

### Environment Variables
Required in `.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... other standard Firebase config keys
```

### Installation
```bash
npm install
npm run dev
```

### Deployment
The application is optimized for deployment on Vercel. Ensure environment variables are configured in the project settings.

## Development Notes

*   **State Management**: React state is used for local UI; Firestore is the source of truth for game state.
*   **Type Safety**: All database operations in `firebase-service.ts` are typed to ensure data consistency.
*   **Performance**: Real-time listeners are managed within `useEffect` hooks with proper cleanup to prevent memory leaks.
