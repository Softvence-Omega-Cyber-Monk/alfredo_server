import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

const serviceAccountPath = path.resolve(
    process.cwd(),
    'src',
    'config',
    'firebase-service-account.json',
);

if (fs.existsSync(serviceAccountPath)) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const serviceAccount = require(serviceAccountPath);

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('Firebase Admin initialized successfully');
        }
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error.message);
    }
} else {
    console.warn('Firebase service account file not found at:', serviceAccountPath);
    console.warn('Google Login will not be available.');
}

export default admin;
