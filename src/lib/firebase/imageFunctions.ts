import { ref, uploadBytes, deleteObject, getDownloadURL } from "firebase/storage";
import { storage } from "./rada";
import { letterToAvatarUrl } from "../../routes/functions";

export async function syncImageStorage(imagesAddedLocally: File[], imagesDeletedLocally: string[], path: string): Promise<void> {
    try {
        [imagesAddedLocally, imagesDeletedLocally] = syncImageLists(
            imagesAddedLocally,
            imagesDeletedLocally,
        );
        for (let i = 0; i < imagesDeletedLocally.length; i++) {
            const element = imagesDeletedLocally[i];
            await deleteImageFromStorage(element, path);
        }
        for (let i = 0; i < imagesAddedLocally.length; i++) {
            const element = imagesAddedLocally[i];
            await addImageToStorage(element, path);
        }
    } catch (error) {
        console.error(error);
    }
}

export async function addImageToStorage(imageFile: File, path: string): Promise<void> {
    try {
        const imageRef = ref(storage, `${path}/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
    } catch (error) {
        console.error(error);
    }
}

export async function deleteImageFromStorage(imageSource: string, path: string): Promise<void> {
    try {
        const imageRef = ref(storage, `${path}/${imageSource}`);
        await deleteObject(imageRef);
    } catch (error) {
        console.error(error);
    }
}

export async function getImageFromStorage(imageSource: string, path: string): Promise<string> {
    try {
        const imageRef = ref(storage, `${path}/${imageSource}`);
        return await getDownloadURL(imageRef);
    } catch (error) {
        console.error((error as Error).message);
        try {
            return letterToAvatarUrl('...');
        } catch (error) {
            return '';
        }
    }
}

export function syncImageLists(imagesAddedLocally: File[], imagesDeletedLocally: string[]): [File[], string[]] {
    const deleteCount: Record<string, number> = {};
    const addCount: Record<string, number> = {};

    // Count occurrences in imagesDeletedLocally
    for (const name of imagesDeletedLocally) {
        deleteCount[name] = (deleteCount[name] || 0) + 1;
    }

    // Count occurrences in imagesAddedLocally (store original File objects)
    const originalFiles: Record<string, File> = {};
    for (const file of imagesAddedLocally) {
        addCount[file.name] = (addCount[file.name] || 0) + 1;
        if (!originalFiles[file.name]) {
            originalFiles[file.name] = file;
        }
    }

    // Adjust counts: Remove common elements
    for (const name in deleteCount) {
        if (addCount[name]) {
            const minCount = Math.min(deleteCount[name], addCount[name]);
            deleteCount[name] -= minCount;
            addCount[name] -= minCount;
        }
    }

    // Reconstruct imagesDeletedLocally without duplicates
    imagesDeletedLocally.length = 0;
    for (const name in deleteCount) {
        if (deleteCount[name] > 0) {
            for (let i = 0; i < deleteCount[name]; i++) {
                imagesDeletedLocally.push(name);
            }
        }
    }

    // Reconstruct imagesAddedLocally using original File objects
    imagesAddedLocally.length = 0;
    for (const name in addCount) {
        if (addCount[name] > 0) {
            imagesAddedLocally.push(originalFiles[name]);
        }
    }

    return [imagesAddedLocally, imagesDeletedLocally];
}