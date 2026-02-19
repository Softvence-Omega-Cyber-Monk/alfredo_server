import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

const rootPath = path.resolve(process.cwd(), 'firebase-service-account.json');
const configPath = path.resolve(process.cwd(), 'src', 'config', 'firebase-service-account.json');

const serviceAccountPath = fs.existsSync(rootPath) ? rootPath : configPath;

if (fs.existsSync(serviceAccountPath)) {
    try {
        const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
        const serviceAccount = JSON.parse(fileContent);

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('Firebase Admin initialized successfully from:', serviceAccountPath);
        }
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error.message);
    }
} else {
    console.warn('Firebase service account file not found at:', serviceAccountPath);
    console.warn('Google Login will not be available.');
}

export default admin;
