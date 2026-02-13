# Frontend Architecture Report

## 1. Sitemap & Routes

| Route | Purpose | Key Access Level |
| :--- | :--- | :--- |
| `/` | **Home Page**. Landing page with hero section and `TopicGrid` for quick starts. | Public |
| `/join` | **Join Game**. Form to enter a game code and nickname. | Public |
| `/play/[quizId]` | **Game Room**. The main game loop. Handles Lobby, Question, Results, and Leaderboard views. | Public (Participants) & Protected (Host) |
| `/admin` | **Admin Dashboard**. Lists existing quizzes with options to Create, Edit, or Control. | Protected (Auth required) |
| `/admin/create` | **Create Quiz**. Form to create a new quiz. | Protected |
| `/admin/quiz/[id]/edit` | **Edit Quiz**. Interface to modify questions and settings. | Protected |
| `/admin/quiz/[id]/control` | **Game Control**. Host-specific view to manage a live game (often redirects to `/play` with host privileges). | Protected |
| `/admin/quiz/[id]/leaderboard`| **Leaderboard View**. Dedicated view for results history. | Protected |
| `/login` | **Login Page**. Admin authentication via Firebase. | Public |

## 2. State & Logic Map

### **`/play/[quizId]` (Game Engine)**
*   **Custom Hooks:**
    *   `useGameSounds`: Manages AudioContext for sound effects (correct, wrong, tick, results).
    *   `useToast`: For UI notifications.
*   **Key Data (State):**
    *   `quiz` (Quiz): Full quiz object (status, current question index).
    *   `questions` (Question[]): Array of quiz questions.
    *   `participants` (Participant[]): Real-time list of players and scores.
    *   `currentParticipant` (Participant | null): The local user's participant data.
    *   `viewState`: `'lobby' | 'question' | 'results' | 'completed'` (Controls UI mode).
    *   `timeRemaining`: Number (Countdown timer).
    *   `isHost`: Boolean (Derived from `quiz.ownerId === user.uid`).
*   **Key Actions:**
    *   `handleJoinGame(name)`: Creates a participant document.
    *   `handleSubmitAnswer(option)`: Submits answer to Firestore, triggers sound, updates score.
    *   `hostStartGame()`: updates status to `active`, starts Question 0.
    *   `hostNextQuestion()`: updates status, increments index.
    *   `handleRestart()`: Resets game state (Host only).

### **`/join` (Entry Point)**
*   **Key Data (State):**
    *   `code`: String (6-digit input).
    *   `name`: String (User nickname).
    *   `loading`: Boolean.
*   **Key Actions:**
    *   `handleFindQuiz(code)`: Verifies if quiz exists and is in 'lobby' state.
    *   `handleJoin()`: Calls `joinQuiz`, caches ID in localStorage, redirects to `/play`.

### **`TopicGrid` (Home Component)**
*   **Key Data (State):**
    *   `loading`: Stores ID of the category currently being generated.
    *   `isCustomOpen`: Boolean for the "Custom Topic" modal.
*   **Key Actions:**
    *   `handleTopicClick(category)`: Calls `createQuickGame` (API/AI generation) and redirects.
    *   `handleCustomGenerate(topic)`: Calls `createAIQuickQuiz` and redirects.

### **`/admin` (Dashboard)**
*   **Key Data (State):**
    *   `quizzes`: Array of `Quiz` objects owned by the user.
*   **Key Actions:**
    *   `loadQuizzes()`: Fetches from Firestore.
    *   `handleDelete(id)`: Removes quiz and questions.

## 3. Component Hierarchy

*   `app/layout.tsx` (Root Provider)
    *   `app/page.tsx`
        *   `Header` (Navigation)
        *   `TopicGrid` (Interactive Card Grid)
            *   `Card` (UI)
            *   `Dialog` (Custom Topic Form)
    *   `app/play/[quizId]/page.tsx`
        *   `Header`
        *   `Card` (Lobby/Question container)
        *   `Progress` (Timer bar)
        *   `ResultsChart` (Data viz for host)
            *   Visualizes option distribution using CSS width %.
        *   `Podium` (Final Leaderboard)
            *   Displays Top 3 and list of others.
        *   `ShareModal` (QR Code & Link)
*   `components/ui/*`: Reusable shadcn/ui atoms (`Button`, `Input`, `Card`, `Badge`, `Progress`, `Toast`).

## 4. Type Definitions

```typescript

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  createdBy: string;
  ownerId?: string; // UID of creator
  createdAt: number;
  status: 'draft' | 'lobby' | 'active' | 'completed';
  source?: 'manual' | 'ai' | 'api';
  questions?: Question[]; // Optional: for API/AI generated quizzes
  currentQuestionIndex: number;
  questionStartTime?: number;
  code: string; // 6-digit join code
}

export interface Question {
  id: string;
  quizId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  timeLimit: number; // in seconds
  order: number;
  points: number;
}

export interface Participant {
  id: string;
  quizId: string;
  name: string;
  joinedAt: number;
  totalScore: number;
  currentStreak: number;
  answers: Record<string, number>; // questionIndex -> selectedOptionIndex
}

export interface QuestionResult {
  questionId: string;
  quizId: string;
  optionCounts: number[]; // count for each option
  totalResponses: number;
  correctOptionIndex: number;
}

export interface LeaderboardEntry {
  participantId: string;
  name: string;
  totalScore: number;
  correctAnswers: number;
  rank: number;
}
```
