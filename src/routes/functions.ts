export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function camelCaseToSpaced(camel: string): string {
    return camel.replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
        .replace(/^./, str => str.toUpperCase());
}

export function spacedToHyphened(input: string): string {
    return input.toLowerCase().replace(/\s+/g, '-');
}

export function capitalizeWords(str: string) {
    return str.split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

export function shortenString(text: string): string {
    // Remove HTML tags from the text
    const cleanedText = text.replace(/(<([^>]+)>)/gi, ' ');

    const words = cleanedText.split(' ');
    const shortenedWords = words.slice(0, 30);
    const shortenedText = shortenedWords.join(' ');

    if (words.length > shortenedWords.length) {
        return shortenedText + '...';
    }

    return shortenedText;
}

let previousPhone = ''
export function phoneFormat(field: HTMLInputElement) {
    const specialCharCount = (field.value.match(/\D/g) || []).length;
    let cursorPosition = field.selectionStart;

    let input = field.value.replace(/\D/g, '');
    const size = input.length;
    if (input.substring(0, 1) === '1') {
        if (size === 0) { input = `` }
        else if (size < 2) { input = `+${input} ` }
        else if (size < 4) { input = `+${input.substring(0, 1)} (${input.substring(1)}` }
        else if (size < 8) { input = `+${input.substring(0, 1)} (${input.substring(1, 4)}) ${input.substring(4)}` }
        else if (size < 12) { input = `+${input.substring(0, 1)} (${input.substring(1, 4)}) ${input.substring(4, 7)}-${input.substring(7, 11)}` }
    } else {
        if (size > 7 && size < 11) { input = `(${input.substring(0, 3)}) ${input.substring(3, 6)}-${input.substring(6)}` }
        else if (size > 3 && size < 8) { input = `${input.substring(0, 3)}-${input.substring(3)}` }
    }

    if (input !== previousPhone) {
        previousPhone = input
        const specialCharDiff = (input.match(/\D/g) || []).length - specialCharCount;
        if (cursorPosition) cursorPosition += specialCharDiff;

        field.value = input
        field.selectionStart = cursorPosition;
        field.selectionEnd = cursorPosition;
    }
}

export function convertDataUrlToUrl(dataUrl: string): string {
    const byteString = window.atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeString });

    return URL.createObjectURL(blob);
}

export function autoResizeTextarea(element: HTMLTextAreaElement): void {
    const minHeight = element.offsetHeight;

    const paddingTop = parseInt(window.getComputedStyle(element, null).getPropertyValue("padding-top"));
    const paddingRight = parseInt(window.getComputedStyle(element, null).getPropertyValue("padding-right"));
    const paddingBottom = parseInt(window.getComputedStyle(element, null).getPropertyValue("padding-bottom"));
    const paddingLeft = parseInt(window.getComputedStyle(element, null).getPropertyValue("padding-left"));
    const border = parseInt(window.getComputedStyle(element, null).getPropertyValue("border"));

    const resize = () => {
        const oldHeight = element.style.height;
        element.style.height = "auto";
        const newHeight = element.scrollHeight - border;
        element.style.height = Math.max(minHeight, newHeight) + "px";
        if (oldHeight !== element.style.height) {
            resize();
        }
    };

    element.addEventListener("input", resize);
    element.addEventListener("focus", resize);
    element.addEventListener("blur", resize);
    window.addEventListener("resize", resize);

    element.style.overflow = "hidden";
    element.style.boxSizing = "border-box";
    element.style.padding = `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`;

    resize();
}

export function throttle(func: () => void, limit: number): () => void {
    let lastCallTime = 0;
    return function () {
        const now = Date.now();
        if (now - lastCallTime >= limit) {
            func();
            lastCallTime = now;
        }
    }
}

export function letterToAvatarUrl(letter: string): string {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = 100;
    canvas.height = 100;

    if (!context) {
        return ''
    }

    context.fillStyle = '#D44508';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = 'bold 50px Outfit';
    context.fillStyle = '#F7F7FF';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(letter.toUpperCase(), canvas.width / 2, canvas.height / 2);

    const imageDataUrl = canvas.toDataURL();

    return imageDataUrl;

}

export function isGeneratedAvatarUrl(url: string): boolean {
    const prefix = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA';
    return url.startsWith(prefix);
}

export function isGeneratedBlobUrl(url: string): boolean {
    const prefix = 'blob:';
    return url.startsWith(prefix);
}

export function escapeHTML(input: string): string {
    const entityMap: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    return input.replace(/[&<>"'`=\/]/g, (s) => entityMap[s]);
}

import toast from "svelte-french-toast";
import type { Action } from "svelte/action";

interface Attributes {
    "on:outside"?: (event: CustomEvent) => void
}

type ClickOutside = Action<HTMLElement, any, Attributes>

export const clickOutside: ClickOutside = (element) => {
    function handleClick(event: MouseEvent) {
        const targetElement = event.target as HTMLElement;

        if (element && !element.contains(targetElement)) {
            const clickOutsideEvent = new CustomEvent('outside');
            element.dispatchEvent(clickOutsideEvent);
        }
    }

    document.addEventListener("click", handleClick, true);

    return {
        destroy() {
            document.removeEventListener("click", handleClick, true);
        }
    }
}

export const clickOutsideOrChild: ClickOutside = (element) => {
    function handleClick(event: MouseEvent) {
        const targetElement = event.target as HTMLElement;

        if (element && element !== targetElement) {
            const clickOutsideEvent = new CustomEvent('outside');
            element.dispatchEvent(clickOutsideEvent);
        }
    }

    document.addEventListener("click", handleClick, true);

    return {
        destroy() {
            document.removeEventListener("click", handleClick, true);
        }
    }
}

export function handleSwipe(element: HTMLElement, onSwipeRight: () => void, onSwipeLeft: () => void) {
    let slidePixelRequirement = 50;
    let touchStartX = 0;

    element.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });

    element.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const deltaX = touchEndX - touchStartX;

        if (deltaX > slidePixelRequirement) {
            onSwipeRight();
        } else if (deltaX < -slidePixelRequirement) {
            onSwipeLeft();
        }
    });
}

import { dictionary } from "./stores"
import { get } from 'svelte/store';
let storedDictionary = get(dictionary)
export function anErrorOccurred(error: string = storedDictionary.anErrorHasOccurred) {
    toast.error(error, { position: 'bottom-center' });
}