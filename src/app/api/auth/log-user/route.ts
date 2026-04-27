import { NextResponse } from 'next/server';
import { sendGmail, getSheetsClient, readTemplate } from '@/lib/server-utils';

export async function POST(request: Request) {
    try {
        const { name, email, phone } = await request.json();

        // 1. Admin notification (fire and forget - but in serverless we catch it)
        const adminEmail = process.env.ADMIN_EMAIL || 'consolemaster.app@gmail.com';
        let adminHtml = readTemplate('newUser');
        if (adminHtml) {
            adminHtml = adminHtml
                .replace(/{{USER_NAME}}/g, name)
                .replace(/{{USER_EMAIL}}/g, email)
                .replace(/{{SIGNUP_TIMESTAMP}}/g, new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }))
                .replace(/{{USER_ID}}/g, Math.random().toString(36).substr(2, 9).toUpperCase());
        } else {
            adminHtml = `<p>New User Signed Up:<br>Name: ${name}<br>Email: ${email}</p>`;
        }

        sendGmail({
            to: adminEmail,
            subject: 'New User Signed Up',
            html: adminHtml,
            text: `New User Signed Up: ${name} (${email})`
        }).catch((err) => console.error('Admin notification failed:', err.message));

        // 2. Log to Google Sheets
        const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
        if (!GOOGLE_SHEET_ID) {
            return NextResponse.json({ success: true, warning: 'Sheet ID not configured' });
        }

        const sheets = getSheetsClient();
        if (!sheets) {
            return NextResponse.json({ success: true, warning: 'Service Account credentials missing' });
        }

        await sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: 'Sheet1!A:D',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[name, email, phone || 'N/A', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })]],
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to log user to Sheet:', error.message);
        return NextResponse.json({ success: true, warning: 'Logging failed silently' });
    }
}
