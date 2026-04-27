import { z } from 'zod';
import { GenerateQuizQuestionsOutput } from '@/ai/flows/generate-quiz-questions';

const generateQuestionsSchema = z.object({
    subject: z.string().min(3, 'Subject must be at least 3 characters long.'),
    skillLevel: z.string(),
    numberOfQuestions: z.coerce.number().min(1).max(10),
});

type GenerateQuestionsState = {
    status: 'success' | 'error' | 'idle';
    message: string;
    data?: GenerateQuizQuestionsOutput['questions'];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function generateQuestionsServerAction(
    prevState: GenerateQuestionsState,
    formData: FormData
): Promise<GenerateQuestionsState> {
    console.log('🤖 generateQuestions Action started (Client Wrapper)');

    const validatedFields = generateQuestionsSchema.safeParse({
        subject: formData.get('subject'),
        skillLevel: formData.get('skillLevel'),
        numberOfQuestions: formData.get('numberOfQuestions'),
    });

    if (!validatedFields.success) {
        console.log('❌ Validation failed:', validatedFields.error.flatten());
        return {
            status: 'error',
            message: validatedFields.error.flatten().fieldErrors.subject?.[0] || 'Invalid input.',
        };
    }

    try {
        const { subject, skillLevel, numberOfQuestions } = validatedFields.data;

        const response = await fetch(`${API_BASE_URL}/generate-quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, skillLevel, numberOfQuestions }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'API returned an error.');
        }

        console.log('✅ AI response received from Express Server');

        return {
            status: 'success',
            message: 'Questions generated successfully!',
            data: result.data,
        };
    } catch (error: any) {
        console.error('AI Generation API Error:', error);

        return {
            status: 'error',
            message: error.message || 'Failed to generate questions. Please try again.',
        };
    }
}
