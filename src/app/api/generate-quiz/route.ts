
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
        const { subject, topic, skillLevel = 'medium', numberOfQuestions = 10 } = body;
        const finalSubject = subject || topic;

        if (!finalSubject) {
            return NextResponse.json(
                { error: 'Subject or Topic is required' },
                { status: 400, headers: corsHeaders }
            );
        }

        console.log(`🤖 Generating AI quiz for subject: ${finalSubject} (${skillLevel}, ${numberOfQuestions} questions)`);

        const output = await generateQuizQuestions({
            subject: finalSubject,
            skillLevel: skillLevel,
            numberOfQuestions: numberOfQuestions,
        });

        return NextResponse.json({ success: true, data: output.questions }, { headers: corsHeaders });
    } catch (error: any) {
        console.error('❌ Error generating quiz:', error);
        console.error('❌ Detailed Error Message:', error.message);
        return NextResponse.json(
             { error: error.message || 'Failed to generate quiz' },
             { status: 500, headers: corsHeaders }
        );
    }
}
