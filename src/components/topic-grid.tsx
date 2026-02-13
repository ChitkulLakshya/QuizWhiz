'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Film, Trophy, Globe, BookOpen, Monitor, Sparkles, Rocket, Target, Gamepad2, Palette, Atom } from 'lucide-react';
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

const TOPICS = [
    { id: TRIVIA_CATEGORIES.GENERAL_KNOWLEDGE, name: 'General Knowledge', icon: BookOpen, borderColor: 'border-blue-200', iconColor: 'text-blue-600', iconBg: 'bg-blue-50', hoverBorder: 'hover:border-blue-400' },
    { id: TRIVIA_CATEGORIES.MOVIES, name: 'Movies', icon: Film, borderColor: 'border-violet-200', iconColor: 'text-violet-600', iconBg: 'bg-violet-50', hoverBorder: 'hover:border-violet-400' },
    { id: TRIVIA_CATEGORIES.SPORTS, name: 'Sports', icon: Trophy, borderColor: 'border-orange-200', iconColor: 'text-orange-600', iconBg: 'bg-orange-50', hoverBorder: 'hover:border-orange-400' },
    { id: TRIVIA_CATEGORIES.GEOGRAPHY, name: 'Geography', icon: Globe, borderColor: 'border-emerald-200', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50', hoverBorder: 'hover:border-emerald-400' },
    { id: TRIVIA_CATEGORIES.VIDEO_GAMES, name: 'Video Games', icon: Monitor, borderColor: 'border-fuchsia-200', iconColor: 'text-fuchsia-600', iconBg: 'bg-fuchsia-50', hoverBorder: 'hover:border-fuchsia-400' },
    { id: TRIVIA_CATEGORIES.HISTORY, name: 'History', icon: BookOpen, borderColor: 'border-amber-200', iconColor: 'text-amber-600', iconBg: 'bg-amber-50', hoverBorder: 'hover:border-amber-400' },
    { id: TRIVIA_CATEGORIES.SCIENCE_NATURE, name: 'Science', icon: Atom, borderColor: 'border-teal-200', iconColor: 'text-teal-600', iconBg: 'bg-teal-50', hoverBorder: 'hover:border-teal-400' },
];

export default function TopicGrid() {
    const router = useRouter();
    const [loading, setLoading] = useState<number | string | null>(null); // storing category ID or 'custom'
    const [isCustomOpen, setIsCustomOpen] = useState(false);
    const [customTopic, setCustomTopic] = useState('');

    const handleTopicClick = async (categoryId: number, topicName: string) => {
        setLoading(categoryId);
        try {
            console.log(`🎮 Starting Quick Game: ${topicName}`);
            const quizId = await createQuickGame(topicName, 'medium');
            router.push(`/play/${quizId}`);

        } catch (error) {
            console.error('❌ Error starting game:', error);
            alert('Failed to start game. Please try again.');
        } finally {
            setLoading(null);
        }
    };

    const handleCustomGenerate = async () => {
        if (!customTopic.trim()) return;
        setLoading('custom');
        try {
            console.log(`✨ Generating AI Quiz: ${customTopic}`);
            const quizId = await createAIQuickQuiz(customTopic);
            setIsCustomOpen(false);
            router.push(`/play/${quizId}`);
        } catch (error) {
            console.error('❌ Error generating quiz:', error);
            alert('Failed to generate quiz. Please try again.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <section className="py-24 bg-[#F2FAF7] relative overflow-hidden">
            {/* Background Icons - Unique Set */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                {/* Rocket - flying up-right from bottom left */}
                <motion.div
                    className="absolute bottom-[10%] -left-[2%] opacity-[0.05] text-indigo-500"
                    animate={{ y: [0, -40, 0], x: [0, 20, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Rocket className="w-40 h-40 md:w-72 md:h-72 rotate-45" />
                </motion.div>

                {/* Target - Top Right */}
                <motion.div
                    className="absolute top-[8%] -right-[4%] opacity-[0.05] text-rose-500"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Target className="w-32 h-32 md:w-64 md:h-64" />
                </motion.div>

                {/* Gamepad - Top Left */}
                <motion.div
                    className="absolute top-[15%] left-[5%] opacity-[0.04] text-purple-600 -rotate-12"
                    animate={{ rotate: [-12, -20, -12] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Gamepad2 className="w-24 h-24 md:w-48 md:h-48" />
                </motion.div>

                {/* Palette - Bottom Right */}
                <motion.div
                    className="absolute bottom-[20%] right-[8%] opacity-[0.04] text-orange-500 rotate-12"
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Palette className="w-28 h-28 md:w-52 md:h-52" />
                </motion.div>
            </div>

            <div className="container mx-auto px-4 relative z-10 w-full max-w-7xl">
                <div className="flex flex-col items-center justify-center mb-16 text-center">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-full bg-white shadow-sm ring-1 ring-slate-100">
                            <Zap className="h-6 w-6 text-slate-700 fill-slate-700" />
                        </div>
                        <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Quick Play</h2>
                    </div>
                    <p className="text-slate-500 text-lg max-w-xl leading-relaxed">
                        Select a category to start a game instantly. No login required.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-8 pb-8">
                    {TOPICS.map((topic) => (
                        <Card
                            key={topic.id}
                            className={`
                                w-[200px] h-[220px] cursor-pointer transition-all duration-300 rounded-2xl
                                bg-white border-2 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl
                                ${topic.borderColor} ${topic.hoverBorder}
                                ${loading === topic.id ? 'opacity-70 scale-95' : ''}
                            `}
                            onClick={() => !loading && handleTopicClick(topic.id, topic.name)}
                        >
                            <CardContent className="h-full flex flex-col items-center justify-center p-6 gap-5">
                                <div className={`p-4 rounded-full ${topic.iconBg} transition-colors`}>
                                    {loading === topic.id ? (
                                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent text-slate-400" />
                                    ) : (
                                        <topic.icon className={`h-8 w-8 ${topic.iconColor}`} />
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-700 text-lg text-center leading-tight">
                                    {topic.name}
                                </h3>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Custom Topic Card - Special Action */}
                    <Card
                        className={`
                            w-[200px] h-[220px] cursor-pointer transition-all duration-300 rounded-2xl
                            bg-white border-2 border-dashed border-purple-700
                            hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:bg-purple-50/30
                            ${loading === 'custom' ? 'opacity-70 scale-95' : ''}
                        `}
                        onClick={() => setIsCustomOpen(true)}
                    >
                        <CardContent className="h-full flex flex-col items-center justify-center p-6 gap-5">
                            <div className="p-4 rounded-full bg-purple-700 text-white shadow-md ring-4 ring-purple-100">
                                {loading === 'custom' ? (
                                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : ( // Solid colored icon circle
                                    <Sparkles className="h-8 w-8" />
                                )}
                            </div>
                            <h3 className="font-bold text-purple-900 text-lg text-center leading-tight">
                                Custom Topic
                            </h3>
                        </CardContent>
                    </Card>
                </div>

                <Dialog open={isCustomOpen} onOpenChange={setIsCustomOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create Your Own</DialogTitle>
                            <DialogDescription>
                                Enter any topic, and our AI will generate a unique quiz for you!
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="topic">Topic</Label>
                                <Input
                                    id="topic"
                                    placeholder="e.g. Taylor Swift, Python Programming, 90s Sitcoms"
                                    value={customTopic}
                                    onChange={(e) => setCustomTopic(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCustomGenerate()}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCustomOpen(false)}>Cancel</Button>
                            <Button onClick={handleCustomGenerate} disabled={!customTopic.trim() || loading === 'custom'}>
                                {loading === 'custom' ? 'Generating...' : 'Generate Quiz'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </section>
    );
}
