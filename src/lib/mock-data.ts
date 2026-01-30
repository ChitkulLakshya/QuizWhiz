import type { Quiz, Participant, LeaderboardEntry } from './types';

export const mockQuizzes: Quiz[] = [
  {
    id: 'space-odyssey-101',
    title: 'Space Odyssey 101',
    createdAt: '2024-05-20T10:00:00Z',
    questions: [
      {
        question: 'What is the largest planet in our solar system?',
        options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 'Jupiter',
        timeLimit: 20,
      },
      {
        question: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Mercury', 'Uranus'],
        correctAnswer: 'Mars',
        timeLimit: 20,
      },
      {
        question: 'What is the name of the galaxy that contains our Solar System?',
        options: ['Andromeda', 'Triangulum', 'Whirlpool', 'Milky Way'],
        correctAnswer: 'Milky Way',
        timeLimit: 25,
      },
      {
        question: 'How many moons does Earth have?',
        options: ['1', '2', '0', '4'],
        correctAnswer: '1',
        timeLimit: 15,
      },
      {
        question: 'What force is responsible for keeping planets in orbit around the Sun?',
        options: ['Magnetism', 'Gravity', 'Friction', 'Nuclear Force'],
        correctAnswer: 'Gravity',
        timeLimit: 20,
      },
    ],
  },
  {
    id: 'marine-marvels',
    title: 'Marine Marvels',
    createdAt: '2024-05-21T14:30:00Z',
    questions: [
      {
        question: 'What is the largest animal on Earth?',
        options: ['Elephant', 'Blue Whale', 'Great White Shark', 'Giraffe'],
        correctAnswer: 'Blue Whale',
        timeLimit: 20,
      },
      {
        question: 'How many hearts does an octopus have?',
        options: ['1', '2', '3', '4'],
        correctAnswer: '3',
        timeLimit: 25,
      },
      {
        question: 'What is a group of fish called?',
        options: ['A flock', 'A herd', 'A school', 'A pride'],
        correctAnswer: 'A school',
        timeLimit: 15,
      },
    ],
  },
];

export const mockParticipants: Participant[] = [
  { id: 'p1', name: 'Alice', quizId: 'space-odyssey-101' },
  { id: 'p2', name: 'Bob', quizId: 'space-odyssey-101' },
  { id: 'p3', name: 'Charlie', quizId: 'space-odyssey-101' },
  { id: 'p4', name: 'Diana', quizId: 'space-odyssey-101' },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, participantId: 'p2', participantName: 'Bob', score: 5, totalTime: 85.3 },
  { rank: 2, participantId: 'p4', participantName: 'Diana', score: 5, totalTime: 91.1 },
  { rank: 3, participantId: 'p1', participantName: 'Alice', score: 4, totalTime: 75.6 },
  { rank: 4, participantId: 'p3', participantName: 'Charlie', score: 3, totalTime: 99.8 },
  { rank: 5, participantId: 'p5', participantName: 'Eve', score: 2, totalTime: 65.2 },
];
