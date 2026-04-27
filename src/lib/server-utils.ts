import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

// ─── Config ──────────────────────────────────────────────────────────
const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const GMAIL_USER = process.env.GMAIL_USER_EMAIL;

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

const hasOAuthCreds = !!(GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET && GMAIL_REFRESH_TOKEN);
const hasServiceAccountCreds = !!(GOOGLE_SERVICE_ACCOUNT_EMAIL && GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);

// ─── Gmail API Sender ───────────────────────────────────────────────
export async function sendGmail({ to, subject, text, html }: { to: string; subject: string; text?: string; html?: string }) {
    if (!hasOAuthCreds || !GMAIL_USER) {
        console.warn('⚠️ Missing Gmail OAuth credentials. Skipping email.');
        return null;
    }

    try {
        const oAuth2Client = new google.auth.OAuth2(
            GMAIL_CLIENT_ID,
            GMAIL_CLIENT_SECRET,
            'https://developers.google.com/oauthplayground'
        );
        oAuth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });

        const accessTokenResponse = await oAuth2Client.getAccessToken();
        if (!accessTokenResponse?.token) {
            console.error('❌ Failed to get Gmail access token');
            return null;
        }

        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
        const mimeMessage = [
            `From: QuizWhiz <${GMAIL_USER}>`,
            `To: ${to}`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            '',
            html || text || '',
        ].join('\r\n');

        const raw = Buffer.from(mimeMessage)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/g, '');

        await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw },
        });

        return { success: true };
    } catch (error: any) {
        console.error('❌ Failed to send via Gmail API:', error.message);
        return { success: false, error };
    }
}

// ─── Sheets Client ──────────────────────────────────────────────────
export function getSheetsClient() {
    try {
        const jsonPath = path.join(process.cwd(), 'google-credentials.json');
        
        // Priority 1: Use local JSON file if it exists (Most reliable)
        if (fs.existsSync(jsonPath)) {
            const auth = new google.auth.GoogleAuth({
                keyFile: jsonPath,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
            return google.sheets({ version: 'v4', auth });
        }

        // Priority 2: Use environment variables
        if (!hasServiceAccountCreds) return null;

        let privateKey = GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!;
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.slice(1, -1);
        }
        if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
            privateKey = privateKey.slice(1, -1);
        }
        privateKey = privateKey.replace(/\\n/g, '\n');

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        return google.sheets({ version: 'v4', auth });
    } catch (error: any) {
        console.error('❌ Failed to create Sheets client:', error.message);
        return null;
    }
}

// ─── Template Reader ────────────────────────────────────────────────
export function readTemplate(templateName: string) {
    try {
        // In Next.js/Vercel, files in the root can be accessed via process.cwd()
        const templatePath = path.join(process.cwd(), 'emails', `${templateName}.html`);
        return fs.readFileSync(templatePath, 'utf8');
    } catch (error: any) {
        console.error(`❌ Failed to read template ${templateName}:`, error.message);
        return null;
    }
}
