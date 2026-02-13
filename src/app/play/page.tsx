'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Settings, Smartphone, Trophy, Zap, BookOpen, Film, Globe, Monitor, Sparkles, Brain, History as HistoryIcon, Gamepad2, Plane, Atom } from 'lucide-react';
import { createQuickGame, createAIQuickQuiz } from '@/lib/firebase-service';
import { TRIVIA_CATEGORIES } from '@/lib/trivia-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import clsx from 'clsx';
const THEMES: Record<number, { bgImage: string; bleedingText: string; bleedingClass: string; aspect: string }> = {
  [TRIVIA_CATEGORIES.GENERAL_KNOWLEDGE]: {
    bgImage: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1000&auto=format&fit=crop", // Abstract Neon/Brain vibe
    bleedingText: "TRIVIA",
    bleedingClass: "absolute -top-4 -left-8 text-8xl font-black text-white/5 uppercase rotate-90 origin-bottom-left whitespace-nowrap select-none",
    aspect: "aspect-[3/4]"
  },
  [TRIVIA_CATEGORIES.MOVIES]: {
    bgImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop", // Cinema/Movie Theater
    bleedingText: "CINEMA",
    bleedingClass: "absolute -right-8 top-10 text-8xl font-black text-white/10 uppercase tracking-tighter leading-none select-none writing-vertical-rl",
    aspect: "aspect-[3/4]"
  },
  [TRIVIA_CATEGORIES.SPORTS]: {
    bgImage: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1000&auto=format&fit=crop", // Dark Stadium/Action
    bleedingText: "SPORT",
    bleedingClass: "absolute top-0 right-0 text-7xl font-black text-white/5 uppercase rotate-180 writing-mode-vertical origin-top-right whitespace-nowrap select-none",
    aspect: "aspect-[3/4]"
  },
  [TRIVIA_CATEGORIES.GEOGRAPHY]: {
    bgImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop", // Earth from space/Global
    bleedingText: "WORLD",
    bleedingClass: "absolute -bottom-12 -left-4 text-8xl font-black text-white/5 uppercase select-none",
    aspect: "aspect-[3/4]"
  },
  [TRIVIA_CATEGORIES.VIDEO_GAMES]: {
    bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop", // Retro Arcade/Neon
    bleedingText: "8-BIT",
    bleedingClass: "absolute -bottom-4 -right-4 text-8xl font-black text-white/5 uppercase select-none",
    aspect: "aspect-[3/4]"
  },
  [TRIVIA_CATEGORIES.HISTORY]: {
    bgImage: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1000&auto=format&fit=crop", // Old Technology/Camera/History
    bleedingText: "HISTORY",
    bleedingClass: "absolute top-0 -right-8 text-7xl font-black text-white/5 uppercase rotate-90 origin-top-right whitespace-nowrap select-none",
    aspect: "aspect-[3/4]"
  },
  [TRIVIA_CATEGORIES.SCIENCE_NATURE]: {
    bgImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1000&auto=format&fit=crop", // Lab/DNA/Science
    bleedingText: "SCIENCE",
    bleedingClass: "absolute -top-4 -left-4 text-8xl font-black text-white/5 uppercase select-none",
    aspect: "aspect-[3/4]"
  }
};
const TOPICS = [
  { id: TRIVIA_CATEGORIES.GENERAL_KNOWLEDGE, name: 'General Knowledge', icon: Brain },
  { id: TRIVIA_CATEGORIES.MOVIES, name: 'Movies', icon: Film },
  { id: TRIVIA_CATEGORIES.SPORTS, name: 'Sports', icon: Trophy },
  { id: TRIVIA_CATEGORIES.GEOGRAPHY, name: 'Geography', icon: Globe },
  { id: TRIVIA_CATEGORIES.VIDEO_GAMES, name: 'Video Games', icon: Gamepad2 },
  { id: TRIVIA_CATEGORIES.HISTORY, name: 'History', icon: HistoryIcon },
  { id: TRIVIA_CATEGORIES.SCIENCE_NATURE, name: 'Science', icon: Atom },
];

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState<number | string | null>(null);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customTopic, setCustomTopic] = useState('');

  const handleTopicClick = async (categoryId: number, topicName: string) => {
    if (loading) return;
    setLoading(categoryId);
    try {
      const quizId = await createQuickGame(topicName, 'medium');
      router.push(`/play/game?quizId=${quizId}`);
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game.');
    } finally {
      setLoading(null);
    }
  };

  const handleCustomGenerate = async () => {
    if (!customTopic.trim() || loading) return;
    setLoading('custom');
    try {
      const quizId = await createAIQuickQuiz(customTopic);
      setIsCustomOpen(false);
      router.push(`/play/game?quizId=${quizId}`);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz.');
    } finally {
      setLoading(null);
    }
  };



  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white font-sans overflow-x-hidden selection:bg-[#ccff00] selection:text-black">

      {/* Background Texture*/}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-0">
        <span className="material-symbols-outlined text-[600px] text-white opacity-[0.03] -rotate-[15deg] select-none translate-x-12 translate-y-20 transform">bolt</span>
        <Zap strokeWidth={1} className="w-[600px] h-[600px] text-white opacity-[0.03] -rotate-[15deg] absolute translate-x-12 translate-y-20" />
      </div>

      <div className="relative z-10 flex flex-col min-h-[100dvh] pb-24 w-full max-w-md md:max-w-7xl mx-auto border-x border-white/5 bg-[#050505]">

        {/* Header */}
        <header className="flex items-center justify-between p-6 pb-2 bg-gradient-to-b from-[#050505] to-transparent sticky top-0 z-50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="bg-[#ccff00] text-black p-1.5 rounded-none border border-black shadow-[0_0_10px_rgba(204,255,0,0.3)]">
              <Brain className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#ccff00]/60 font-mono tracking-[0.2em] leading-none uppercase">QuizWhiz</span>
              <span className="text-white text-xs font-black tracking-tight leading-none mt-1 uppercase font-mono">Guest Player</span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 bg-black/50 px-3 py-1.5 border border-[#ccff00]/20 rounded-none backdrop-blur-md shadow-[inset_0_0_15px_rgba(204,255,0,0.05)]">
            <span className="block w-1.5 h-1.5 bg-[#ccff00] animate-pulse"></span>
            <p className="text-[#ccff00] text-[10px] font-mono font-bold tracking-[0.3em] uppercase">Online</p>
          </div>
        </header>

        {/* Headline */}
        <section className="px-6 py-6">
          <h1 className="text-white text-5xl font-black leading-[0.85] tracking-tighter uppercase font-display">
            Select<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-yellow-400 opacity-90">Topic</span>
          </h1>
          <div className="h-1 w-24 bg-[#ccff00] mt-4"></div>
        </section>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-6 gap-6 items-start pb-40">
          {TOPICS.map((topic) => {
            const theme = THEMES[topic.id];
            return (
              <div
                key={topic.id}
                onClick={() => handleTopicClick(topic.id, topic.name)}
                className={clsx(
                  "group relative w-full bg-[#111] border-4 border-[#ccff00] flex flex-col justify-end overflow-hidden transition-transform active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(204,255,0,0.1)] hover:shadow-[0_0_30px_rgba(204,255,0,0.2)]",
                  theme.aspect
                )}>
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-500"
                  style={{ backgroundImage: `url('${theme.bgImage}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                {theme.bleedingText && (
                  <span
                    className={theme.bleedingClass}
                    style={theme.bleedingClass.includes('writing-vertical-rl') ? { writingMode: 'vertical-rl' } : {}}
                  >
                    {theme.bleedingText}
                  </span>
                )}

                <div className="relative z-10 p-3 border-t-2 border-[#ccff00]/50 bg-black/80 backdrop-blur-md flex justify-between items-end">
                  <div>
                    <h3 className="text-white text-lg font-bold leading-none tracking-tight uppercase font-display">
                      {topic.name}
                    </h3>
                  </div>
                  {/* Replaced 'Level' with Icon */}
                  <topic.icon className="w-5 h-5 text-[#ccff00]" />
                </div>

                {loading === topic.id && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                    <div className="w-8 h-8 border-4 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Special */}
          <div
            onClick={() => setIsCustomOpen(true)}
            className="group relative w-full bg-[#ccff00] border-4 border-[#ccff00] flex flex-col justify-center items-center p-4 overflow-hidden transition-transform active:scale-95 cursor-pointer aspect-[3/4] shadow-[0_0_20px_rgba(204,255,0,0.4)]"
          >
            <Sparkles className="text-black w-10 h-10 mb-2 animate-pulse" />
            <h3 className="text-black text-lg font-black leading-none tracking-tight uppercase text-center font-display">
              CUSTOM<br />QUIZ
            </h3>
          </div>
        </div>

        {/* Replaced Mobile Navigation Bar */}

        <Dialog open={isCustomOpen} onOpenChange={setIsCustomOpen}>
          <DialogContent className="sm:max-w-md bg-[#111] border-2 border-[#ccff00] text-white">
            <DialogHeader>
              <DialogTitle className="text-[#ccff00] font-display uppercase tracking-wide">Create Custom Quiz</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter a topic to generate a unique quiz.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-white font-mono uppercase text-xs tracking-wider">Topic Name</Label>
                <Input
                  id="topic"
                  placeholder="E.G. SYNTHWAVE"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomGenerate()}
                  autoFocus
                  className="bg-black border-[#333] focus:border-[#ccff00] text-white placeholder:text-gray-700 font-display font-bold uppercase tracking-wide h-12 rounded-none border-x-0 border-t-0 border-b-2 focus:ring-0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsCustomOpen(false)} className="text-gray-500 hover:text-white hover:bg-transparent uppercase font-mono text-xs">Cancel</Button>
              <Button
                onClick={handleCustomGenerate}
                disabled={!customTopic.trim() || loading === 'custom'}
                className="bg-[#ccff00] text-black hover:bg-[#bbee00] font-black uppercase tracking-widest rounded-none h-12"
              >
                {loading === 'custom' ? 'LOADING...' : 'START GAME'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
