import { derived, get, writable, type Writable } from 'svelte/store';
import { translator } from './translator';
import { browser } from "$app/environment";
import type { MenuItem } from './mockDb';
import { db } from '$lib/firebase/rada';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const activeSNavMenu: Writable<MenuItem[]> = writable();

// Database
export const dataReady: Writable<boolean> = writable(false)
export const userID: Writable<string> = writable("")
export const userEmail: Writable<string | null> = writable(null)

userID.subscribe(async (value) => {
    if (value) {
        let userData: any;
        const userDocumentReference = doc(db, 'user', value);
        const docSnap = await getDoc(userDocumentReference);

        if (!docSnap.exists()) {
            const newUserData = {
                cartItems: [],
                purchases: [],
            };

            await setDoc(userDocumentReference, newUserData, { merge: true });
            userData = newUserData;
        } else {
            userData = docSnap.data();
        }

        dataReady.set(true)

        cartItems.set(userData["cartItems"])
        purchases.set(userData["purchases"])
    }
})

export type CartItem = {
    productId: string,
    quantity: number,
    sizeId: number,
}
export const cartItems: Writable<CartItem[]> = writable([])
cartItems.subscribe(async (value) => {
    let uid = get(userID)
    if (uid) {
        const userDocumentReference = doc(db, 'user', uid);
        const docSnap = await getDoc(userDocumentReference);

        if (docSnap.exists()) {
            try {
                await setDoc(
                    userDocumentReference,
                    {
                        cartItems: value
                    },
                    { merge: true }
                )
            } catch (error) {
                console.error("Error while saving cart items: ", error);
            }
        }
    }
})


export type Purchase = {
    productId: number,
    arrivalDate: string,
}
export const purchases: Writable<Purchase[]> = writable([])
purchases.subscribe(async (value) => {
    let uid = get(userID)
    if (uid) {
        const userDocumentReference = doc(db, 'user', uid);
        const docSnap = await getDoc(userDocumentReference);

        if (docSnap.exists()) {
            try {
                await setDoc(
                    userDocumentReference,
                    {
                        purchases: value
                    },
                    { merge: true }
                )
            } catch (error) {
                console.error("Error while saving purchases data: ", error);
            }
        }
    }
})


// Base Routes
export const baseImageRoute = '/images/radacycling';
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
    const languageCookie = getCookie('lang')
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
    })
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
    const themeCookie = getCookie('theme')
    if (isTheme(themeCookie)) {
        storedTheme = themeCookie as Theme;
    }
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        storedTheme = 'dark';
    }
    else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
        storedTheme = 'light';
    }
}

export const theme: Writable<Theme> = writable('dark');

if (browser) {
    window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', ({ matches }) => {
            if (matches) {
                theme.set('dark')
            } else {
                theme.set('light')
            }
        })

    theme.subscribe((value) => {
        document.documentElement.setAttribute("data-theme", value);
        setCookie('theme', value, 1000);
    })
}