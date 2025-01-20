import { createPaymentLink } from '$lib/square/rada.server';
import { redirect } from '@sveltejs/kit';

export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const cartItems = JSON.parse(formData.get('cartItems') as string);

        // Create the payment link
        const checkoutUrl = await createPaymentLink(cartItems);

        if (checkoutUrl) {
            // Correctly return the redirect
            throw redirect(303, checkoutUrl);
        } else {
            // Handle the error case properly
            return {
                status: 500,
                body: { error: 'Failed to create checkout link' },
            };
        }
    },
};