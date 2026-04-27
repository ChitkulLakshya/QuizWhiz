import { NextResponse } from 'next/server';
import { sendGmail, readTemplate } from '@/lib/server-utils';

export async function POST(request: Request) {
    try {
        const { name, email, subject, message, category } = await request.json();

        if (!email || !message || !subject) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const adminEmail = process.env.ADMIN_EMAIL || 'consolemaster.app@gmail.com';

        let htmlContent = readTemplate('support');
        if (htmlContent) {
            htmlContent = htmlContent
                .replace(/{{USER_NAME}}/g, name || 'Unknown User')
                .replace(/{{USER_EMAIL}}/g, email)
                .replace(/{{CATEGORY}}/g, category || 'General')
                .replace(/{{SUBJECT}}/g, subject)
                .replace(/{{MESSAGE}}/g, message.replace(/\n/g, '<br>'))
                .replace(/{{TIMESTAMP}}/g, new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
        } else {
            htmlContent = `
                <h3>Customer Support Request</h3>
                <p><strong>From:</strong> ${name || 'Unknown'} (${email})</p>
                <p><strong>Category:</strong> ${category || 'General'}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `;
        }

        const result = await sendGmail({
            to: adminEmail,
            subject: `[Support] ${subject}`,
            text: `Support request from ${name} (${email}):\n\nCategory: ${category || 'General'}\nSubject: ${subject}\n\n${message}`,
            html: htmlContent,
        });

        if (!result) {
            return NextResponse.json({ success: true, warning: 'Email mocked (missing credentials)' });
        }
        
        if (!result.success) {
            return NextResponse.json({ error: 'Failed to send support email' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to send support email:', error.message);
        return NextResponse.json({ error: 'Failed to send support email' }, { status: 500 });
    }
}
