import { google } from 'googleapis';

export const logUserToSheet = async (userData: any) => {
    try {
        // --- KEY FIX START ---
        // 1. Get the key
        const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "";

        // 2. FORCE correct formatting
        // This turns "Line1\nLine2" into actual separate lines
        const privateKey = rawKey.replace(/\\n/g, '\n');
        // --- KEY FIX END ---

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Prepare the row data
        const request = {
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Sheet1!A:D', // Adjust "Sheet1" if your tab is named differently
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [
                        userData.name,
                        userData.email,
                        userData.phone || 'N/A', // Handle missing phone
                        new Date().toLocaleString()
                    ]
                ],
            },
        };

        const response = await sheets.spreadsheets.values.append(request);
        console.log('✅ User logged to sheet. Status:', response.status);

    } catch (error) {
        console.error('❌ Sheet Logging Failed:', error);
        // Don't throw error here, so the user login doesn't crash if sheets fail
    }
};
