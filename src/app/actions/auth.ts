// Client-Side Stub for Auth Actions

export async function sendWelcomeEmailAction(email: string, name?: string) {
  console.log(' [Client Mock] Welcome email would be sent to:', email);
  return { success: true };
}

export async function sendOtpEmailAction(email: string, code: string) {
  console.log(' [Client Mock] OTP email would be sent to:', email, 'Code:', code);
  return { success: true };
}
