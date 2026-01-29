'use server';

import { sendVerificationEmail, sendAdminNotification } from '@/utils/emailSender';
import { logUserToSheet } from '@/utils/sheetLogger';

export async function sendOtp(email: string, code: string) {
    try {
        await sendVerificationEmail(email, code);
        return { success: true };
    } catch (error) {
        console.error('Failed to send OTP:', error);
        return { success: false, error: 'Failed to send verification email' };
    }
}

export async function logNewUser(userData: { name: string; email: string; phone?: string }) {
    try {
        const date = new Date().toISOString();
        const dataToLog = {
            name: userData.name,
            email: userData.email,
            phone: userData.phone || 'N/A',
            date: date
        };

        // run both in parallel and handle errors independently
        console.log("▶️ Calling logUserToSheet...");
        const results = await Promise.allSettled([
            logUserToSheet(dataToLog),
            sendAdminNotification({
                name: userData.name,
                email: userData.email,
                date: date
            })
        ]);

        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                const action = index === 0 ? 'Sheet Logging' : 'Admin Email';
                console.error(`❌ ${action} Failed:`, result.reason);
            }
        });

        // Return success if at least one succeeded, or just true since the user is created
        return { success: true };
    } catch (error) {
        console.error('Failed in logNewUser (General):', error);
        return { success: false, error: 'Failed to process user logging' };
    }
}
