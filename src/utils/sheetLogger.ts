import { google } from 'googleapis';

/**
 * Logs user data to a Google Sheet using OAuth2 refresh token.
 * Uses the same OAuth2 credentials as Gmail (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN).
 * No service account key file or GOOGLE_CREDENTIALS_BASE64 needed.
 */
export const logUserToSheet = async (userData: any) => {
    console.log(`📢 TRIGGERED: logUserToSheet called for ${userData.email}`);

    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!clientId || !clientSecret || !refreshToken) {
        console.warn('⚠️ Missing OAuth2 credentials. Skipping sheet logging.');
        return;
    }

    if (!sheetId) {
        console.warn('⚠️ Missing GOOGLE_SHEET_ID. Skipping sheet logging.');
        return;
    }

    try {
        const oAuth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            'https://developers.google.com/oauthplayground'
        );
        oAuth2Client.setCredentials({ refresh_token: refreshToken });

        const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
        const request = {
            spreadsheetId: sheetId,
            range: 'Sheet1!A:D',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [
                        userData.name,
                        userData.email,
                        userData.phone || 'N/A',
                        new Date().toLocaleString()
                    ]
                ],
            },
        };

        console.log("📤 Sending data to Google Sheets...");
        const response = await sheets.spreadsheets.values.append(request);
        console.log('✅ SUCCESS: Row added. Status:', response.status);

    } catch (error) {
        console.error('❌ ERROR: Sheet Logging Failed:', error);
    }
};
