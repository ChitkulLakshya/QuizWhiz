'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';
import { createQuiz } from '@/lib/firebase-service';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/header';

export default function CreateQuiz() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // ✅ Simple auth check - NO admin verification (already done at login)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || !user.email) {
        console.log('❌ No user logged in, redirecting...');
        router.push('/login');
        return;
      }

      console.log('✅ User authenticated:', user.email);
      setUserEmail(user.email);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  // ✅ Handle Quiz Creation
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('❌ Quiz title is required.');
      return;
    }

    if (!userEmail) {
      alert('❌ Authentication error. Please log in again.');
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Creating quiz...', { title, description, userEmail });
      const quizId = await createQuiz(title, description, userEmail, auth.currentUser?.uid || "");

      console.log('✅ Quiz created with ID:', quizId);
      router.push(`/admin/quiz/${quizId}/edit`);
    } catch (error) {
      console.error('🔥 Failed to create quiz:', error);
      alert('Failed to create quiz. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loading while checking auth
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-lg">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          {/* User Info */}
          {userEmail && (
            <div className="mb-4 text-sm text-gray-600">
              Logged in as: <span className="font-semibold">{userEmail}</span>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">
                Create New Quiz
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleSubmit} noValidate>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Quiz Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter quiz title"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter quiz description (optional)"
                    rows={4}
                    disabled={loading}
                  />
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="w-full"
                >
                  {loading ? 'Creating…' : 'Create Quiz & Add Questions'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
