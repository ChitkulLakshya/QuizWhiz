import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Configure Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your preferred service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const emailService = {
    /**
     * Reads an HTML template from the filesystem.
     */
    getTemplate: (templateName: string): string => {
        try {
            const templatePath = path.join(process.cwd(), 'emails', `${templateName}.html`);
            return fs.readFileSync(templatePath, 'utf8');
        } catch (error) {
            console.error(`❌ Error reading email template '${templateName}':`, error);
            return '';
        }
    },

    /**
     * Sends an OTP email to the user.
     * @param email Recipient email
     * @param code 6-digit OTP code
     */
    sendOtp: async (email: string, code: string) => {
        try {
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. Email simulation:');
                console.log(`[Email Mock] To: ${email}, Subject: Verify Account, OTP: ${code}`);
                return;
            }

            let htmlContent = emailService.getTemplate('otp');
            if (htmlContent) {
                htmlContent = htmlContent.replace('{{OTP_CODE}}', code);
            } else {
                htmlContent = `<p>Your verification code is: <strong>${code}</strong></p>`;
            }

            const info = await transporter.sendMail({
                from: '"QuizWhiz" <noreply@quizwhiz.com>',
                to: email,
                subject: 'Your Verification Code - QuizWhiz',
                html: htmlContent,
            });
            console.log('✅ OTP Email sent: %s', info.messageId);
        } catch (error) {
            console.error('❌ Error sending OTP email:', error);
        }
    },

    /**
     * Sends a Welcome email.
     * @param email Recipient email
     * @param name User's name
     */
    sendWelcome: async (email: string, name: string = 'Explorer') => {
        try {
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. Email simulation:');
                console.log(`[Email Mock] To: ${email}, Subject: Welcome to QuizWhiz!`);
                return;
            }

            let htmlContent = emailService.getTemplate('welcome');
            if (htmlContent) {
                htmlContent = htmlContent.replace('{{USER_NAME}}', name);
            } else {
                htmlContent = `<p>Welcome to QuizWhiz, ${name}!</p>`;
            }

            const info = await transporter.sendMail({
                from: '"QuizWhiz" <noreply@quizwhiz.com>',
                to: email,
                subject: 'Welcome to QuizWhiz! 🎉',
                html: htmlContent,
            });
            console.log('✅ Welcome Email sent: %s', info.messageId);
        } catch (error) {
            console.error('❌ Error sending Welcome email:', error);
        }
    }
};
