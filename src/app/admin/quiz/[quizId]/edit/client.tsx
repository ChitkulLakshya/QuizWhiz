'use client';

import * as React from 'react';
import { useState, useEffect, useActionState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getQuiz, getQuestions, addQuestion, deleteQuestion, deleteQuiz, addQuestions } from '@/lib/firebase-service';
import { Quiz, Question } from '@/types/quiz';
import { ArrowLeft, Plus, Trash2, Sparkles, Loader2, Check, X, Terminal, Cpu, Save, Clock, Target, AlertTriangle } from 'lucide-react';
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
import MobileNav from '@/components/mobile-nav';
import clsx from 'clsx';

// Allow AI generation to run for up to 60 seconds
export const maxDuration = 60;

function SubmitButton({ isSaving }: { isSaving: boolean }) {
  const { pending } = useFormStatus();
  const isLoading = pending || isSaving;

  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full sm:w-auto h-10 px-6 bg-[#ccff00] hover:bg-[#bbee00] text-black font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 group transition-all"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-black group-hover:rotate-12 transition-transform" />}
      {isLoading ? 'PROCESSING...' : 'INITIATE NEURAL LINK'}
    </button>
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
    if (!confirm('WARNING: PERMANENT DATA PURGE INITIATED. CONFIRM?')) return;

    try {
      await deleteQuiz(quizId);
      router.push('/admin');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz');
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] text-[#ccff00] font-mono">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <Cpu className="w-12 h-12" />
        <span className="tracking-widest">LOADING SEQUENCE DATA...</span>
      </div>
    </div>
  );

  if (!quiz) return <div className="p-8 bg-[#050505] text-red-500 font-mono">ERROR: SEQUENCE NOT FOUND</div>;

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#050505] text-white font-display relative overflow-hidden pb-20 md:pb-0">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10" style={{
        background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
        backgroundSize: '100% 4px'
      }}></div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#ccff00]">
            <Terminal className="w-5 h-5" />
            <span className="font-mono text-sm tracking-widest uppercase">Sequence Configuration</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              asChild
              className="text-gray-500 hover:text-white font-mono text-xs uppercase tracking-widest"
            >
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Exit
              </Link>
            </Button>
            <div className="h-4 w-px bg-[#333]"></div>
            <Button
              variant="ghost"
              onClick={handleDeleteQuiz}
              className="text-red-900 hover:text-red-500 hover:bg-red-900/10 font-mono text-xs uppercase tracking-widest"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Purge
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 relative z-10 space-y-8">

        {/* Title Section */}
        <div className="border-l-4 border-[#ccff00] pl-6 py-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">{quiz.title}</h1>
          <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
            <span className="bg-[#111] px-2 py-0.5 border border-[#333] text-[#ccff00]">ID: {quiz.code}</span>
            <span>STATUS: {quiz.status.toUpperCase()}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Column: Questions List */}
          <div className="lg:col-span-2 space-y-8">

            {/* Existing Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#ccff00]"></span>
                  Data Blocks ({questions.length})
                </h2>
              </div>

              <div className="space-y-4">
                {questions.map((q: Question, index: number) => (
                  <div key={q.id || index} className="group bg-[#0a0a0a] border border-[#333] hover:border-[#ccff00] transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#333] group-hover:bg-[#ccff00] transition-colors"></div>

                    <div className="p-4 pl-6 flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-baseline gap-3">
                          <span className="text-[#ccff00] font-mono text-sm">0{index + 1}</span>
                          <h3 className="text-lg font-bold text-white">{q.questionText}</h3>
                        </div>

                        <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500 uppercase">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {q.timeLimit}s</span>
                          <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {q.points} PTS</span>
                          <span>{q.options.length} OPTIONS</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {q.options.map((opt, i) => (
                            <div key={i} className={clsx(
                              "text-xs px-2 py-1 border",
                              i === q.correctOptionIndex
                                ? "border-green-900 bg-green-900/20 text-green-400"
                                : "border-[#222] text-gray-600"
                            )}>
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-gray-600 hover:text-red-500 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {questions.length === 0 && (
                  <div className="p-8 border border-dashed border-[#333] text-center space-y-2">
                    <p className="text-gray-500 font-mono text-xs uppercase">No Data Blocks Found</p>
                    <p className="text-[#ccff00] font-bold text-sm">INITIALIZE NEW DATA BLOCK BELOW</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pending Review Section */}
            {pendingQuestions.length > 0 && (
              <div className="border border-yellow-500/30 bg-yellow-500/5 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-yellow-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Pending Verification ({pendingQuestions.length})
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPendingQuestions([])}
                      className="text-[10px] font-mono uppercase text-gray-500 hover:text-white"
                    >
                      Discard All
                    </button>
                    <button
                      onClick={handleSavePendingQuestions}
                      disabled={isGenerating}
                      className="text-[10px] font-mono uppercase bg-yellow-500 text-black px-3 py-1 font-bold hover:bg-yellow-400 disabled:opacity-50"
                    >
                      {isGenerating ? 'Processing...' : 'Commit All'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {pendingQuestions.map((q, i) => (
                    <div key={i} className="bg-[#0a0a0a] p-3 border border-[#333] flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-gray-300">{q.questionText}</p>
                        <p className="text-[10px] text-gray-600 font-mono mt-1">AI GENERATED CONTENT</p>
                      </div>
                      <button onClick={() => handleDiscardPending(i)} className="text-gray-600 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Add Form */}
            <div className="bg-[#0a0a0a] border border-[#333] p-6 relative overflow-hidden group">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 bg-[#ccff00]"></div>
              <div className="absolute top-0 right-0 w-2 h-2 bg-[#ccff00]"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#ccff00]"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#ccff00]"></div>

              <h2 className="font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#ccff00]" />
                Inject New Data Block
              </h2>

              <form onSubmit={handleAddQuestion} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-500 uppercase">Query Parameter</label>
                  <input
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="ENTER_QUERY..."
                    className="w-full bg-[#050505] border border-[#333] p-3 text-white font-mono placeholder:text-gray-800 focus:border-[#ccff00] focus:outline-none transition-all text-sm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-gray-500 uppercase">Response Options</label>
                  <div className="grid grid-cols-1 gap-2">
                    {options.map((option, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <span className="font-mono text-[#ccff00] w-6">{String.fromCharCode(65 + index)}</span>
                        <input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...options];
                            newOptions[index] = e.target.value;
                            setOptions(newOptions);
                          }}
                          className="flex-1 bg-[#050505] border border-[#333] p-2 text-white font-mono text-xs focus:border-[#ccff00] focus:outline-none"
                          placeholder={`OPTION_${index}`}
                          required
                        />
                        <input
                          type="radio"
                          name="correct"
                          checked={correctIndex === index}
                          onChange={() => setCorrectIndex(index)}
                          className="accent-[#ccff00] w-4 h-4 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Duration (Sec)</label>
                    <input
                      type="number"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                      className="w-full bg-[#050505] border border-[#333] p-2 text-white font-mono text-xs focus:border-[#ccff00] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Point Value</label>
                    <input
                      type="number"
                      value={points}
                      onChange={(e) => setPoints(parseInt(e.target.value))}
                      className="w-full bg-[#050505] border border-[#333] p-2 text-white font-mono text-xs focus:border-[#ccff00] focus:outline-none"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full h-10 border border-[#ccff00] text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-bold uppercase tracking-widest text-xs transition-colors">
                  Commit Data Block
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: AI Cortex & Status */}
          <div className="space-y-6">

            {/* AI Cortex Panel */}
            <div className="bg-[#0a0a0a] border border-[#333] overflow-hidden relative">
              <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-gradient-x"></div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h2 className="font-bold uppercase tracking-widest text-white">Neural Cortex</h2>
                </div>
                <p className="text-[10px] font-mono text-gray-500 uppercase leading-relaxed">
                  Access external neural networks to generate procedural data blocks based on subject parameters.
                </p>

                <form action={generateAction} onSubmit={handleGenerateSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Target Subject</label>
                    <input name="subject" placeholder="E.G. QUANTUM PHYSICS" className="w-full bg-[#050505] border border-[#333] p-2 text-white font-mono text-xs focus:border-purple-500 focus:outline-none placeholder:text-gray-800 uppercase" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Complexity</label>
                      <Select name="skillLevel" defaultValue="normal">
                        <SelectTrigger className="w-full bg-[#050505] border-[#333] text-xs font-mono uppercase h-9 rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0a0a] border-[#333] text-white">
                          <SelectItem value="easy">Level 1 (Easy)</SelectItem>
                          <SelectItem value="normal">Level 2 (Normal)</SelectItem>
                          <SelectItem value="hard">Level 3 (Hard)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-gray-500 uppercase">Quantity</label>
                      <Select name="numberOfQuestions" defaultValue="5">
                        <SelectTrigger className="w-full bg-[#050505] border-[#333] text-xs font-mono uppercase h-9 rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0a0a] border-[#333] text-white">
                          {[1, 3, 5, 10].map(n => <SelectItem key={n} value={String(n)}>{n} BLOCKS</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <SubmitButton isSaving={isGenerating} />
                </form>
              </div>
            </div>

            {/* Quick Stats or Actions */}
            {questions.length > 0 && (
              <Link href={`/admin/quiz/${quizId}/control`}>
                <button className="w-full h-14 bg-[#ccff00] text-black font-black uppercase tracking-widest hover:bg-white transition-colors relative group overflow-hidden">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Terminal className="w-5 h-5" />
                    Initiate Sequence
                  </span>
                </button>
              </Link>
            )}

          </div>

        </div>
      </main>
      <MobileNav />
    </div>
  );
}



