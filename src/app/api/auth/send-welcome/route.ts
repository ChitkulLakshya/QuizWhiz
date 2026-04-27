import { NextResponse } from 'next/server';
import { sendGmail, readTemplate } from '@/lib/server-utils';

export async function POST(request: Request) {
    try {
        const { email, name } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Missing email' }, { status: 400 });
        }

        let htmlContent = readTemplate('welcome');
        if (htmlContent) {
            htmlContent = htmlContent.replace('{{USER_NAME}}', name || 'Agent');
        } else {
            htmlContent = `<h3>Welcome to QuizWhiz, ${name || 'Agent'}!</h3><p>Get ready for the ultimate cyberpunk quiz experience.</p>`;
        }

        const result = await sendGmail({
            to: email,
            subject: 'Welcome to QuizWhiz!',
            text: `Hi ${name || 'there'},\n\nWelcome to QuizWhiz! We are excited to have you on board.`,
            html: htmlContent,
        });

        if (!result) {
            return NextResponse.json({ success: true, warning: 'Email mocked (missing credentials)' });
        }
        
        if (!result.success) {
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to send Welcome Email:', error.message);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
