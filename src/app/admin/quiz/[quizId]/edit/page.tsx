'use client';

import * as React from 'react';
import { useState, useEffect, useActionState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/header';
import { getQuiz, getQuestions, addQuestion, deleteQuestion, deleteQuiz, addQuestions } from '@/lib/firebase-service';
import { Quiz, Question } from '@/types/quiz';
import { ArrowLeft, Plus, Trash2, Sparkles, Loader2, Check, X } from 'lucide-react';
import Link from 'next/link';
import { generateQuestionsAction } from '@/app/host/create/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Allow AI generation to run for up to 60 seconds
export const maxDuration = 60;

function SubmitButton({ isSaving }: { isSaving: boolean }) {
  const { pending } = useFormStatus();
  const isLoading = pending || isSaving;
  
  return (
    <Button 
      type="submit" 
      className="w-full sm:w-auto"
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Generate
    </Button>
  );
}

export default function EditQuiz() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Generation
  const [generateState, generateAction] = useActionState(generateQuestionsAction, { status: 'idle', message: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingQuestions, setPendingQuestions] = useState<Omit<Question, 'id' | 'quizId'>[]>([]);

  // New question form
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [timeLimit, setTimeLimit] = useState(30);
  const [points, setPoints] = useState(100);

  useEffect(() => {
    loadData();
  }, [quizId]);

  useEffect(() => {
    if (generateState.status === 'success' && generateState.data) {
      const newPending = generateState.data.map(q => {
         const correctIdx = parseInt(q.correctAnswer);
         return {
           questionText: q.question,
           options: q.options,
           correctOptionIndex: !isNaN(correctIdx) ? correctIdx : 0,
           timeLimit: 30,
           points: 100,
           order: 0 // Will be set when saving
         };
      });
      setPendingQuestions(prev => [...prev, ...newPending]);
      toast({ title: 'Generated', description: 'Review questions before adding.' });
      setIsGenerating(false);
    } else if (generateState.status === 'error') {
        toast({ title: 'Error', description: generateState.message, variant: 'destructive' });
        setIsGenerating(false);
    }
  }, [generateState]);

  const handleDiscardPending = (index: number) => {
    setPendingQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSavePendingQuestions = async () => {
    if (pendingQuestions.length === 0) return;
    setIsGenerating(true);
    try {
        const startOrder = questions.length;
        const questionsToSave = pendingQuestions.map((q, i) => ({
            ...q,
            order: startOrder + i
        }));
        
        await addQuestions(quizId, questionsToSave);
        setPendingQuestions([]);
        loadData();
        toast({ title: 'Success', description: 'Questions added to quiz.' });
    } catch (error) {
        console.error(error);
        toast({ title: 'Error', description: 'Failed to save questions.', variant: 'destructive' });
    } finally {
        setIsGenerating(false);
    }
  };

  const handleGenerateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const subject = formData.get('subject') as string;
    
    if (!subject || subject.trim().length === 0) {
        e.preventDefault();
        toast({ 
            title: "Validation Error", 
            description: "Please enter a subject for the quiz.",
            variant: "destructive" 
        });
        return;
    }
  };

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
    if (!questionText.trim() || options.some((o: string) => !o.trim())) {
      alert('Please fill all fields');
      return;
    }

    try {
      await addQuestion(quizId, {
        questionText,
        options: options.filter((o: string) => o.trim()),
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
              {questions.map((q: Question, index: number) => (
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
                      {q.options.map((option: string, optIndex: number) => (
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

          {/* AI Question Generator */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Sparkles className="text-primary fill-primary" /> AI Question Generator
              </CardTitle>
              <CardDescription>
                Generate questions automatically using AI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form 
                action={generateAction} 
                onSubmit={handleGenerateSubmit}
                className="grid sm:grid-cols-4 gap-4 items-end"
              >
                <div className="space-y-2 col-span-4 sm:col-span-1">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" placeholder="e.g., Science" />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="skillLevel">Skill Level</Label>
                  <Select name="skillLevel" defaultValue="normal">
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="numberOfQuestions">Count</Label>
                   <Select name="numberOfQuestions" defaultValue="5">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,10].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                </div>
                 <SubmitButton isSaving={isGenerating} />
              </form>
            </CardContent>
          </Card>

          {/* Pending Questions Review */}
          {pendingQuestions.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Pending Review ({pendingQuestions.length})</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setPendingQuestions([])}>
                        Discard All
                    </Button>
                    <Button onClick={handleSavePendingQuestions} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Add All to Quiz
                    </Button>
                </div>
              </div>
              <div className="space-y-4">
                {pendingQuestions.map((q, index) => (
                  <Card key={index} className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {q.questionText}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-2">
                            Time: {q.timeLimit}s | Points: {q.points}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDiscardPending(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {q.options.map((option: string, optIndex: number) => (
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
          )}

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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestionText(e.target.value)}
                    placeholder="Enter your question"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options *</Label>
                  {options.map((option: string, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <span className="font-semibold w-8">{String.fromCharCode(65 + index)}.</span>
                      <Input
                        value={option}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTimeLimit(parseInt(e.target.value))}
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPoints(parseInt(e.target.value))}
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
