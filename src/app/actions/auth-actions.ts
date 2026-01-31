import { functions } from '@/firebase';
import { httpsCallable } from 'firebase/functions';

export async function sendOtp(email: string, code: string) {
    try {
        const sendOtpFn = httpsCallable(functions, 'sendOtp');
        await sendOtpFn({ email, code });
        return { success: true };
    } catch (error) {
        console.error('Failed to send OTP:', error);
        return { success: false, error: 'Failed to send verification email' };
    }
}

export async function logNewUser(userData: { name: string; email: string; phone?: string }) {
    try {
        const logNewUserFn = httpsCallable(functions, 'logNewUser');
        await logNewUserFn(userData);
        return { success: true };
    } catch (error) {
        console.error('Failed in logNewUser:', error);
        // We return success true to not block the user flow even if logging fails
        return { success: true };
    }
}
