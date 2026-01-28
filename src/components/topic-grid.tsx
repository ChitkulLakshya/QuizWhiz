'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Film, Trophy, Globe, BookOpen, Monitor } from 'lucide-react';
import { createQuickGame } from '@/lib/firebase-service';
import { TRIVIA_CATEGORIES } from '@/lib/trivia-service';

const TOPICS = [
    { id: TRIVIA_CATEGORIES.GENERAL_KNOWLEDGE, name: 'General Knowledge', icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
    { id: TRIVIA_CATEGORIES.MOVIES, name: 'Movies', icon: Film, color: 'bg-indigo-100 text-indigo-600' },
    { id: TRIVIA_CATEGORIES.SPORTS, name: 'Sports', icon: Trophy, color: 'bg-orange-100 text-orange-600' },
    { id: TRIVIA_CATEGORIES.GEOGRAPHY, name: 'Geography', icon: Globe, color: 'bg-green-100 text-green-600' },
    { id: TRIVIA_CATEGORIES.VIDEO_GAMES, name: 'Video Games', icon: Monitor, color: 'bg-purple-100 text-purple-600' },
    { id: TRIVIA_CATEGORIES.HISTORY, name: 'History', icon: BookOpen, color: 'bg-yellow-100 text-yellow-600' },
];

export default function TopicGrid() {
    const router = useRouter();
    const [loading, setLoading] = useState<number | null>(null); // storing category ID

    const handleTopicClick = async (categoryId: number, topicName: string) => {
        setLoading(categoryId);
        try {
            console.log(`🎮 Starting Quick Game: ${topicName}`);

            // Call the consolidated Quick Play function
            // This handles auth, question fetching, and quiz creation
            const quizId = await createQuickGame(topicName, 'medium');

            // Redirect to the new Unified Game Room
            router.push(`/play/${quizId}`);

        } catch (error) {
            console.error('❌ Error starting game:', error);
            alert('Failed to start game. Please try again.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <section className="py-12 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <Zap className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                    <h2 className="text-3xl font-bold text-center">Quick Play</h2>
                </div>
                <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
                    Jump straight into a game! Pick a topic, we'll generate the quiz, invite your friends, and play instantly. No login required.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {TOPICS.map((topic) => (
                        <Card
                            key={topic.id}
                            className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${loading === topic.id ? 'opacity-70' : ''}`}
                            onClick={() => !loading && handleTopicClick(topic.id, topic.name)}
                        >
                            <CardContent className="p-6 flex flex-col items-center justify-center aspect-square text-center gap-4">
                                <div className={`p-4 rounded-full ${topic.color}`}>
                                    {loading === topic.id ? (
                                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : (
                                        <topic.icon className="h-6 w-6" />
                                    )}
                                </div>
                                <h3 className="font-semibold text-sm md:text-base">{topic.name}</h3>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
