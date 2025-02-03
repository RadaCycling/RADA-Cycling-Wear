<script lang="ts">
	import { onMount } from 'svelte';
	import { doc, updateDoc, deleteDoc, setDoc, collection } from 'firebase/firestore';
	import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
	import { page } from '$app/stores';
	import { db, storage } from '$lib/firebase/rada';
	import { allProductsStore, baseRoute, language } from '../../../stores';
	import toast from 'svelte-french-toast';
	import { autoResizeTextarea } from '../../../functions';
	import type { Category } from '../../../mockDb';
	import { goto } from '$app/navigation';

	let form: HTMLFormElement;

	let category: Category | undefined;
	const newParameter = 'new';
	let isNew = false;

	const emptyCategory: Category = {
		id: 0,
		imageSrc: '',
		imageAlt: { en: '', es: '' },
		name: { en: '', es: '' },
		href: '',
	};

	let id: string = '';

	onMount(async () => {
		id = $page.params.id;
		isNew = id === newParameter;
		// category = isNew ? emptyCategory : $allCategoriesStore.find((p) => p.id === id);

		if (category) {
			// Set the form values
		} else if (!isNew) {
			toast.error('Invalid category ID');
			goto(baseRoute + '/admin/categories');
		}
	});
</script>
