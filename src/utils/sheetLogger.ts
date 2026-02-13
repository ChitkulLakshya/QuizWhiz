import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

export const logUserToSheet = async (userData: any) => {
    console.log(`📢 TRIGGERED: logUserToSheet called for ${userData.email}`);

    try {
        let auth;
        const base64creds = process.env.GOOGLE_CREDENTIALS_BASE64;
        const keyFilePath = path.join(process.cwd(), 'google-credentials.json');

        if (base64creds) {
            console.log("🔐 Detected GOOGLE_CREDENTIALS_BASE64 env var. Decoding...");
            const decoded = Buffer.from(base64creds, 'base64').toString('utf-8');
            const credentials = JSON.parse(decoded);

            auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
            console.log("✅ Credentials parsed from Environment Variable.");
        }
        else if (fs.existsSync(keyFilePath)) {
            console.log(`📂 Found local key file at: ${keyFilePath}`);
            auth = new google.auth.GoogleAuth({
                keyFile: keyFilePath,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
            console.log("✅ Using local credential file.");
        }
        else {
            throw new Error(`
                ❌ Authentication Failed: No credentials found.
                1. Check if GOOGLE_CREDENTIALS_BASE64 is set in environment.
                2. Check if google-credentials.json exists at ${keyFilePath}
            `);
        }

        const sheets = google.sheets({ version: 'v4', auth });
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

        console.log("📤 Sending data to Google Sheets...");
        const response = await sheets.spreadsheets.values.append(request);
        console.log('✅ SUCCESS: Row added. Status:', response.status);

    } catch (error) {
        console.error('❌ ERROR: Sheet Logging Failed:', error);
    }
};
