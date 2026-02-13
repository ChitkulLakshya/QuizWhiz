'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';
import Header from '@/components/header';
import { QuizForm } from './quiz-form';
export const maxDuration = 60;

export default function CreateQuizPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log('⛔ Access Denied: User not authenticated.');
        router.push('/login');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center gap-4 text-[#ccff00] font-mono">
        <div className="w-8 h-8 border-4 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs uppercase tracking-widest animate-pulse">Verifying Credentials...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <Header />
      <main className="flex-1 p-4 md:p-8 container max-w-4xl">
        <div className="mb-8">
          <h1 className="font-headline text-3xl md:text-4xl">Create a New Quiz</h1>
          <p className="text-muted-foreground mt-2">
            Fill in the details for your quiz. You can also use our AI assistant to generate questions for you.
          </p>
        </div>
        <QuizForm />
      </main>
    </div>
  );
}
