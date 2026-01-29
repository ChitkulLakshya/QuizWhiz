import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

const checkCredentials = async () => {
    console.log('🔍 Starting Google Credentials Check...\n');

    const keyFilePath = path.join(process.cwd(), 'google-credentials.json');
    console.log(`📂 Looking for file at: ${keyFilePath}`);

    if (!fs.existsSync(keyFilePath)) {
        console.error('❌ ERROR: google-credentials.json file not found in the root directory.');
        process.exit(1);
    }
    console.log('✅ File found.');

    let credentials;
    try {
        const fileContent = fs.readFileSync(keyFilePath, 'utf-8');
        credentials = JSON.parse(fileContent);
        console.log('✅ JSON parsed successfully.');
    } catch (e: any) {
        console.error('❌ ERROR: Failed to parse google-credentials.json:', e.message);
        process.exit(1);
    }

    if (!credentials.private_key) {
        console.error('❌ ERROR: private_key is missing from the JSON file.');
        process.exit(1);
    }

    console.log('\n🔑 Testing Private Key validity with crypto module...');
    try {
        crypto.createPrivateKey(credentials.private_key);
        console.log('✅ Private Key is VALID (crypto check passed).');
    } catch (e: any) {
        console.error('❌ ERROR: Private Key is INVALID:', e.message);
        console.log('💡 Tip: Ensure the key in the JSON file contains newlines (\\n) and matches exactly what was downloaded from Google.');
        process.exit(1);
    }

    console.log('\n🌐 Testing GoogleAuth initialization...');
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: keyFilePath,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        // Just getting the client to ensure it loads the key correctly
        await auth.getClient();
        console.log('✅ GoogleAuth initialized successfully.');
    } catch (e: any) {
        console.error('❌ ERROR: GoogleAuth initialization failed:', e.message);
        process.exit(1);
    }

    console.log('\n🎉 ALL CHECKS PASSED. File-based authentication should work!');
};

checkCredentials();