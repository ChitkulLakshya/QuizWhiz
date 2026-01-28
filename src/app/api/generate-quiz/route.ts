
import { generateQuizQuestions } from '@/ai/flows/generate-quiz-questions';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { topic } = body;

        if (!topic) {
            return NextResponse.json(
                { error: 'Topic is required' },
                { status: 400 }
            );
        }

        console.log(`🤖 Generating AI quiz for topic: ${topic}`);

        const output = await generateQuizQuestions({
            subject: topic,
            skillLevel: 'medium',
            numberOfQuestions: 10,
        });

        return NextResponse.json({ questions: output.questions });
    } catch (error) {
        console.error('❌ Error generating quiz:', error);
        return NextResponse.json(
            { error: 'Failed to generate quiz' },
            { status: 500 }
        );
    }
}
