import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { Logger } from './utils/logger';

admin.initializeApp();
const db = admin.firestore();

// --- Types ---
interface SubmitAnswerRequest {
    quizId: string;
    participantId: string;
    questionIndex: number;
    selectedOptionIndex: number;
}

interface SendOtpRequest {
    email: string;
    code: string;
}

interface LogNewUserRequest {
    name: string;
    email: string;
    phone?: string;
}

interface GenerateQuestionsRequest {
    subject: string;
    skillLevel: string;
    numberOfQuestions?: number;
    image?: string;
}

// --- Submit Answer Secure ---
export const submitAnswerSecure = onCall<SubmitAnswerRequest>({ cors: true }, async (request) => {
    const { quizId, participantId, questionIndex, selectedOptionIndex } = request.data;

    // Validate inputs
    if (!quizId || !participantId || questionIndex === undefined || selectedOptionIndex === undefined) {
        Logger.warn('Submit Answer: Missing required fields', { data: request.data });
        throw new HttpsError('invalid-argument', 'Missing required fields');
    }

    try {
        const questionsSnap = await db.collection('quizzes').doc(quizId).collection('questions').orderBy('order').get();
        if (questionsSnap.empty) {
            Logger.warn(`Submit Answer: No questions found for quiz ${quizId}`);
            throw new HttpsError('not-found', 'No questions found');
        }

        const questionDoc = questionsSnap.docs[questionIndex];
        if (!questionDoc) {
            Logger.warn(`Submit Answer: Question index ${questionIndex} out of bounds`, { quizId });
            throw new HttpsError('not-found', `Question ${questionIndex} not found`);
        }

        const question = questionDoc.data();
        const isCorrect = selectedOptionIndex === question.correctOptionIndex;
        const points = isCorrect ? (question.points || 100) : 0;

        const participantRef = db.collection('quizzes').doc(quizId).collection('participants').doc(participantId);
        await participantRef.update({
            [`answers.${questionIndex}`]: selectedOptionIndex,
            totalScore: admin.firestore.FieldValue.increment(points)
        });

        Logger.info(`Submit Answer: Success`, { quizId, participantId, isCorrect, points });
        return { success: true, isCorrect, pointsEarned: points };
    } catch (error) {
        Logger.error('Submit Answer: Internal Error', error, { quizId, participantId });
        throw new HttpsError('internal', 'Submission failed');
    }
});

// --- Send OTP ---
export const sendOtp = onCall<SendOtpRequest>({ cors: true }, async (request) => {
    const { email, code } = request.data;
    if (!email || !code) {
        Logger.warn('Send OTP: Missing email or code');
        throw new HttpsError('invalid-argument', 'Missing email or code');
    }

    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const user = process.env.GMAIL_USER_EMAIL;

    if (!clientId || !clientSecret || !refreshToken || !user) {
        Logger.warn('Send OTP: Missing Gmail credentials. Mocking email sending.');
        Logger.info(`[MOCK EMAIL] To: ${email}, Code: ${code}`);
        return { success: true, warning: 'Email mocked (missing credentials)' };
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user, clientId, clientSecret, refreshToken
            },
        });

        await transporter.sendMail({
            to: email,
            subject: 'Your Verification Code',
            text: `Your verification code is: ${code}`,
            html: `<p>Your verification code is: <strong>${code}</strong></p>`
        });

        Logger.info(`Send OTP: Email sent successfully`, { email });
        return { success: true };
    } catch (error) {
        Logger.error('Send OTP: Failed to send email', error, { email });
        throw new HttpsError('internal', 'Failed to send email');
    }
});

// --- Log New User ---
export const logNewUser = onCall<LogNewUserRequest>({ cors: true }, async (request) => {
    const { name, email, phone } = request.data;
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const base64creds = process.env.GOOGLE_CREDENTIALS_BASE64;

    if (!sheetId || !base64creds) {
        Logger.warn("Log New User: Missing Sheet Config");
        // Just log locally and return
        Logger.info(`[New User]: ${name}, ${email}`);
        return { success: true, warning: 'Logging config missing' };
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
                values: [[name, email, phone || 'N/A', new Date().toLocaleString()]]
            }
        });

        Logger.info(`Log New User: Successfully appended to sheet`, { name, email });
        return { success: true };
    } catch (error) {
        Logger.error('Log New User: Sheet Log Error', error, { name, email });
        return { success: true, warning: 'Logging failed' };
    }
});

// --- Generate Questions (AI) ---
export const generateQuestions = onCall<GenerateQuestionsRequest>({ cors: true }, async (request) => {
    const { subject, skillLevel, numberOfQuestions = 10, image } = request.data;
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
        Logger.error('Generate Questions: Missing AI API Key');
        throw new HttpsError('failed-precondition', 'Missing AI API Key');
    }

    try {
        Logger.info(`Generate Questions: Starting generation`, { subject, skillLevel, numberOfQuestions });
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `Generate ${numberOfQuestions} multiple-choice questions about "${subject}" at "${skillLevel}" difficulty.
        Output MUST be a JSON object with this schema:
        {
          "questions": [
            {
              "question": "string",
              "options": ["opt1", "opt2", "opt3", "opt4"],
              "correctAnswer": "exact string match from options"
            }
          ]
        }
        Do not allow markdown. Return RAW JSON.`;

        const result = await model.generateContent(image ? [prompt, { inlineData: { data: image.split(',')[1], mimeType: 'image/jpeg' } }] : prompt);
        const response = result.response;
        const text = response.text();
        const data = JSON.parse(text);

        // Convert correctAnswer to index
        const processedQuestions = data.questions.map((q: any) => {
            const index = q.options.indexOf(q.correctAnswer);
            return {
                question: q.question,
                options: q.options,
                correctAnswer: String(index >= 0 ? index : 0) // Convert to string index for compatibility
            };
        });

        Logger.info(`Generate Questions: Success`, { count: processedQuestions.length });
        return { success: true, data: processedQuestions };

    } catch (error) {
        Logger.error('Generate Questions: AI Error', error);
        throw new HttpsError('internal', 'AI generation failed');
    }
});

interface SendWelcomeEmailRequest {
    email: string;
    name?: string;
}

// --- Send Welcome Email ---
export const sendWelcomeEmail = onCall<SendWelcomeEmailRequest>({ cors: true }, async (request) => {
    const { email, name } = request.data;
    if (!email) {
        Logger.warn('Send Welcome Email: Missing email');
        throw new HttpsError('invalid-argument', 'Missing email');
    }

    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const user = process.env.GMAIL_USER_EMAIL;

    if (!clientId || !clientSecret || !refreshToken || !user) {
        Logger.warn('Send Welcome Email: Missing Gmail credentials. Mocking email sending.');
        Logger.info(`[MOCK EMAIL] To: ${email}, Subject: Welcome to QuizWhiz!`);
        return { success: true, warning: 'Email mocked (missing credentials)' };
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user, clientId, clientSecret, refreshToken
            },
        });

        await transporter.sendMail({
            to: email,
            subject: 'Welcome to QuizWhiz!',
            text: `Hi ${name || 'there'},\n\nWelcome to QuizWhiz! We are excited to have you on board.`,
            html: `<h3>Welcome to QuizWhiz, ${name || 'Agent'}!</h3><p>Get ready for the ultimate cyberpunk quiz experience.</p>`
        });

        Logger.info(`Send Welcome Email: Success`, { email });
        return { success: true };
    } catch (error) {
        Logger.error('Send Welcome Email: Error', error, { email });
        throw new HttpsError('internal', 'Failed to send welcome email');
    }
});

