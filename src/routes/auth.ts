import { auth } from "$lib/firebase/rada";
import { linkWithCredential, signInAnonymously, EmailAuthProvider, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { anErrorOccurred } from "./functions";
import { goto } from "$app/navigation";
import { baseRoute, user as UserStore } from "./stores";
import { doc, setDoc } from "firebase/firestore";
import { db } from "$lib/firebase/rada";

async function upgradeAnonymousUser(credential: any) {
    if (auth.currentUser) {
        await linkWithCredential(auth.currentUser, credential)
            .then(async (usercred) => {
                const user = usercred.user;
                const userDocRef = doc(db, 'user', user.uid);
                await setDoc(userDocRef, { email: user.email }, { merge: true });
                UserStore.set(user);

                goto(`${baseRoute}/my-account`);
            })
            .catch((error) => {
                anErrorOccurred(error.message.replace("Firebase: ", ""))
            });
    } else {
        anErrorOccurred()
        console.error("auth.currentUser is null.");
    }
}

export const authHandlers = {
    signInAnonymously: async () => {
        await signInAnonymously(auth)
            .catch((error): any => {
                anErrorOccurred(error.message.replace("Firebase: ", ""))
            })
    },
    signin: async (email: string, password: string) => {
        const credential = EmailAuthProvider.credential(email, password);
        await upgradeAnonymousUser(credential)
    },
    login: async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password)
            .catch((error) => {
                anErrorOccurred(error.message.replace("Firebase: ", ""))
            })
    },
    logout: async () => {
        await signOut(auth)
            .catch((error) => {
                anErrorOccurred(error.message.replace("Firebase: ", ""))
            })
    }
}