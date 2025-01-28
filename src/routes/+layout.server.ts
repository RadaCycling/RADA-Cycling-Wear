import { db, storage } from "$lib/firebase/rada";
import { collection, getDocs, type DocumentData } from "firebase/firestore";
import type { LayoutServerLoad } from "./$types";
import { ref, getDownloadURL } from 'firebase/storage';
import type { Product } from "./mockDb";

// Fetch a collection from Firestore
async function fetchCollection(collectionName: string): Promise<DocumentData> {
    try {
        const snapshot = await getDocs(collection(db, collectionName));

        // If fetching products, resolve image URLs
        if (collectionName === 'products') {
            const products = snapshot.docs.map((doc) => doc.data() as Product);
            for (const product of products) {
                if (!product.dbImageSources) {
                    product.dbImageSources = product.imageSources;
                }
                product.imageSources = await Promise.all(product.dbImageSources.map(async (imageSource) => {
                    try {
                        const imageRef = ref(storage, `products/${imageSource}`);
                        return await getDownloadURL(imageRef);
                    } catch (e) {
                        console.error("Error on layout.server.ts fetching image source: ", (e as Error).message);
                        return imageSource;
                    }
                }));
                if (product.imageHoverSource) {
                    if (!product.dbImageHoverSource) {
                        product.dbImageHoverSource = product.imageHoverSource;
                    }
                    try {
                        const imageRef = ref(storage, `products/${product.dbImageHoverSource}`);
                        product.imageHoverSource = await getDownloadURL(imageRef);
                    } catch (e) {
                        console.error("Error on layout.server.ts fetching hover image source: ", (e as Error).message);
                    }
                }
            }
            return products;
        }

        return snapshot.docs.map((doc) => doc.data());
    } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
        return [];
    }
}

// Load data for the layout
export const load: LayoutServerLoad = async () => {
    const products = await fetchCollection('products');
    const categories = await fetchCollection('categories');
    const portfolio = await fetchCollection('portfolio');

    return {
        products,
        categories,
        portfolio,
    };
};