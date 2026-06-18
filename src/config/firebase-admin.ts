import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

const serviceAccountPath = [
    path.resolve(process.cwd(), 'firebase-service-account.json'),
    path.resolve(process.cwd(), 'src', 'config', 'firebase-service-account.json'),
    '/app/src/config/firebase-service-account.json', // Explicit Docker path
].find(p => {
    try {
        return fs.existsSync(p) && fs.statSync(p).isFile();
    } catch {
        return false;
    }
});

if (serviceAccountPath) {
    try {
        const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
        const serviceAccount = JSON.parse(fileContent);

        if (!admin.apps.length) {
            // REPAIR STEP: Fix common PEM formatting issues (missing newlines, double escaping)
            if (serviceAccount.private_key) {
                // Ensure \n are actual newlines and not literal "\n" strings if double-escaped
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('✅ Firebase Admin initialized. Total apps:', admin.apps.length);
            console.log('📍 Source:', serviceAccountPath);
            console.log('🔑 Key Length:', serviceAccount.private_key?.length);
        }
    } catch (error) {
        const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
        try {
            const json = JSON.parse(fileContent);
            console.error('❌ Failed to initialize Firebase Admin:', error.message);
            console.log('💡 Debug - Key Type:', typeof json.private_key);
            console.log('💡 Debug - First 20 chars:', json.private_key?.substring(0, 25));
            console.log('💡 Debug - Last 20 chars:', json.private_key?.substring(json.private_key?.length - 25));
        } catch (e) {
            console.error('❌ CRITICAL: The service account file is not valid JSON!');
        }
    }
} else {
    console.error('❌ Firebase service account file NOT FOUND.');
    console.warn('⚠️ Google Login will not be available.');
}

export const firebaseAdmin = admin;
export default admin;
