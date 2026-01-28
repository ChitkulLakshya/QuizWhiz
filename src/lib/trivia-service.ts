import { Question } from '@/types/quiz';
import { v4 as uuidv4 } from 'uuid';
import he from 'he';

/**
 * Open Trivia Database Category IDs
 * Found at https://opentdb.com/api_config.php
 */
export const TRIVIA_CATEGORIES = {
    GENERAL_KNOWLEDGE: 9, // "General"
    MOVIES: 11,           // "Movies"
    SPORTS: 21,           // "Sports"
    GEOGRAPHY: 22,        // "Geography"
    HISTORY: 23,          // "History"
    VIDEO_GAMES: 15,
    SCIENCE_NATURE: 17,   // "Science"
    COMPUTERS: 18,
    MYTHOLOGY: 20,
};

// Map user-friendly strings to IDs
const CATEGORY_MAP: Record<string, number> = {
    'General': TRIVIA_CATEGORIES.GENERAL_KNOWLEDGE,
    'Movies': TRIVIA_CATEGORIES.MOVIES,
    'Sports': TRIVIA_CATEGORIES.SPORTS,
    'History': TRIVIA_CATEGORIES.HISTORY,
    'Geography': TRIVIA_CATEGORIES.GEOGRAPHY,
    'Science': TRIVIA_CATEGORIES.SCIENCE_NATURE,
};

interface OpenTDBQuestion {
    category: string;
    type: 'multiple' | 'boolean';
    difficulty: 'easy' | 'medium' | 'hard';
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
}

interface OpenTDBResponse {
    response_code: number;
    results: OpenTDBQuestion[];
}

/**
 * Helper to decode HTML entities without DOM
 */
const decodeText = (text: string): string => {
    return he.decode(text);
};

/**
 * Fetch questions from Open Trivia Database
 * @param quizId - ID of the quiz these questions belong to
 * @param category - User-friendly category name or ID
 * @param amount - Number of questions to fetch (default 10)
 * @param difficulty - Difficulty level (default 'medium')
 * @returns Array of formatted Question objects
 */
export const fetchQuestionsFromAPI = async (
    quizId: string,
    category: string | number,
    amount: number = 10,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<Question[]> => {
    try {
        // 1. Resolve Category ID
        let categoryId: number;
        if (typeof category === 'string') {
            categoryId = CATEGORY_MAP[category] || TRIVIA_CATEGORIES.GENERAL_KNOWLEDGE;
        } else {
            categoryId = category;
        }

        // 2. Build URL
        const url = `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&type=multiple&difficulty=${difficulty}`;
        console.log(`🌐 Fetching trivia from: ${url}`);

        // 3. Fetch Data
        const response = await fetch(url);
        const data: OpenTDBResponse = await response.json();

        if (data.response_code !== 0) {
            if (data.response_code === 1) {
                throw new Error("Not enough questions for this category/difficulty.");
            }
            throw new Error(`OpenTDB API returned error code: ${data.response_code}`);
        }

        // 4. Transform to Question Interface
        return data.results.map((q, index) => {
            // Decode raw strings
            const correctAnswer = decodeText(q.correct_answer);
            const incorrectAnswers = q.incorrect_answers.map(decodeText);

            // Combine and Shuffle
            // We attach a random sort key to shuffle, but keep track of the correct answer
            const allOptions = [...incorrectAnswers, correctAnswer];

            const shuffledOptions = allOptions
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value);

            // Find the new index of the correct answer
            const correctOptionIndex = shuffledOptions.findIndex(opt => opt === correctAnswer);

            return {
                id: uuidv4(),
                quizId,
                questionText: decodeText(q.question),
                options: shuffledOptions,
                correctOptionIndex, // This marks the correct answer effectively
                timeLimit: 20, // Default 20s
                points: 100,   // Default 100pts
                order: index,
            };
        });
    } catch (error) {
        console.error('❌ Error fetching trivia questions:', error);
        // Fallback? Or just rethrow
        throw error;
    }
};

// Aliasing for backward compatibility if needed, using the new function
export const fetchTriviaQuestions = fetchQuestionsFromAPI;
