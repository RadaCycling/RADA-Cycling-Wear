<script lang="ts">
	import { onMount } from 'svelte';
	import { convertMarkdown } from '../functions';

	export let content: string;
	let editor: HTMLDivElement;
	const markerId = 'cursor-marker';

	onMount(() => {
		editor.innerHTML = content;
	});

	// This function handles empty or nearly empty elements (like an empty list item)
	function removeEmptyTagsWithinEditor() {
		/**
		 * Recursively determines whether an element is “empty.”
		 * An element is considered empty if, after removing any zero–width spaces
		 * (used for the marker) and trimming whitespace, it contains no “real” text
		 * and no child element (other than a BR or the marker) that itself isn’t empty.
		 * Also, if any descendant is a BR, then hasBr will be set to true.
		 */
		function getElementStatus(el: Element): { isEmpty: boolean; hasBr: boolean } {
			let isEmpty = true;
			let hasBr = false;

			el.childNodes.forEach((child) => {
				if (child.nodeType === Node.TEXT_NODE) {
					const txt = child.textContent!.replace(/\u200B/g, '').trim();
					if (txt.length > 0) {
						isEmpty = false;
					}
				} else if (child.nodeType === Node.ELEMENT_NODE) {
					const childEl = child as Element;
					if (childEl.id === 'cursor-marker') {
					} else if (childEl.tagName === 'BR') {
						hasBr = true;
					} else {
						const childStatus = getElementStatus(childEl);
						if (!childStatus.isEmpty) {
							isEmpty = false;
						}
						if (childStatus.hasBr) {
							hasBr = true;
						}
					}
				}
			});

			return { isEmpty, hasBr };
		}

		/**
		 * Recursively traverses and cleans an element.
		 *
		 * @param el The element to process.
		 * @param isDirectChild True if this element is a direct child of the editor.
		 */
		function cleanup(el: Element, isDirectChild: boolean): void {
			// If this element is a BR, skip it – we treat BR as a void element.
			if (el.tagName === 'BR') {
				return;
			}

			// Process children first (post–order traversal).
			Array.from(el.children).forEach((child) => cleanup(child, false));

			// Do not process the editor container itself or the marker.
			if (el === editor) {
				return;
			}
			if (el.id === 'cursor-marker') {
				return;
			}

			const status = getElementStatus(el);

			// If the element contains any real text or non-BR elements, leave it intact.
			if (!status.isEmpty) {
				return;
			}

			const parent = el.parentNode;
			if (!parent) {
				return;
			}

			// Case 1: Element is empty and does NOT contain a <br>.
			if (!status.hasBr) {
				const marker = el.querySelector('#cursor-marker');
				if (marker) {
					parent.insertBefore(marker, el);
				}
				parent.removeChild(el);
				return;
			}

			// Case 2: The element is empty but contains a <br>.
			// If it's already a top-level DIV (direct child of the editor), we leave it intact.
			if (el.tagName === 'DIV' && isDirectChild) {
				return;
			}

			// Otherwise, we want to replace this element with a new DIV that contains the marker (if any) and a <BR>.
			const newDiv = document.createElement('div');

			const marker = el.querySelector('#cursor-marker');
			if (marker) {
				newDiv.appendChild(marker);
			}
			// Always append a new BR into the DIV.
			newDiv.appendChild(document.createElement('br'));

			// Special handling for LI elements inside UL/OL:
			if (
				el.tagName === 'LI' &&
				parent instanceof HTMLElement &&
				(parent.tagName === 'UL' || parent.tagName === 'OL')
			) {
				parent.removeChild(el);
				const grandparent = parent.parentNode;
				if (grandparent) {
					if (parent.nextSibling) {
						grandparent.insertBefore(newDiv, parent.nextSibling);
					} else {
						grandparent.appendChild(newDiv);
					}
				} else {
					parent.appendChild(newDiv);
				}
			} else {
				parent.replaceChild(newDiv, el);
			}
		}

		// Start by processing every direct child of the editor.
		Array.from(editor.children).forEach((child) => {
			cleanup(child, true);
		});
	}

	function updateContent() {
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;

		const range = selection.getRangeAt(0);

		// Create and insert a temporary marker element at the cursor position
		const markerEl = document.createElement('span');
		markerEl.id = markerId;
		// Make it invisible and as small as possible
		markerEl.style.opacity = '0';
		markerEl.style.position = 'absolute';
		markerEl.style.width = '1px';
		markerEl.style.height = '1px';
		// Optional: use a zero-width space so that it’s in the DOM
		markerEl.textContent = '\u200B';

		// Insert the marker into the range (this splits the text node if necessary)
		range.insertNode(markerEl);

		// Get current HTML (which now contains the marker) and convert it
		let htmlContent = editor.innerHTML;
		let transformedHTML = convertMarkdown(htmlContent);
		console.log('Before: ');
		console.log(transformedHTML);

		// Cleanup unwanted empty styling wrappers
		removeEmptyTagsWithinEditor();

		// Find the marker in the new DOM and restore the selection there.
		const newMarkerEl = editor.querySelector(`#${markerId}`);
		if (newMarkerEl) {
			const newRange = document.createRange();
			// Place the cursor immediately after the marker.
			newRange.setStartAfter(newMarkerEl);
			newRange.collapse(true);

			selection.removeAllRanges();
			selection.addRange(newRange);

			// Remove the marker element
			newMarkerEl.parentNode?.removeChild(newMarkerEl);
		}
	}
</script>

<div
	bind:this={editor}
	contenteditable="true"
	on:input={updateContent}
	role="textbox"
	tabindex="0"
/>

<style>
	div[contenteditable] {
		padding: 1rem;
		padding-bottom: 1.5rem;
		font-size: 1.1rem;
		line-height: 1.5;
	}
	div[contenteditable]:focus {
		border: none;
		outline: none;
	}
</style>
