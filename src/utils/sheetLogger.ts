import { google } from 'googleapis';

/**
 * Logs user data to a Google Sheet using Service Account.
 * Requires GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.
 */
export const logUserToSheet = async (userData: any) => {
    console.log(`📢 TRIGGERED: logUserToSheet called for ${userData.email}`);

    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!clientEmail || !privateKeyRaw) {
        console.warn('⚠️ Missing Service Account credentials. Skipping sheet logging.');
        return;
    }

    if (!sheetId) {
        console.warn('⚠️ Missing GOOGLE_SHEET_ID. Skipping sheet logging.');
        return;
    }

    try {
        const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
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
