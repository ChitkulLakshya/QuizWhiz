'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users, Trophy, Zap } from 'lucide-react';
import Header from '@/components/header';
import TopicGrid from '@/components/topic-grid';
// import { seedFirstAdmin } from '@/lib/seed-admin';

export default function HomePage() {
  // Uncomment to seed your email as admin, then re-comment
  // seedFirstAdmin('your-email@example.com');

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 text-center bg-gradient-to-b from-primary/20 to-background">
          <h1 className="font-headline text-5xl md:text-6xl mb-6">QuizWhiz</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create engaging real-time quizzes with live results and leaderboards
          </p>

          {/* Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg">
              <Link href="/login">Admin Login</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/join">Join Quiz</Link>
            </Button>
          </div>
        </section>

        <TopicGrid />

        {/* Features Section */}
        <section className="md:py-20 py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Zap className="h-12 w-12 mb-4 text-primary" />
                  <CardTitle>Real-Time Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Live synchronization between admin and participants. See answers come in real-time.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-12 w-12 mb-4 text-primary" />
                  <CardTitle>Easy Join</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Participants join via QR code or 6-digit code. No accounts needed.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Trophy className="h-12 w-12 mb-4 text-primary" />
                  <CardTitle>Live Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Track scores in real-time with speed-based scoring. Faster correct answers earn more points.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 px-4 md:px-8 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="space-y-6">
              {['Create Your Quiz', 'Share Join Code', 'Control the Flow', 'View Final Results'].map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step}</h3>
                    <p className="text-muted-foreground">
                      {[
                        "Add questions, set time limits, and configure points for each question.",
                        "Display the QR code or 6-digit code for participants to join.",
                        "Start questions when ready, view live results, and advance at your own pace.",
                        "See the final leaderboard with rankings and scores."
                      ][idx]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
