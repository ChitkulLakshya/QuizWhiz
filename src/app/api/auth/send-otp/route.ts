import { NextResponse } from 'next/server';
import { sendGmail, readTemplate } from '@/lib/server-utils';

export async function POST(request: Request) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json({ error: 'Missing email or code' }, { status: 400 });
        }

        let htmlContent = readTemplate('otp');
        if (htmlContent) {
            htmlContent = htmlContent.replace('{{OTP_CODE}}', code);
        } else {
            htmlContent = `<p>Your verification code is: <strong>${code}</strong></p>`;
        }

        const result = await sendGmail({
            to: email,
            subject: 'Your Verification Code',
            text: `Your verification code is: ${code}`,
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
        console.error('Failed to send OTP:', error.message);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
