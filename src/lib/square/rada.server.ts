import { Client, Environment } from 'square';
import { SQUARE_ACCESS_TOKEN, SQUARE_ENV, SQUARE_LOCATION_ID, SQUARE_REDIRECT_URL } from "$env/static/private";
import crypto from 'crypto';

const squareClient = new Client({
    accessToken: SQUARE_ACCESS_TOKEN,
    environment: SQUARE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
});

export default squareClient;

// Create Payment Link
export const createPaymentLink = async (cartItems: Array<{ name: string, totalItemPrice: number, quantity: number }>) => {
    const { checkoutApi } = squareClient;

    try {
        // Create the Payment Link
        const response = await checkoutApi.createPaymentLink({
            idempotencyKey: crypto.randomUUID(),
            order: {
                locationId: SQUARE_LOCATION_ID as string,
                lineItems: cartItems.map((item) => {
                    return {
                        name: item.name,
                        basePriceMoney: {
                            amount: BigInt(Math.round(item.totalItemPrice * 100) / item.quantity), // Convert to bigint
                            currency: 'USD',
                        },
                        quantity: item.quantity.toString(),
                    }
                }),
            },
            checkoutOptions: {
                askForShippingAddress: true,
                redirectUrl: SQUARE_REDIRECT_URL as string, // Redirect after successful payment
            },
        });

        if (!response.result.paymentLink) {
            throw new Error('Failed to create payment link.');
        }

        return response.result.paymentLink.url; // Return the payment link URL
    } catch (error) {
        console.error('Square API Error:', error);
        throw new Error('Error creating payment link');
    }
};