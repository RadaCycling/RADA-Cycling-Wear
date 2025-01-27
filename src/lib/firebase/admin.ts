import { GOOGLE_APPLICATION_CREDENTIALS } from '$env/static/private';
import admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(GOOGLE_APPLICATION_CREDENTIALS)),
    });
}

export const adminAuth = admin.auth();