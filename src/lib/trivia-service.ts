import { Question } from '@/types/quiz';
import { v4 as uuidv4 } from 'uuid';
import he from 'he';

/**
 * Open Trivia Database Category IDs
 * Found at https://opentdb.com/api_config.php
 */
export const TRIVIA_CATEGORIES = {
    GENERAL_KNOWLEDGE: 9,
    MOVIES: 11,
    MUSIC: 12,
    TV: 14,
    VIDEO_GAMES: 15,
    SCIENCE_NATURE: 17,
    COMPUTERS: 18,
    SPORTS: 21,
    GEOGRAPHY: 22,
    HISTORY: 23,
    ANIME: 31,
    CARTOONS: 32,
};
const CATEGORY_MAP: Record<string, number> = {
    'general': TRIVIA_CATEGORIES.GENERAL_KNOWLEDGE,
    'gk': TRIVIA_CATEGORIES.GENERAL_KNOWLEDGE,

    'movies': TRIVIA_CATEGORIES.MOVIES,
    'film': TRIVIA_CATEGORIES.MOVIES,
    'cinema': TRIVIA_CATEGORIES.MOVIES,

    'music': TRIVIA_CATEGORIES.MUSIC,

    'tv': TRIVIA_CATEGORIES.TV,
    'television': TRIVIA_CATEGORIES.TV,

    'videogames': TRIVIA_CATEGORIES.VIDEO_GAMES,
    'games': TRIVIA_CATEGORIES.VIDEO_GAMES,

    'science': TRIVIA_CATEGORIES.SCIENCE_NATURE,
    'nature': TRIVIA_CATEGORIES.SCIENCE_NATURE,

    'computers': TRIVIA_CATEGORIES.COMPUTERS,
    'tech': TRIVIA_CATEGORIES.COMPUTERS,

    'sports': TRIVIA_CATEGORIES.SPORTS,
    'sport': TRIVIA_CATEGORIES.SPORTS,

    'geography': TRIVIA_CATEGORIES.GEOGRAPHY,

    'history': TRIVIA_CATEGORIES.HISTORY,

    'anime': TRIVIA_CATEGORIES.ANIME,
    'manga': TRIVIA_CATEGORIES.ANIME,

    'cartoons': TRIVIA_CATEGORIES.CARTOONS,
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
        let categoryId: number;
        if (typeof category === 'string') {
            const normalizedCategory = category.toLowerCase().trim();
            categoryId = CATEGORY_MAP[normalizedCategory];

            if (!categoryId) {
                console.warn(`⚠️ Category "${category}" not found in map. Defaulting to General Knowledge.`);
                categoryId = TRIVIA_CATEGORIES.GENERAL_KNOWLEDGE;
            }
        } else {
            categoryId = category;
        }
        const url = `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&type=multiple&difficulty=${difficulty}`;
        console.log(`🌐 Fetching trivia from: ${url}`);
        const response = await fetch(url);
        const data: OpenTDBResponse = await response.json();

        if (data.response_code !== 0) {
            if (data.response_code === 1) {
                throw new Error("We couldn't find enough questions for this topic. Try another one!");
            }
            throw new Error(`Failed to fetch questions from the trivia database.`);
        }
        return data.results.map((q, index) => {
            const correctAnswer = decodeText(q.correct_answer);
            const incorrectAnswers = q.incorrect_answers.map(decodeText);
            const allOptions = [...incorrectAnswers, correctAnswer];

            const shuffledOptions = allOptions
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value);
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
        throw error;
    }
};
export const fetchTriviaQuestions = fetchQuestionsFromAPI;
