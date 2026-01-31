// Client-Side Stub for Auth-Actions

export async function sendOtp(email: string, code: string) {
    console.log(' [Client Mock] OTP Verification sent to:', email, 'Code:', code);
    return { success: true };
}

export async function logNewUser(userData: { name: string; email: string; phone?: string }) {
    console.log(' [Client Mock] User logging skipped in static mode:', userData);
    return { success: true };
}
