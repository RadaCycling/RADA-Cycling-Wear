import { db } from "$lib/firebase/rada";
import { collection, doc, getDocs, setDoc, type DocumentData } from "firebase/firestore";
import type { LayoutServerLoad } from "./$types";
import { type Product, type Category, type PortfolioItem } from "./mockDb";
import { getImageFromStorage } from "$lib/firebase/imageFunctions";

// Fetch a collection from Firestore
async function fetchCollection(collectionName: string): Promise<DocumentData> {
    try {
        const snapshot = await getDocs(collection(db, collectionName));

        // Resolve image URLs
        if (collectionName === 'products') {
            const products = snapshot.docs.map((doc) => doc.data() as Product);
            for (const product of products) {
                product.dbImageSources ||= product.imageSources;
                product.imageSources = await Promise.all(product.dbImageSources.map(async (imageSource) => {
                    return await getImageFromStorage(imageSource, 'products');
                }));
                if (product.imageHoverSource) {
                    product.dbImageHoverSource ||= product.imageHoverSource;
                    product.imageHoverSource = await getImageFromStorage(product.dbImageHoverSource, 'products');
                }
            }
            return products;
        }
        else if (collectionName === 'categories') {
            const categories = snapshot.docs.map((doc) => doc.data() as Category);
            for (const category of categories) {
                // Assign main image
                if (category.imageSrc) {
                    category.dbImageSrc ||= category.imageSrc;
                    category.imageSrc = await getImageFromStorage(category.dbImageSrc, 'categories');
                }
                // Assign small image
                if (category.smallImageSrc) {
                    category.dbSmallImageSrc ||= category.smallImageSrc;
                    category.smallImageSrc = await getImageFromStorage(category.dbSmallImageSrc, 'categories');
                }
            }
            return categories;
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

async function uploadMockDbObjectToFirestore(object: any, collectionName: string) {
    try {
        const colRef = collection(db, collectionName);
        for (const element of object) {
            const docRef = doc(colRef, element.id.toString());
            await setDoc(docRef, element);
        }
        console.log("Elements uploaded successfully");
    } catch (error) {
        console.error("Error uploading elements:", error);
    }
}