# QuizWhiz

QuizWhiz is a real-time, serverless quiz platform designed to facilitate interactive events and classroom assessments. It allows administrators to create custom quizzes, manage live sessions, and synchronize game state across hundreds of participant devices instantly, providing immediate feedback and dynamic leaderboards without requiring participant account creation.

## Problem Statement

Organizing live quizzes for university clubs, tech events, or large gatherings often involves either manual scoring (which is slow and error-prone) or expensive enterprise software. QuizWhiz addresses this by providing a lightweight, scalable solution that handles real-time state synchronization and automated scoring. It eliminates the friction of user registration for participants, ensuring rapid onboarding for large audiences.

## Key Features

*   **Real-Time Synchronization**: Game state (lobby, question, results) updates instantly on all client devices using Firestore listeners.
*   **Admin Dashboard**: Comprehensive interface for creating quizzes, managing content, and controlling live game flow.
*   **Live Session Management**: Admins can start questions, reveal answers, and advance rounds manually to pace the event.
*   **Automated Scoring**: Points are calculated server-side based on answer correctness and response speed.
*   **Dynamic Leaderboard**: Real-time ranking of top performers updated after every round.
*   **Secure Access**: Route protection and role-based access control for administrative functions.

## Technical Stack

*   **Frontend**: Next.js 16 (App Router), React 19, TypeScript
*   **Styling**: Tailwind CSS, Radix UI
*   **Backend**: Firebase Firestore (NoSQL Database)
*   **Authentication**: Firebase Authentication (Google OAuth)
*   **Infrastructure**: Vercel (Frontend Hosting), Google Cloud Platform (Backend Services)

## System Architecture

The application relies on a unidirectional data flow driven by Firestore:

1.  **Admin Action**: The administrator triggers an action (e.g., "Start Question") via the dashboard.
2.  **State Update**: This action updates the specific Quiz document in Firestore.
3.  **Propagation**: Firestore `onSnapshot` listeners on all participant clients detect the change.
4.  **UI Update**: Client interfaces automatically re-render to show the active question or results.
5.  **Submission**: Participants write answers to a subcollection; the admin client aggregates these for the leaderboard.

## Local Development

### Prerequisites
*   Node.js 18+
*   Firebase Project with Firestore and Authentication enabled.

### Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/prem22k/QuizWhiz.git
    cd QuizWhiz
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env.local` file in the root directory with your Firebase credentials:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    GOOGLE_GENAI_API_KEY=your_gemini_api_key
    # ... add other Firebase config keys
    ```

4.  **Run the application**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

## Deployment

### Frontend (Vercel)
This project is optimized for Vercel.
1.  Connect your GitHub repository to Vercel.
2.  Add the environment variables from `.env.local` to the Vercel project settings.
3.  Deploy.

### Backend (Firebase)
1.  Ensure Firestore rules are deployed to secure the database.
2.  Add your production domain (e.g., `quizwhiz.vercel.app`) to the **Authorized Domains** list in Firebase Authentication settings.

## Contribution Guidelines

This is a collaborative project. To contribute:

1.  **Fork** the repository.
2.  Create a **feature branch** (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a **Pull Request**.

Please ensure all new features are typed correctly with TypeScript and include relevant error handling.

## Contributors

This project is collaboratively developed.

- **Lakshya Chitkul** — Project lead, core architecture
- **Prem Sai Kota** — Authentication, deployment fixes, documentation, cleanup

