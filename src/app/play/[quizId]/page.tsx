'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Header from '@/components/header';
import { 
  subscribeToQuiz, 
  subscribeToQuestions,
  submitAnswer,
  getLeaderboard
} from '@/lib/firebase-service';
import { Quiz, Question, LeaderboardEntry } from '@/types/quiz';
import { Clock, Trophy } from 'lucide-react';

export default function PlayQuiz() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [participantId, setParticipantId] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Get participant info from localStorage
    const storedId = localStorage.getItem('participantId');
    const storedName = localStorage.getItem('participantName');
    const storedQuizId = localStorage.getItem('quizId');

    if (!storedId || !storedName || storedQuizId !== quizId) {
      router.push('/join');
      return;
    }

    setParticipantId(storedId);
    setParticipantName(storedName);

    const unsubQuiz = subscribeToQuiz(quizId, setQuiz);
    const unsubQuestions = subscribeToQuestions(quizId, setQuestions);

    return () => {
      unsubQuiz();
      unsubQuestions();
    };
  }, [quizId, router]);

  // Reset answer state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setHasAnswered(false);
  }, [quiz?.currentQuestionIndex]);

  // Load leaderboard when quiz completes
  useEffect(() => {
    if (quiz?.status === 'completed') {
      loadLeaderboard();
    }
  }, [quiz?.status]);

  const loadLeaderboard = async () => {
    const data = await getLeaderboard(quizId);
    setLeaderboard(data);
  };

  // Timer countdown
  useEffect(() => {
    if (!quiz || quiz.status !== 'active' || !quiz.questionStartTime || hasAnswered) return;

    const currentQuestion = questions[quiz.currentQuestionIndex];
    if (!currentQuestion) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - quiz.questionStartTime!;
      const remaining = Math.max(0, currentQuestion.timeLimit * 1000 - elapsed);
      setTimeRemaining(Math.ceil(remaining / 1000));

      if (remaining <= 0 && !hasAnswered) {
        // Time's up - auto submit no answer
        handleTimeout();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [quiz, questions, hasAnswered]);

  const handleTimeout = async () => {
    if (!quiz || hasAnswered) return;
    setHasAnswered(true); // Prevent double submission

    const currentQuestion = questions[quiz.currentQuestionIndex];
    if (!currentQuestion) return;

    try {
      await submitAnswer(
        quizId,
        participantId,
        {
          questionId: currentQuestion.id,
          selectedOptionIndex: -1, // -1 indicates no answer/timeout
          answeredAt: Date.now(),
          isCorrect: false,
          pointsEarned: 0,
          timeToAnswer: currentQuestion.timeLimit * 1000
        }
      );
    } catch (error) {
      console.error('Error submitting timeout:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || hasAnswered || !quiz) return;

    const currentQuestion = questions[quiz.currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctOptionIndex;
    const timeToAnswer = Date.now() - quiz.questionStartTime!;
    
    // Calculate points based on speed (faster = more points)
    let pointsEarned = 0;
    if (isCorrect) {
      const timeRatio = 1 - (timeToAnswer / (currentQuestion.timeLimit * 1000));
      pointsEarned = Math.round(currentQuestion.points * Math.max(0.5, timeRatio));
    }

    try {
      await submitAnswer(
        quizId,
        participantId,
        {
          questionId: currentQuestion.id,
          selectedOptionIndex: selectedOption,
          answeredAt: Date.now(),
          isCorrect,
          pointsEarned,
          timeToAnswer
        }
      );
      setHasAnswered(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (!quiz) return <div className="p-8">Loading...</div>;

  const currentQuestion = quiz.currentQuestionIndex >= 0 ? questions[quiz.currentQuestionIndex] : null;

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="font-headline text-3xl mb-2">{quiz.title}</h1>
            <p className="text-muted-foreground">Welcome, {participantName}!</p>
          </div>

          {quiz.status === 'lobby' && (
            <Card>
              <CardContent className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Waiting to Start...</h2>
                <p className="text-muted-foreground">
                  The quiz will begin shortly. Get ready!
                </p>
              </CardContent>
            </Card>
          )}

          {quiz.status === 'active' && currentQuestion && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">
                    Question {quiz.currentQuestionIndex + 1} of {questions.length}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-2xl font-bold">
                    <Clock className="h-6 w-6" />
                    {timeRemaining}s
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-2xl font-semibold text-center py-4">
                  {currentQuestion.questionText}
                </p>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !hasAnswered && setSelectedOption(index)}
                      disabled={hasAnswered}
                      className={`w-full p-4 rounded-lg text-left transition-all ${
                        selectedOption === index
                          ? 'bg-primary text-primary-foreground border-2 border-primary'
                          : 'bg-muted hover:bg-muted/80'
                      } ${hasAnswered ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className="font-semibold text-lg">
                        {String.fromCharCode(65 + index)}. {option}
                      </span>
                    </button>
                  ))}
                </div>

                {!hasAnswered ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="w-full"
                    size="lg"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-lg font-semibold text-muted-foreground">
                      Answer submitted! Waiting for results...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {quiz.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-3xl flex items-center justify-center gap-2">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  Quiz Completed!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-xl mb-6">Final Leaderboard</p>
                </div>

                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.participantId}
                      className={`p-4 rounded-lg ${
                        entry.participantId === participantId
                          ? 'bg-primary text-primary-foreground border-2 border-primary'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold">#{entry.rank}</span>
                          <div>
                            <p className="font-semibold">{entry.name}</p>
                            <p className="text-sm opacity-80">
                              {entry.correctAnswers} correct
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{entry.totalScore}</p>
                          <p className="text-sm opacity-80">points</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-4">
                  <Button asChild>
                    <a href="/join">Join Another Quiz</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
