import Header from '@/components/header';
import { QuizForm } from './quiz-form';

// Allow AI generation to run for up to 60 seconds
export const maxDuration = 60;

export default function CreateQuizPage() {
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
