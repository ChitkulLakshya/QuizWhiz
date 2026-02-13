
import { generateQuizQuestions } from '@/ai/flows/generate-quiz-questions';
import { NextResponse } from 'next/server';
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { topic } = body;

        if (!topic) {
            return NextResponse.json(
                { error: 'Topic is required' },
                { status: 400, headers: corsHeaders }
            );
        }

        console.log(`🤖 Generating AI quiz for topic: ${topic}`);

        const output = await generateQuizQuestions({
            subject: topic,
            skillLevel: 'medium',
            numberOfQuestions: 10,
        });

        return NextResponse.json({ questions: output.questions }, { headers: corsHeaders });
    } catch (error) {
        console.error('❌ Error generating quiz:', error);
        return NextResponse.json(
            { error: 'Failed to generate quiz' },
            { status: 500, headers: corsHeaders }
        );
    }
}
