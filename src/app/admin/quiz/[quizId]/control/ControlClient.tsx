'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Header from '@/components/header';
import { 
  subscribeToQuiz, 
  subscribeToParticipants, 
  subscribeToQuestions,
  updateQuizStatus,
  startQuestion,
  endQuiz,
  calculateQuestionResults
} from '@/lib/firebase-service';
import { Quiz, Question, Participant, QuestionResult } from '@/types/quiz';
import { Users, Play, SkipForward, Trophy } from 'lucide-react';
import QRCode from 'react-qr-code';
import Link from 'next/link';

export default function ControlClient() {
  const params = useParams();
  const quizId = Array.isArray(params?.quizId) ? params?.quizId[0] : params?.quizId || '';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentResults, setCurrentResults] = useState<QuestionResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const joinUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/join?code=${quiz?.code}` 
    : '';

  useEffect(() => {
    if (!quizId) return;
    
    const unsubQuiz = subscribeToQuiz(quizId, setQuiz);
    const unsubParticipants = subscribeToParticipants(quizId, setParticipants);
    const unsubQuestions = subscribeToQuestions(quizId, setQuestions);

    return () => {
      unsubQuiz();
      unsubParticipants();
      unsubQuestions();
    };
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (!quiz || quiz.status !== 'active' || !quiz.questionStartTime) return;

    const currentQuestion = questions[quiz.currentQuestionIndex];
    if (!currentQuestion) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - quiz.questionStartTime!;
      const remaining = Math.max(0, currentQuestion.timeLimit * 1000 - elapsed);
      setTimeRemaining(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        handleShowResults();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [quiz, questions]);

  const handleStartLobby = async () => {
    await updateQuizStatus(quizId, 'lobby');
  };

  const handleStartFirstQuestion = async () => {
    if (questions.length === 0) {
      alert('Add questions first!');
      return;
    }
    await startQuestion(quizId, 0);
  };

  const handleShowResults = async () => {
    if (!quiz || quiz.currentQuestionIndex < 0) return;
    
    const currentQuestion = questions[quiz.currentQuestionIndex];
    const results = await calculateQuestionResults(quizId, currentQuestion.id);
    setCurrentResults(results);
  };

  const handleNextQuestion = async () => {
    if (!quiz) return;

    const nextIndex = quiz.currentQuestionIndex + 1;
    
    if (nextIndex >= questions.length) {
      await endQuiz(quizId);
    } else {
      setCurrentResults(null);
      await startQuestion(quizId, nextIndex);
    }
  };

  const handleEndQuiz = async () => {
    if (confirm('End quiz and show final leaderboard?')) {
      await endQuiz(quizId);
    }
  };

  if (!quiz) return <div className="p-8">Loading...</div>;

  const currentQuestion = quiz.currentQuestionIndex >= 0 ? questions[quiz.currentQuestionIndex] : null;

  // Calculate how many participants have answered the current question
  const answeredCount = currentQuestion && participants.length > 0
    ? participants.filter(p => p.answers.some(a => a.questionId === currentQuestion.id)).length
    : 0;

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="font-headline text-3xl mb-2">{quiz.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="capitalize font-semibold">Status: {quiz.status}</span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {participants.length} Participants
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Control Panel */}
            <div className="space-y-6">
              {/* QR Code & Join Info */}
              {(quiz.status === 'draft' || quiz.status === 'lobby') && (
                <Card>
                  <CardHeader>
                    <CardTitle>Join Quiz</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-white p-4 rounded-lg">
                      <QRCode value={joinUrl} size={200} className="mx-auto" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Join Code</p>
                      <p className="text-4xl font-bold">{quiz.code}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground break-all">{joinUrl}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Control Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Control</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quiz.status === 'draft' && (
                    <Button onClick={handleStartLobby} className="w-full" size="lg">
                      <Play className="mr-2 h-5 w-5" />
                      Open Lobby
                    </Button>
                  )}

                  {quiz.status === 'lobby' && (
                    <Button onClick={handleStartFirstQuestion} className="w-full" size="lg">
                      <Play className="mr-2 h-5 w-5" />
                      Start First Question
                    </Button>
                  )}

                  {quiz.status === 'active' && !currentResults && (
                    <div className="space-y-3">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Time Remaining</p>
                        <p className="text-5xl font-bold">{timeRemaining}s</p>
                      </div>
                      <div className="text-center pb-2">
                        <p className="text-sm text-muted-foreground">Answers Received</p>
                        <p className="text-2xl font-semibold">
                          {answeredCount} / {participants.length}
                        </p>
                      </div>
                      <Button onClick={handleShowResults} className="w-full" size="lg">
                        Show Results
                      </Button>
                    </div>
                  )}

                  {currentResults && (
                    <Button onClick={handleNextQuestion} className="w-full" size="lg">
                      <SkipForward className="mr-2 h-5 w-5" />
                      {quiz.currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'End Quiz'}
                    </Button>
                  )}

                  {quiz.status === 'completed' && (
                    <Button asChild className="w-full" size="lg">
                      <Link href={`/admin/quiz/${quizId}/leaderboard`}>
                        <Trophy className="mr-2 h-5 w-5" />
                        View Final Leaderboard
                      </Link>
                    </Button>
                  )}

                  {quiz.status !== 'completed' && quiz.status !== 'draft' && (
                    <Button onClick={handleEndQuiz} variant="destructive" className="w-full">
                      End Quiz Now
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Participants List */}
              <Card>
                <CardHeader>
                  <CardTitle>Participants ({participants.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {participants.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        Waiting for participants...
                      </p>
                    ) : (
                      participants.map((p) => (
                        <div key={p.id} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span>{p.name}</span>
                          <span className="font-semibold">{p.totalScore} pts</span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Question Display */}
            <div className="space-y-6">
              {currentQuestion && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      Question {quiz.currentQuestionIndex + 1} of {questions.length}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xl font-semibold">{currentQuestion.questionText}</p>
                    
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg ${
                            currentResults && index === currentQuestion.correctOptionIndex
                              ? 'bg-green-100 dark:bg-green-900 border-2 border-green-500'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">
                              {String.fromCharCode(65 + index)}. {option}
                            </span>
                            {currentResults && (
                              <span className="text-lg font-bold">
                                {currentResults.optionCounts[index]} 
                                {currentResults.totalResponses > 0 && 
                                  ` (${Math.round(currentResults.optionCounts[index] / currentResults.totalResponses * 100)}%)`
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {currentResults && (
                      <div className="text-center pt-4 border-t">
                        <p className="text-muted-foreground">
                          {currentResults.totalResponses} / {participants.length} answered
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {quiz.status === 'completed' && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                    <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
                    <p className="text-muted-foreground mb-4">
                      View the final leaderboard
                    </p>
                    <Button asChild size="lg">
                      <Link href={`/admin/quiz/${quizId}/leaderboard`}>
                        View Leaderboard
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
