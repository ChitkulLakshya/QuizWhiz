import { functions } from '@/firebase';
import { httpsCallable } from 'firebase/functions';

export async function sendWelcomeEmailAction(email: string, name?: string) {
  try {
    console.log(`📧 Calling sendWelcomeEmail Cloud Function for ${email}`);
    const sendWelcomeEmailFn = httpsCallable(functions, 'sendWelcomeEmail');
    await sendWelcomeEmailFn({ email, name });
    return { success: true };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: 'Failed to send welcome email' };
  }
}

export async function sendOtpEmailAction(email: string, code: string) {
  try {
    console.log(`📧 Calling sendOtp Cloud Function for ${email}`);
    // Reusing the sendOtp function we defined earlier which expects { email, code }
    const sendOtpFn = httpsCallable(functions, 'sendOtp');
    await sendOtpFn({ email, code });
    return { success: true };
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return { success: false, error: 'Failed to send OTP email' };
  }
}
