import { derived, get, writable, type Writable } from 'svelte/store';
import { translator } from './translator';
import { browser } from "$app/environment";
import type { MenuItem, Order, Product, Category, PortfolioItem, Message } from './mockDb';
import { db } from '$lib/firebase/rada';
import { collection, doc, getDoc, setDoc, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export const activeSNavMenu: Writable<MenuItem[]> = writable();

// Database
export const dataReady: Writable<boolean> = writable(false);
export const user: Writable<User | null> = writable(null);
export const isAdmin: Writable<boolean> = writable(false);

export const allProductsStore: Writable<Product[]> = writable([]);
export const productsStore = derived(allProductsStore, ($allProductsStore) =>
    $allProductsStore.filter(product => product.status)
);
export const categoriesStore: Writable<Category[]> = writable([]);
export const portfolioStore: Writable<PortfolioItem[]> = writable([]);
export const ordersStore: Writable<Order[]> = writable([]);
export const messagesStore: Writable<Message[]> = writable([]);

user.subscribe(async (value) => {
    if (value) {
        const userDocumentReference = doc(db, 'user', value.uid);
        const docSnap = await getDoc(userDocumentReference);

        if (!docSnap.exists()) {
            const newUserData = {
                name: value.displayName || "",
                email: value.email || "",
                phone: "",
                address: "",
                city: "",
                state: "",
                zip: "",
                country: "",
            };

            await setDoc(userDocumentReference, newUserData, { merge: true });
        }

        const cartItemsSnapshot = await getDocs(collection(db, `user/${value.uid}/cartItems`));
        cartItems.set(cartItemsSnapshot.docs.map(doc => ({ id: doc.id, productId: doc.data().productId, quantity: doc.data().quantity, sizeId: doc.data().sizeId })));

        dataReady.set(true);
    }
});

export type CartItem = {
    id?: string;
    productId: string;
    quantity: number;
    sizeId: number;
};

export const cartItems: Writable<CartItem[]> = writable([]);
cartItems.subscribe(async (value) => {
    let uid = get(user)?.uid;
    if (uid && get(dataReady)) {
        const cartItemsCollection = collection(db, `user/${uid}/cartItems`);
        const existingDocs = await getDocs(cartItemsCollection);

        // Delete removed items
        const existingIds = existingDocs.docs.map(doc => doc.id);
        const newIds = value.map(item => item.id);
        const toDelete = existingIds.filter(id => !newIds.includes(id));
        for (const id of toDelete) {
            await deleteDoc(doc(cartItemsCollection, id));
        }

        // Add or update items
        for (const item of value) {
            if (item.id) {
                await setDoc(doc(cartItemsCollection, item.id), item, { merge: true });
            } else {
                const newDocRef = await addDoc(cartItemsCollection, item);
                item.id = newDocRef.id;
            }
        }
    }
});

// Base Routes
export const baseImageRoute = '/images';
export const baseRoute = '';

// Language Management
export type Language = 'en' | 'es';

export function isLanguage(value: any): value is Language {
    return (
        value === 'en' ||
        value === 'es'
    );
}

function setCookie(name: string, value: string, days: number) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);

    const cookieValue = encodeURIComponent(value) + "; expires=" + expirationDate.toUTCString() + "; path=/; SameSite=Lax";
    document.cookie = name + "=" + cookieValue;
}

function getCookie(name: string): string | null {
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (const cookie of cookieArray) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName.trim() === name) {
            return cookieValue;
        }
    }

    return null;
}

let navigatorLanguage;
let storedLanguage;
if (browser) {
    const languageCookie = getCookie('lang');
    if (isLanguage(languageCookie)) {
        storedLanguage = languageCookie;
    }

    const navigatorLanguageCode = navigator.language.split('-')[0].toLowerCase();
    if (isLanguage(navigatorLanguageCode)) {
        navigatorLanguage = navigatorLanguageCode;
    }
}

export const language: Writable<Language> = writable(storedLanguage || navigatorLanguage || 'en');

if (browser) {
    language.subscribe((value) => {
        document.documentElement.lang = value || 'en';
        setCookie('lang', value, 1000);
    });
}

export const dictionary = derived(language, (language) => translator[language]);

// Theme Management
export type Theme = 'dark' | 'light';

function isTheme(value: any) {
    return (
        value === 'dark' ||
        value === 'light'
    );
}

let storedTheme: Theme | undefined;
if (browser) {
    const themeCookie = getCookie('theme');
    if (isTheme(themeCookie)) {
        storedTheme = themeCookie as Theme;
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        storedTheme = 'dark';
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
        storedTheme = 'light';
    }
}

export const theme: Writable<Theme> = writable('dark');

if (browser) {
    window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', ({ matches }) => {
            if (matches) {
                theme.set('dark');
            } else {
                theme.set('light');
            }
        });

    theme.subscribe((value) => {
        document.documentElement.setAttribute("data-theme", value);
        setCookie('theme', value, 1000);
    });
}