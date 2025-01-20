import { auth } from "$lib/firebase/rada";
import { linkWithCredential, signInAnonymously, EmailAuthProvider, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { anErrorOccurred } from "./functions";
import { goto } from "$app/navigation";
import { baseRoute, userEmail, userID } from "./stores";

async function upgradeAnonymousUser(credential: any) {
    if (auth.currentUser) {
        await linkWithCredential(auth.currentUser, credential)
            .then((usercred) => {
                const user = usercred.user;
                userID.set(user.uid);
                userEmail.set(user.email);

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