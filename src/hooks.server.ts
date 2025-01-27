import { ADMIN_UID } from "$env/static/private";
import { auth } from "$lib/firebase/rada";
import type { Handle } from "@sveltejs/kit";
import { redirect } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
    let lang = event.cookies.get('lang');
    let theme = event.cookies.get('theme');

    const user = auth.currentUser;
    if (event.url.pathname.startsWith('/admin') && (!user || user.uid !== ADMIN_UID)) {
        throw redirect(302, '/my-account'); // Redirect to login if unauthenticated
    }

    return resolve(event, {
        transformPageChunk: ({ html }) => {
            return (
                html.replace('%lang%', lang || "en"),
                html.replace('%theme%', theme || "")
            )
        },
    });

}) satisfies Handle;