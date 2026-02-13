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
const readTemplate = (templateName) => {
    try {
        const templatePath = path.join(process.cwd(), '../emails', `${templateName}.html`);
        return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
        console.error(`❌ Error reading template ${templateName}:`, error);
        return null;
    }
};
const createTransporter = () => {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const user = process.env.GMAIL_USER_EMAIL;

    if (!clientId || !clientSecret || !refreshToken || !user) {
        console.warn('⚠️ Missing Gmail credentials in env.');
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user,
            clientId,
            clientSecret,
            refreshToken,
        },
    });
};
app.post('/send-otp', async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: 'Missing email or code' });
    }

    const transporter = createTransporter();
    let htmlContent = readTemplate('otp');
    if (htmlContent) {
        htmlContent = htmlContent.replace('{{OTP_CODE}}', code);
    } else {
        htmlContent = `<p>Your verification code is: <strong>${code}</strong></p>`;
    }

    if (!transporter) {
        console.log(`[MOCK EMAIL] To: ${email}, Code: ${code}`);
        return res.json({ success: true, warning: 'Email mocked (missing credentials)' });
    }

    try {
        await transporter.sendMail({
            from: `QuizWhiz <${process.env.GMAIL_USER_EMAIL}>`,
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

    const transporter = createTransporter();
    let htmlContent = readTemplate('welcome');
    if (htmlContent) {
        htmlContent = htmlContent.replace('{{USER_NAME}}', name || 'Agent');
    } else {
        htmlContent = `<h3>Welcome to QuizWhiz, ${name || 'Agent'}!</h3><p>Get ready for the ultimate cyberpunk quiz experience.</p>`;
    }

    if (!transporter) {
        console.log(`[MOCK EMAIL] To: ${email}, Subject: Welcome!`);
        return res.json({ success: true, warning: 'Email mocked (missing credentials)' });
    }

    try {
        await transporter.sendMail({
            from: `QuizWhiz <${process.env.GMAIL_USER_EMAIL}>`,
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
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const base64creds = process.env.GOOGLE_CREDENTIALS_BASE64;

    if (!sheetId || !base64creds) {
        console.warn('⚠️ Missing Google Sheet config. Logging locally.');
        console.log(`[NEW USER] Name: ${name}, Email: ${email}`);
        return res.json({ success: true, warning: 'Logging config missing' });
    }

    try {
        const decoded = Buffer.from(base64creds, 'base64').toString('utf-8');
        const credentials = JSON.parse(decoded);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
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
});
