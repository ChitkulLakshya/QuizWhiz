"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = exports.generateQuestions = exports.logNewUser = exports.sendOtp = exports.submitAnswerSecure = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const googleapis_1 = require("googleapis");
const generative_ai_1 = require("@google/generative-ai");
const logger_1 = require("./utils/logger");
admin.initializeApp();
const db = admin.firestore();
exports.submitAnswerSecure = (0, https_1.onCall)({ cors: true }, async (request) => {
    const { quizId, participantId, questionIndex, selectedOptionIndex } = request.data;
    if (!quizId || !participantId || questionIndex === undefined || selectedOptionIndex === undefined) {
        logger_1.Logger.warn('Submit Answer: Missing required fields', { data: request.data });
        throw new https_1.HttpsError('invalid-argument', 'Missing required fields');
    }
    try {
        const questionsSnap = await db.collection('quizzes').doc(quizId).collection('questions').orderBy('order').get();
        if (questionsSnap.empty) {
            logger_1.Logger.warn(`Submit Answer: No questions found for quiz ${quizId}`);
            throw new https_1.HttpsError('not-found', 'No questions found');
        }
        const questionDoc = questionsSnap.docs[questionIndex];
        if (!questionDoc) {
            logger_1.Logger.warn(`Submit Answer: Question index ${questionIndex} out of bounds`, { quizId });
            throw new https_1.HttpsError('not-found', `Question ${questionIndex} not found`);
        }
        const question = questionDoc.data();
        const isCorrect = selectedOptionIndex === question.correctOptionIndex;
        const points = isCorrect ? (question.points || 100) : 0;
        const participantRef = db.collection('quizzes').doc(quizId).collection('participants').doc(participantId);
        await participantRef.update({
            [`answers.${questionIndex}`]: selectedOptionIndex,
            totalScore: admin.firestore.FieldValue.increment(points)
        });
        logger_1.Logger.info(`Submit Answer: Success`, { quizId, participantId, isCorrect, points });
        return { success: true, isCorrect, pointsEarned: points };
    }
    catch (error) {
        logger_1.Logger.error('Submit Answer: Internal Error', error, { quizId, participantId });
        throw new https_1.HttpsError('internal', 'Submission failed');
    }
});
exports.sendOtp = (0, https_1.onCall)({ cors: true }, async (request) => {
    const { email, code } = request.data;
    if (!email || !code) {
        logger_1.Logger.warn('Send OTP: Missing email or code');
        throw new https_1.HttpsError('invalid-argument', 'Missing email or code');
    }
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const user = process.env.GMAIL_USER_EMAIL;
    if (!clientId || !clientSecret || !refreshToken || !user) {
        logger_1.Logger.warn('Send OTP: Missing Gmail credentials. Mocking email sending.');
        logger_1.Logger.info(`[MOCK EMAIL] To: ${email}, Code: ${code}`);
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
        logger_1.Logger.info(`Send OTP: Email sent successfully`, { email });
        return { success: true };
    }
    catch (error) {
        logger_1.Logger.error('Send OTP: Failed to send email', error, { email });
        throw new https_1.HttpsError('internal', 'Failed to send email');
    }
});
exports.logNewUser = (0, https_1.onCall)({ cors: true }, async (request) => {
    const { name, email, phone } = request.data;
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const base64creds = process.env.GOOGLE_CREDENTIALS_BASE64;
    if (!sheetId || !base64creds) {
        logger_1.Logger.warn("Log New User: Missing Sheet Config");
        logger_1.Logger.info(`[New User]: ${name}, ${email}`);
        return { success: true, warning: 'Logging config missing' };
    }
    try {
        const decoded = Buffer.from(base64creds, 'base64').toString('utf-8');
        const credentials = JSON.parse(decoded);
        const auth = new googleapis_1.google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Sheet1!A:D',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[name, email, phone || 'N/A', new Date().toLocaleString()]]
            }
        });
        logger_1.Logger.info(`Log New User: Successfully appended to sheet`, { name, email });
        return { success: true };
    }
    catch (error) {
        logger_1.Logger.error('Log New User: Sheet Log Error', error, { name, email });
        return { success: true, warning: 'Logging failed' };
    }
});
exports.generateQuestions = (0, https_1.onCall)({ cors: true }, async (request) => {
    const { subject, skillLevel, numberOfQuestions = 10, image } = request.data;
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
        logger_1.Logger.error('Generate Questions: Missing AI API Key');
        throw new https_1.HttpsError('failed-precondition', 'Missing AI API Key');
    }
    try {
        logger_1.Logger.info(`Generate Questions: Starting generation`, { subject, skillLevel, numberOfQuestions });
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
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
        const processedQuestions = data.questions.map((q) => {
            const index = q.options.indexOf(q.correctAnswer);
            return {
                question: q.question,
                options: q.options,
                correctAnswer: String(index >= 0 ? index : 0) // Convert to string index for compatibility
            };
        });
        logger_1.Logger.info(`Generate Questions: Success`, { count: processedQuestions.length });
        return { success: true, data: processedQuestions };
    }
    catch (error) {
        logger_1.Logger.error('Generate Questions: AI Error', error);
        throw new https_1.HttpsError('internal', 'AI generation failed');
    }
});
exports.sendWelcomeEmail = (0, https_1.onCall)({ cors: true }, async (request) => {
    const { email, name } = request.data;
    if (!email) {
        logger_1.Logger.warn('Send Welcome Email: Missing email');
        throw new https_1.HttpsError('invalid-argument', 'Missing email');
    }
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const user = process.env.GMAIL_USER_EMAIL;
    if (!clientId || !clientSecret || !refreshToken || !user) {
        logger_1.Logger.warn('Send Welcome Email: Missing Gmail credentials. Mocking email sending.');
        logger_1.Logger.info(`[MOCK EMAIL] To: ${email}, Subject: Welcome to QuizWhiz!`);
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
        logger_1.Logger.info(`Send Welcome Email: Success`, { email });
        return { success: true };
    }
    catch (error) {
        logger_1.Logger.error('Send Welcome Email: Error', error, { email });
        throw new https_1.HttpsError('internal', 'Failed to send welcome email');
    }
});
//# sourceMappingURL=index.js.map