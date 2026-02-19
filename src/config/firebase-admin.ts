import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

const serviceAccountPath = [
    path.resolve(process.cwd(), 'firebase-service-account.json'),
    path.resolve(process.cwd(), 'src', 'config', 'firebase-service-account.json'),
    '/app/src/config/firebase-service-account.json', // Explicit Docker path
].find(p => fs.existsSync(p));

if (serviceAccountPath) {
    try {
        const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
        const serviceAccount = JSON.parse(fileContent);

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('✅ Firebase Admin initialized. Total apps:', admin.apps.length);
            console.log('📍 Source:', serviceAccountPath);
        }
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin:', error.message);
    }
} else {
    console.error('❌ Firebase service account file NOT FOUND.');
    console.warn('⚠️ Google Login will not be available.');
}

export const firebaseAdmin = admin;
export default admin;
