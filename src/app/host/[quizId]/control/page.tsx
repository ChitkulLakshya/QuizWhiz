'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
    calculateQuestionResults,
    getQuiz // Add getQuiz to verify ownership if needed
} from '@/lib/firebase-service';
import { Quiz, Question, Participant, QuestionResult } from '@/types/quiz';
import { Users, Play, SkipForward, Trophy, Home } from 'lucide-react';
import QRCode from 'react-qr-code';
import Link from 'next/link';

export default function HostQuizControl() {
    const params = useParams();
    const quizId = params.quizId as string;
    const router = useRouter();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [currentResults, setCurrentResults] = useState<QuestionResult | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(0);

    const joinUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/join?code=${quiz?.code}`
        : '';

    useEffect(() => {
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

    if (!quiz) return (
        <div className="flex flex-col min-h-screen items-center justify-center">
            <div className="animate-pulse text-lg">Loading quiz data...</div>
        </div>
    );

    const currentQuestion = quiz.currentQuestionIndex >= 0 ? questions[quiz.currentQuestionIndex] : null;

    // Calculate how many participants have answered the current question
    const answeredCount = currentQuestion && participants.length > 0
        ? participants.filter(p => p.answers.some(a => a.questionId === currentQuestion.id)).length
        : 0;

    return (
        <div className="flex flex-col w-full min-h-screen bg-slate-50">
            <Header />
            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Host Context Banner */}
                    <div className="bg-indigo-600 text-white px-4 py-2 rounded-t-lg flex justify-between items-center mb-0">
                        <span className="text-sm font-medium flex items-center gap-2">
                            <Trophy className="h-4 w-4" /> Quick Play Host Mode
                        </span>
                        <Link href="/" className="text-xs hover:text-indigo-200 flex items-center gap-1">
                            <Home className="h-3 w-3" /> Back to Home
                        </Link>
                    </div>

                    <div className="bg-white rounded-b-lg border-x border-b p-6 mb-6 shadow-sm">
                        <h1 className="font-headline text-3xl mb-2">{quiz.title}</h1>
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <span className="capitalize font-semibold">Status: {quiz.status}</span>
                            <span className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {participants.length} Participants
                            </span>
                        </div>
                        {quiz.description && <p className="mt-2 text-gray-600">{quiz.description}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Left Column - Control Panel */}
                        <div className="space-y-6">
                            {/* QR Code & Join Info */}
                            {(quiz.status === 'draft' || quiz.status === 'lobby') && (
                                <Card className="border-indigo-100 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="text-indigo-900">Invite Friends</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="bg-white p-4 rounded-lg border flex justify-center">
                                            <QRCode value={joinUrl} size={180} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground uppercase tracking-wide">Join Code</p>
                                            <p className="text-5xl font-black text-indigo-600 my-2">{quiz.code}</p>
                                            <div className="bg-slate-100 p-2 rounded text-xs text-muted-foreground font-mono break-all select-all cursor-pointer"
                                                onClick={() => navigator.clipboard.writeText(joinUrl)}>
                                                {joinUrl} (Click to Copy)
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Control Buttons */}
                            <Card className="border-indigo-100 shadow-md">
                                <CardHeader>
                                    <CardTitle>Game Controls</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {quiz.status === 'draft' && (
                                        <Button onClick={handleStartLobby} className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg">
                                            <Play className="mr-2 h-5 w-5" />
                                            Open Lobby & Waiting Room
                                        </Button>
                                    )}

                                    {quiz.status === 'lobby' && (
                                        <div className="space-y-2">
                                            <div className="text-center p-4 bg-indigo-50 rounded-lg text-indigo-800 mb-2">
                                                {participants.length === 0
                                                    ? "Waiting for players to join..."
                                                    : `${participants.length} player(s) ready!`
                                                }
                                            </div>
                                            <Button onClick={handleStartFirstQuestion} className="w-full bg-green-600 hover:bg-green-700" size="lg">
                                                <Play className="mr-2 h-5 w-5" />
                                                Start The Game!
                                            </Button>
                                        </div>
                                    )}

                                    {quiz.status === 'active' && !currentResults && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-slate-100 p-4 rounded-lg">
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground uppercase">Timer</p>
                                                    <p className="text-4xl font-mono font-bold text-slate-800">{timeRemaining}s</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground uppercase">Answers</p>
                                                    <p className="text-4xl font-mono font-bold text-green-600">
                                                        {answeredCount}<span className="text-xl text-slate-400">/{participants.length}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <Button onClick={handleShowResults} className="w-full" size="lg">
                                                Stop & Show Results
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
                                        <div className="text-center p-6 space-y-4">
                                            <h3 className="text-xl font-bold text-green-600">Game Over!</h3>
                                            {/* We don't have a specific host-leaderboard route, reusing admin one might trigger auth check? 
                            Actually, 'admin/quiz/[id]/leaderboard' also likely uses AdminLayout.
                            We should probably render the leaderboard HERE or create a host/leaderboard route.
                            For now, let's just show a simple "Show Leaderboard" that stays in context or verify if we can open it.
                        */}
                                            <p>Thank you for playing!</p>
                                            <Button variant="outline" onClick={() => window.location.reload()}>Play Again (Reload)</Button>
                                        </div>
                                    )}

                                    {quiz.status !== 'completed' && quiz.status !== 'draft' && (
                                        <Button onClick={handleEndQuiz} variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 mt-4">
                                            Abort Game
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Participants List */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Scoreboard</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                        {participants.length === 0 ? (
                                            <p className="text-muted-foreground text-center py-4 italic">
                                                The lobby is empty...
                                            </p>
                                        ) : (
                                            participants.map((p) => (
                                                <div key={p.id} className="flex justify-between items-center p-3 bg-white border rounded shadow-sm">
                                                    <span className="font-medium">{p.name}</span>
                                                    <span className="font-bold text-indigo-600">{p.totalScore} pts</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        {/* Right Column - Question Display */}
                        <div className="space-y-6">
                            {currentQuestion ? (
                                <Card className="h-full flex flex-col">
                                    <CardHeader className="bg-slate-50 border-b">
                                        <CardTitle className="text-xl text-slate-700">
                                            Question {quiz.currentQuestionIndex + 1} <span className="text-base font-normal text-muted-foreground">of {questions.length}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 p-6 space-y-6">
                                        <p className="text-2xl font-bold leading-relaxed">{currentQuestion.questionText}</p>

                                        <div className="grid gap-3">
                                            {currentQuestion.options.map((option, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-4 rounded-lg border-2 transition-all ${currentResults && index === currentQuestion.correctOptionIndex
                                                            ? 'bg-green-50 border-green-500 shadow-sm'
                                                            : 'bg-white border-transparent shadow-sm hover:border-slate-200'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                     ${currentResults && index === currentQuestion.correctOptionIndex ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600'}
                                `}>
                                                                {String.fromCharCode(65 + index)}
                                                            </span>
                                                            <span className="font-medium text-lg">{option}</span>
                                                        </div>
                                                        {currentResults && (
                                                            <span className="text-lg font-bold text-slate-700">
                                                                {currentResults.optionCounts[index]}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {currentResults && (
                                                        <div className="mt-2 text-xs text-right text-slate-400">
                                                            {currentResults.totalResponses > 0
                                                                ? `${Math.round(currentResults.optionCounts[index] / currentResults.totalResponses * 100)}%`
                                                                : '0%'}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {currentResults && (
                                            <div className="text-center pt-6 border-t mt-4">
                                                <p className="text-2xl font-light text-slate-600">
                                                    <span className="font-bold text-black">{currentResults.totalResponses}</span> / {participants.length}
                                                </p>
                                                <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Answers Recorded</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="h-full flex items-center justify-center bg-slate-50 border-dashed">
                                    <div className="text-center text-muted-foreground p-12">
                                        <Play className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                        <p>Game hasn't started yet.</p>
                                        <p className="text-sm opacity-60">Control panel is ready.</p>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
