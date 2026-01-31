import { createQuiz, addQuestions } from '@/lib/firebase-service';
import { fetchTriviaQuestions } from '@/lib/trivia-service';

export async function createQuickGame(
    topicName: string,
    categoryId: number,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
) {
    console.log(' [Client] Creating Quick Game:', topicName);
    
    // THIS SHOULD BE CALLED FROM A REACT COMPONENT
    // Since we're client-side now, this is just a helper function.
    
    throw new Error('Please implement quick game creation logic inside a Client Component or Service.');
}
