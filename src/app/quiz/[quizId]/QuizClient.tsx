'use client';

import { mockQuizzes } from '@/lib/mock-data';
import QuizGame from './quiz-client';
import Header from '@/components/header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function QuizClient() {
  const params = useParams();
  const quizId = Array.isArray(params?.quizId) ? params?.quizId[0] : params?.quizId;
  const quiz = mockQuizzes.find(q => q.id === quizId);

  if (!quiz) {
    return (
        <div className="flex flex-col w-full">
            <Header />
            <main className="flex-1 p-8 flex items-center justify-center">
                 <Alert variant="destructive" className="max-w-md">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle className="font-headline">Quiz Not Found</AlertTitle>
                    <AlertDescription>
                        The quiz you are looking for does not exist or may have been moved.
                    </AlertDescription>
                </Alert>
            </main>
        </div>
    );
  }

  return <QuizGame quiz={quiz} />;
}
