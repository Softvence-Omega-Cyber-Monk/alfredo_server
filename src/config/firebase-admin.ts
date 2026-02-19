import * as admin from 'firebase-admin';
import * as path from 'path';

const serviceAccountPath = path.resolve(
    process.cwd(),
    'src',
    'config',
    'firebase-service-account.json',
);

// eslint-disable-next-line @typescript-eslint/no-require-imports
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export default admin;
