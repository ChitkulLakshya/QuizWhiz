// Use environment variable for the backend URL, default to local for dev
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper to detect Electron environment at runtime
const isElectron = () => {
    if (typeof window === 'undefined') return false;
    return /Electron/i.test(window.navigator.userAgent);
};

export async function sendOtp(email: string, code: string) {
    if (process.env.NEXT_PUBLIC_ELECTRON_BUILD === 'true' || isElectron()) {
        console.log('[Electron] Skipping server-side OTP email');
        return { success: true };
    }
    try {
        const response = await fetch(`${API_BASE_URL}/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to send OTP');
        }

        return { success: true, warning: data.warning };
    } catch (error) {
        console.error('Failed to send OTP:', error);
        return { success: false, error: 'Failed to send verification email' };
    }
}

export async function logNewUser(userData: { name: string; email: string; phone?: string }) {
    if (process.env.NEXT_PUBLIC_ELECTRON_BUILD === 'true' || isElectron()) {
        console.log('[Electron] Skipping server-side user logging');
        return { success: true };
    }
    try {
        const response = await fetch(`${API_BASE_URL}/log-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            console.warn('Logging failed:', data.error);
        }

        return { success: true };
    } catch (error) {
        console.error('Failed in logNewUser:', error);
        // We return success true to not block the user flow even if logging fails
        return { success: true };
    }
}

export async function sendWelcomeEmailAction(email: string, name: string) {
    if (process.env.NEXT_PUBLIC_ELECTRON_BUILD === 'true' || isElectron()) return;
    try {
        await fetch(`${API_BASE_URL}/send-welcome`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name }),
        });
    } catch (error) {
        console.error('Failed to send welcome email:', error);
    }
}

