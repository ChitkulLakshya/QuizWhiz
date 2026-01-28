'use server';

import { createQuiz, addQuestions } from '@/lib/firebase-service';
import { fetchTriviaQuestions } from '@/lib/trivia-service';
import { db } from '@/firebase'; // Ensuring we have db import if needed, though services handle it.

export async function createQuickGame(
    topicName: string,
    categoryId: number,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
) {
    try {
        console.log(`🚀 Creating Quick Game: ${topicName}`);

        // 1. Create Quiz Document (Anonymous Host)
        // We use a placeholder email since we don't have a user session yet.
        // The client will handle the anonymous auth *before* calling this? 
        // Wait, Server Actions run on the server. We don't have the client's Auth UID here easily 
        // unless we pass it or rely on cookies which firebase-admin uses.
        // 
        // SIMPLIFICATION: We will trigger this *from the client* using the existing firebase-service 
        // directly, OR we keep this logic client-side in a component.
        // Given the architecture is Client-Centric for Firebase (using client SDK), 
        // let's move this logic to a Client Component or a Client-side helper, NOT a Server Action.

        throw new Error("This should be called from client-side to maintain Auth context.");

    } catch (error) {
        console.error('Failed to create quick game:', error);
        throw error;
    }
}
