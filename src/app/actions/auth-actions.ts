'use server';

import { sendVerificationEmail } from '@/utils/emailSender';

export async function sendOtp(email: string, code: string) {
    try {
        await sendVerificationEmail(email, code);
        return { success: true };
    } catch (error) {
        console.error('Failed to send OTP:', error);
        return { success: false, error: 'Failed to send verification email' };
    }
}
