import * as crypto from 'crypto';

export const generateUniqueSessionId = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buffer) => {
            if (err) {
                return reject(err);
            }
            resolve(buffer.toString('hex'));
        });
    });
};