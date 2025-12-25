'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/header';
import { getQuiz, getQuestions, addQuestion, deleteQuestion, deleteQuiz } from '@/lib/firebase-service';
import { Quiz, Question } from '@/types/quiz';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditQuiz() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // New question form
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [timeLimit, setTimeLimit] = useState(30);
  const [points, setPoints] = useState(100);

  useEffect(() => {
    loadData();
  }, [quizId]);

  const loadData = async () => {
    try {
      const [quizData, questionsData] = await Promise.all([
        getQuiz(quizId),
        getQuestions(quizId)
      ]);
      setQuiz(quizData);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || options.some(o => !o.trim())) {
      alert('Please fill all fields');
      return;
    }

    try {
      await addQuestion(quizId, {
        questionText,
        options: options.filter(o => o.trim()),
        correctOptionIndex: correctIndex,
        timeLimit,
        points,
        order: questions.length
      });

      // Reset form
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCorrectIndex(0);
      setTimeLimit(30);
      setPoints(100);

      // Reload questions
      loadData();
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Delete this question?')) return;

    try {
      await deleteQuestion(quizId, questionId);
      loadData();
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!confirm('Are you sure you want to delete this ENTIRE quiz? This cannot be undone.')) return;

    try {
      await deleteQuiz(quizId);
      router.push('/admin');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!quiz) return <div className="p-8">Quiz not found</div>;

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" asChild>
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleDeleteQuiz}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Quiz
            </Button>
          </div>

          <div className="mb-6">
            <h1 className="font-headline text-3xl mb-2">{quiz.title}</h1>
            <p className="text-muted-foreground">Join Code: <span className="font-bold text-xl">{quiz.code}</span></p>
          </div>

          {/* Existing Questions */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Questions ({questions.length})</h2>
            <div className="space-y-4">
              {questions.map((q, index) => (
                <Card key={q.id || index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          Q{index + 1}: {q.questionText}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                          Time: {q.timeLimit}s | Points: {q.points}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(q.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {q.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded ${
                            optIndex === q.correctOptionIndex
                              ? 'bg-green-100 dark:bg-green-900'
                              : 'bg-muted'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}. {option}
                          {optIndex === q.correctOptionIndex && ' ✓'}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Add New Question */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Question
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleAddQuestion}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Question Text *</Label>
                  <Input
                    id="question"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Enter your question"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options *</Label>
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <span className="font-semibold w-8">{String.fromCharCode(65 + index)}.</span>
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[index] = e.target.value;
                          setOptions(newOptions);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        required
                      />
                      <input
                        type="radio"
                        name="correct"
                        checked={correctIndex === index}
                        onChange={() => setCorrectIndex(index)}
                        className="w-5 h-5"
                      />
                    </div>
                  ))}
                  <p className="text-sm text-muted-foreground">Select the correct answer</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min="5"
                      max="300"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      min="10"
                      max="1000"
                      step="10"
                      value={points}
                      onChange={(e) => setPoints(parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Add Question</Button>
              </CardFooter>
            </form>
          </Card>

          {questions.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button size="lg" asChild>
                <Link href={`/admin/quiz/${quizId}/control`}>
                  Start Quiz Session
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
