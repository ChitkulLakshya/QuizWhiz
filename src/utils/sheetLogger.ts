import { google } from 'googleapis';

import path from 'path';

export const logUserToSheet = async (userData: any) => {
    console.log(`📢 TRIGGERED: logUserToSheet called for ${userData.email}`);
    try {
        const keyFilePath = path.join(process.cwd(), 'google-credentials.json');
        console.log(`📂 Key file path resolved to: ${keyFilePath}`);

        const auth = new google.auth.GoogleAuth({
            keyFile: keyFilePath,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        console.log("🔐 Auth successful, appending...");

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
        console.log('✅ SUCCESS: Row added. Status:', response.status);

    } catch (error) {
        console.error('❌ ERROR: Sheet Logging Failed:', error);
        // Don't throw error here, so the user login doesn't crash if sheets fail
    }
};
