'use server';

import { emailService } from '@/lib/email/service';

export async function sendWelcomeEmailAction(email: string, name?: string) {
  try {
    console.log(`📧 Sending welcome email to ${email}`);
    await emailService.sendWelcome(email, name);
    return { success: true };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: 'Failed to send welcome email' };
  }
}

export async function sendOtpEmailAction(email: string, code: string) {
  try {
    console.log(`📧 Sending OTP email to ${email}`);
    await emailService.sendOtp(email, code);
    return { success: true };
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return { success: false, error: 'Failed to send OTP email' };
  }
}
