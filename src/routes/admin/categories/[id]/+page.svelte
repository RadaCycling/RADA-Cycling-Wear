<script lang="ts">
	import { onMount } from 'svelte';
	import { doc, updateDoc, deleteDoc, setDoc, collection } from 'firebase/firestore';
	import { page } from '$app/stores';
	import { db } from '$lib/firebase/rada';
	import {
		categoriesStore,
		baseImageRoute,
		baseRoute,
		dictionary,
		language,
		dataReady,
	} from '../../../stores';
	import toast from 'svelte-french-toast';
	import { randomizeFileName } from '../../../functions';
	import type { Category } from '../../../mockDb';
	import { goto } from '$app/navigation';
	import Texteditor from '../../components/texteditor.svelte';
	import EditForm from '../../components/editForm.svelte';
	import FormParagraph from '../../components/formParagraph.svelte';
	import FormSection from '../../components/formSection.svelte';
	import InputGroup from '../../components/inputGroup.svelte';
	import FormInput from '../../components/formInput.svelte';
	import ImageInput from '../../components/imageInput.svelte';
	import BooleanInput from '../../components/booleanInput.svelte';
	import {
		deleteImageFromStorage,
		getImageFromStorage,
		syncImageStorage,
	} from '$lib/firebase/imageFunctions';

	let category: Category | undefined;
	const newCategoryParameter = 'new';
	let isNewCategory = false;
	const emptyCategory: Category = {
		id: '',
		name: { en: '', es: '' },
		description: { en: '', es: '' },
		imageSrc: '',
		dbImageSrc: '',
		imageAlt: { en: '', es: '' },
		href: '',
		genderSpecific: false,
		sizeAgnostic: false,
		smallImageSrc: '',
		dbSmallImageSrc: '',
	};

	let id: string = '';
	let imageFile: File | null = null;
	let smallImageFile: File | null = null;
	let imagesAddedLocally: File[] = [];
	let imagesDeletedLocally: string[] = [];

	function checkHREF() {
		if (!category) return;

		category.href = category.href.replace(/[^a-zA-Z0-9-]/g, '');
		if (category.href === '') {
			category.href = category.name.en
				.toLowerCase()
				.replaceAll(' ', '-')
				.replace(/[^a-zA-Z0-9-]/g, '');
		}
	}

	async function setImageUrlsFromStorage() {
		if (!category) return;

		// Set Image URL
		if (category.dbImageSrc) {
			category.imageSrc = await getImageFromStorage(category.dbImageSrc, 'categories');
		} else {
			category.dbImageSrc = '';
		}

		// Set Small Image URL
		if (category.dbSmallImageSrc) {
			category.smallImageSrc = await getImageFromStorage(
				category.dbSmallImageSrc,
				'categories',
			);
		} else {
			category.dbSmallImageSrc = '';
		}
	}

	async function handleImageUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && category) {
			imageFile = target.files[0];
			imageFile = randomizeFileName(imageFile);

			category.dbImageSrc = imageFile.name;
			category.imageSrc = URL.createObjectURL(imageFile);
			imagesAddedLocally.push(imageFile);
		}

		// Reset Input Element
		target.value = '';
	}

	async function handleSmallImageUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && category) {
			smallImageFile = target.files[0];
			smallImageFile = randomizeFileName(smallImageFile);

			category.dbSmallImageSrc = smallImageFile.name;
			category.smallImageSrc = URL.createObjectURL(smallImageFile);
			imagesAddedLocally.push(smallImageFile);
		}

		// Reset Input Element
		target.value = '';
	}

	// TODO: Only delete from firestore when the category is saved
	async function handleImageDelete() {
		if (!category || !category.dbImageSrc) return;

		imagesDeletedLocally.push(category.dbImageSrc);

		category.dbImageSrc = '';
		category.imageSrc = '';
	}

	async function handleSmallImageDelete() {
		if (!category || !category.dbSmallImageSrc) return;

		imagesDeletedLocally.push(category.dbSmallImageSrc);

		category.dbSmallImageSrc = '';
		category.smallImageSrc = '';
	}

	onMount(async () => {
		id = $page.params.id;
		isNewCategory = id === newCategoryParameter;
		category = isNewCategory
			? emptyCategory
			: structuredClone($categoriesStore.find((c) => c.id.toString() === id));

		if (category) {
			await setImageUrlsFromStorage();
		} else if (!isNewCategory) {
			toast.error($dictionary.invalidCategoryId);
			goto(baseRoute + '/admin/categories');
		}
	});

	async function saveCategory() {
		// Validate the category
		if (!category) {
			toast.error($dictionary.categoryNotFound);
			return;
		} else if (!category.name.en || !category.name.es || !category.href) {
			toast.error($dictionary.pleaseFillInAllRequiredFields);
			return;
		}
		$dataReady = false;

		// Update Images
		await syncImageStorage(imagesAddedLocally, imagesDeletedLocally, 'categories');
		await setImageUrlsFromStorage();

		// Save the category
		if (id === newCategoryParameter) {
			// Modify category to include new id
			const newDocRef = doc(collection(db, 'categories'));
			category.id = newDocRef.id;

			// Update Category in Database
			await setDoc(newDocRef, category);

			// Update Category Locally
			categoriesStore.update((categories) => {
				if (!category) return categories;
				return [...categories, category];
			});

			toast.success($dictionary.newCategoryCreatedSuccessfully);
		} else {
			// Update Category in Database
			const docRef = doc(db, 'categories', id);
			await updateDoc(docRef, category);

			// Update Category Locally
			categoriesStore.update((categories) => {
				const index = categories.findIndex((c) => c.id.toString() === id);
				if (index !== -1 && category) {
					categories[index] = category;
				}
				return categories;
			});

			toast.success($dictionary.changesSavedSuccessfully);
		}

		$dataReady = true;
		goto(baseRoute + '/admin/categories');
	}

	async function deleteCategory() {
		// Delete Category from Firestore
		try {
			const docRef = doc(db, 'categories', id);
			await deleteDoc(docRef);

			categoriesStore.update((categories) =>
				categories.filter((c) => c.id.toString() !== id),
			);

			toast.success($dictionary.categoryDeletedSuccessfully);
		} catch (error) {
			toast.error($dictionary.categoryCouldNotBeDeleted);
		}

		// Delete Category's Image from Storage
		try {
			if (category) {
				if (category.dbImageSrc) {
					await deleteImageFromStorage(category.dbImageSrc, 'categories');
				}
				if (category.dbSmallImageSrc) {
					await deleteImageFromStorage(category.dbSmallImageSrc, 'categories');
				}
			}
		} catch (error) {
			toast($dictionary.warningCategoryImageCouldNotBeDeleted);
		}

		goto(baseRoute + '/admin/categories');
	}
</script>

<svelte:head>
	<title
		>{isNewCategory ? $dictionary.createCategory : $dictionary.editCategory} -
		{category?.name[$language] || $dictionary.unnamedCategory}</title
	>
</svelte:head>

{#if category}
	<EditForm
		object={category}
		saveFunction={saveCategory}
		deleteFunction={deleteCategory}
		staticText={{
			createTitle: $dictionary.createCategory,
			editTitle: $dictionary.editCategory,
			unnamedSubtitle: $dictionary.unnamedCategory,
			createButton: $dictionary.createNewCategory,
			saveButton: $dictionary.saveChanges,
			deleteButton: $dictionary.deleteCategory,
			deleteDialogTitle: `${$dictionary.openQuestionMark}${$dictionary.delete} ${category.name[$language]}?`,
			deleteDialogDescription: `${$dictionary.areYouSureThatYouWantToDeleteTheCategoryCalled} ${category.name[$language]}?`,
			deleteDialogConfirmButton: $dictionary.confirm,
		}}
		backLink="{baseRoute}/admin/categories"
		isNew={isNewCategory}
	>
		<!-- GENERAL INFORMATION -->
		<FormSection title={$dictionary.generalInformation}>
			<FormParagraph content={$dictionary.provideBasicDetailsCategory} />
			<InputGroup
				label={`${$dictionary.name} (${$dictionary.english})`}
				focusElementID="name-en"
				image={`${baseImageRoute}/usFlag.webp`}
			>
				<FormInput
					bind:value={category.name.en}
					required
					id="name-en"
					changeCallback={checkHREF}
				/>
			</InputGroup>
			<InputGroup
				label={`${$dictionary.name} (${$dictionary.spanish})`}
				focusElementID="name-es"
				image={`${baseImageRoute}/spainFlag.webp`}
			>
				<FormInput bind:value={category.name.es} required id="name-es" />
			</InputGroup>
			<InputGroup
				label={`${$dictionary.description} (${$dictionary.english})`}
				image={`${baseImageRoute}/usFlag.webp`}
			>
				<Texteditor bind:content={category.description.en} />
			</InputGroup>
			<InputGroup
				label={`${$dictionary.description} (${$dictionary.spanish})`}
				image={`${baseImageRoute}/spainFlag.webp`}
			>
				<Texteditor bind:content={category.description.es} />
			</InputGroup>

			<FormParagraph content={$dictionary.enterUniqueLinkCategory} />
			<InputGroup label={`${$dictionary.categoryUrl}`} focusElementID="href">
				<FormInput
					bind:value={category.href}
					required
					id="href"
					changeCallback={checkHREF}
				/>
			</InputGroup>
		</FormSection>

		<!-- IMAGES -->
		<FormSection title={$dictionary.images}>
			<FormParagraph content={$dictionary.uploadCategoryImage} />
			<InputGroup label={$dictionary.image}>
				<ImageInput
					bind:webSources={category.imageSrc}
					bind:originalSources={category.dbImageSrc}
					deleteCallback={handleImageDelete}
					uploadCallback={handleImageUpload}
				/>
			</InputGroup>
			<FormParagraph content={$dictionary.uploadCategorySmallImage} />
			<InputGroup label="{$dictionary.smallImage} ({$dictionary.optional})">
				<ImageInput
					bind:webSources={category.smallImageSrc}
					bind:originalSources={category.dbSmallImageSrc}
					deleteCallback={handleSmallImageDelete}
					uploadCallback={handleSmallImageUpload}
				/>
			</InputGroup>
		</FormSection>

		<!-- ADDITIONAL SETTINGS -->
		<FormSection title={$dictionary.additionalSettings}>
			<FormParagraph content={$dictionary.genderFilteringDescription} />
			<InputGroup label={$dictionary.genderSpecific}>
				<BooleanInput
					bind:value={category.genderSpecific}
					descriptionBefore={`"${category.name[$language] || '...'}"`}
					descriptionDynamic={{
						on: $dictionary.doesNotHave,
						off: $dictionary.has,
					}}
					descriptionAfter={$dictionary.genderFiltering}
				/>
			</InputGroup>
			<FormParagraph content={$dictionary.sizeFilteringDescription} />
			<InputGroup label={$dictionary.singleSize}>
				<BooleanInput
					bind:value={category.sizeAgnostic}
					descriptionBefore={`"${category.name[$language] || '...'}"`}
					descriptionDynamic={{
						on: $dictionary.doesNotHave,
						off: $dictionary.has,
					}}
					descriptionAfter={$dictionary.sizeFiltering}
				/>
			</InputGroup>
		</FormSection>
	</EditForm>
{/if}
