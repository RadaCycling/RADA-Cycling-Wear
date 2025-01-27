import { json, type RequestHandler } from '@sveltejs/kit';
import { adminAuth } from '$lib/firebase/admin';
import { db } from '$lib/firebase/rada';
import { collection, getDocs, query, where, type DocumentData } from 'firebase/firestore';
import { ADMIN_UID } from '$env/static/private';

async function fetchCollection(collectionName: string, userId?: string) {
    try {
        let q;
        if (userId) {
            q = query(collection(db, collectionName), where("userId", "==", userId));
        } else {
            q = collection(db, collectionName);
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => doc.data());
    } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
        return [];
    }
}

export const GET: RequestHandler = async ({ request }) => {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    let currentUser;
    let isAdmin = false;

    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        currentUser = decodedToken;
        isAdmin = currentUser.uid === ADMIN_UID;
    } catch (error) {
        console.error('Error verifying ID token:', error);
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    let orders: DocumentData = [];
    let messages: DocumentData = [];

    if (isAdmin) {
        orders = await fetchCollection('orders');
        messages = await fetchCollection('messages');
    } else {
        orders = await fetchCollection('orders', currentUser.uid);
    }

    return json({
        isAdmin,
        orders,
        messages,
    });
};