// Shared TypeScript types for Quiz Application

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  createdBy: string;
  ownerId?: string; // UID of creator
  createdAt: number;
  status: 'draft' | 'lobby' | 'active' | 'completed';
  source?: 'manual' | 'ai' | 'api';
  questions?: Question[]; // Optional: for API/AI generated quizzes that store questions inline
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
  answers: ParticipantAnswer[];
}

export interface ParticipantAnswer {
  questionId: string;
  selectedOptionIndex: number;
  answeredAt: number;
  isCorrect: boolean;
  pointsEarned: number;
  timeToAnswer: number; // milliseconds
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
