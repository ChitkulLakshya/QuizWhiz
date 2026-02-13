import fs from 'fs';
import path from 'path';

import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

// ─── Shared OAuth2 Config ────────────────────────────────────────────
const GOOGLE_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const GMAIL_USER = process.env.GMAIL_USER_EMAIL;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

const hasOAuthCreds = !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN);

if (!hasOAuthCreds) {
    console.warn('⚠️  Missing OAuth2 credentials (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN).');
    console.warn('   Email sending and Google Sheets logging will be mocked.');
}

// ─── Shared OAuth2 Client (used for both Gmail & Sheets) ────────────
const getOAuth2Client = () => {
    if (!hasOAuthCreds) return null;
    const oAuth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
    );
    oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
    return oAuth2Client;
};

// ─── Email Transporter (OAuth2 refresh token) ───────────────────────
const createTransporter = async () => {
    if (!hasOAuthCreds || !GMAIL_USER) {
        console.warn('⚠️ Missing Gmail OAuth2 credentials. Email will be mocked.');
        return null;
    }

    const oAuth2Client = getOAuth2Client();
    const accessTokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token;

    if (!accessToken) {
        console.error('❌ Failed to obtain access token from refresh token.');
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: GMAIL_USER,
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            refreshToken: GOOGLE_REFRESH_TOKEN,
            accessToken,
        },
    });
};

// ─── Template Reader ─────────────────────────────────────────────────
const readTemplate = (templateName) => {
    try {
        const templatePath = path.join(process.cwd(), '../emails', `${templateName}.html`);
        return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
        console.error(`❌ Error reading template ${templateName}:`, error);
        return null;
    }
};

// ─── Routes ──────────────────────────────────────────────────────────

app.post('/send-otp', async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: 'Missing email or code' });
    }

    let htmlContent = readTemplate('otp');
    if (htmlContent) {
        htmlContent = htmlContent.replace('{{OTP_CODE}}', code);
    } else {
        htmlContent = `<p>Your verification code is: <strong>${code}</strong></p>`;
    }

    try {
        const transporter = await createTransporter();
        if (!transporter) {
            console.log(`[MOCK EMAIL] To: ${email}, Code: ${code}`);
            return res.json({ success: true, warning: 'Email mocked (missing credentials)' });
        }

        await transporter.sendMail({
            from: `QuizWhiz <${GMAIL_USER}>`,
            to: email,
            subject: 'Your Verification Code',
            text: `Your verification code is: ${code}`,
            html: htmlContent,
        });
        console.log(`✅ OTP sent to ${email}`);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Failed to send OTP:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.post('/send-welcome', async (req, res) => {
    const { email, name } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Missing email' });
    }

    let htmlContent = readTemplate('welcome');
    if (htmlContent) {
        htmlContent = htmlContent.replace('{{USER_NAME}}', name || 'Agent');
    } else {
        htmlContent = `<h3>Welcome to QuizWhiz, ${name || 'Agent'}!</h3><p>Get ready for the ultimate cyberpunk quiz experience.</p>`;
    }

    try {
        const transporter = await createTransporter();
        if (!transporter) {
            console.log(`[MOCK EMAIL] To: ${email}, Subject: Welcome!`);
            return res.json({ success: true, warning: 'Email mocked (missing credentials)' });
        }

        await transporter.sendMail({
            from: `QuizWhiz <${GMAIL_USER}>`,
            to: email,
            subject: 'Welcome to QuizWhiz!',
            text: `Hi ${name || 'there'},\n\nWelcome to QuizWhiz! We are excited to have you on board.`,
            html: htmlContent,
        });
        console.log(`✅ Welcome email sent to ${email}`);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Failed to send Welcome Email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.post('/log-user', async (req, res) => {
    const { name, email, phone } = req.body;

    if (!GOOGLE_SHEET_ID) {
        console.warn('⚠️ Missing GOOGLE_SHEET_ID. Logging locally.');
        console.log(`[NEW USER] Name: ${name}, Email: ${email}`);
        return res.json({ success: true, warning: 'Sheet ID not configured' });
    }

    const oAuth2Client = getOAuth2Client();
    if (!oAuth2Client) {
        console.warn('⚠️ Missing OAuth2 credentials for Sheets. Logging locally.');
        console.log(`[NEW USER] Name: ${name}, Email: ${email}`);
        return res.json({ success: true, warning: 'OAuth2 credentials missing' });
    }

    try {
        const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
        await sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: 'Sheet1!A:D',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[name, email, phone || 'N/A', new Date().toLocaleString()]],
            },
        });
        console.log(`✅ User logged to Sheet: ${email}`);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Failed to log user to Sheet:', error);
        res.json({ success: true, warning: 'Logging failed silently' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`OAuth2 credentials: ${hasOAuthCreds ? '✅ loaded' : '❌ missing'}`);
    console.log(`Gmail user: ${GMAIL_USER || '❌ not set'}`);
    console.log(`Google Sheet ID: ${GOOGLE_SHEET_ID || '❌ not set'}`);
});
