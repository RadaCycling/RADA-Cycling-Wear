<script lang="ts">
	import { onMount } from 'svelte';
	import { doc, updateDoc, deleteDoc, setDoc, collection } from 'firebase/firestore';
	import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
	import { page } from '$app/stores';
	import { db, storage } from '$lib/firebase/rada';
	import {
		allProductsStore,
		baseImageRoute,
		baseRoute,
		dataReady,
		dictionary,
		language,
	} from '../../../stores';
	import toast from 'svelte-french-toast';
	import { randomizeFileName } from '../../../functions';
	import {
		denormalizeCategories,
		sizeCategoryIds,
		sizeOptions,
		type Category,
		type Product,
		type UnitsInStock,
		categories as categoriesStore,
		findProductsByIds,
	} from '../../../mockDb';
	import { goto } from '$app/navigation';
	import Texteditor from '../../components/texteditor.svelte';
	import ArrayPicker from '../../components/arrayPicker.svelte';
	import EditForm from '../../components/editForm.svelte';
	import FormParagraph from '../../components/formParagraph.svelte';
	import FormSection from '../../components/formSection.svelte';
	import InputGroup from '../../components/inputGroup.svelte';
	import BooleanInput from '../../components/booleanInput.svelte';
	import FormInput from '../../components/formInput.svelte';
	import ImageInput from '../../components/imageInput.svelte';
	import TableInput from '../../components/tableInput.svelte';

	let product: Product | undefined;
	const newProductParameter = 'new';
	let isNewProduct = false;
	const emptyProduct: Product = {
		id: '',
		unitsInStock: sizeOptions.map((option) => {
			return { id: option.id, name: option.name, units: 1 } as UnitsInStock;
		}),
		name: { en: '', es: '' },
		description: { en: '', es: '' },
		price: '$0.00',
		oldPrice: null,
		mainVersion: true,
		status: true,
		imageSources: [],
		dbImageSources: [],
		imageHoverSource: '',
		dbImageHoverSource: '',
		imageAlt: { en: '', es: '' },
		href: '',
		categoryIds: sizeCategoryIds,
		versionsIds: [],
		details: [],
	};

	let id: string = '';
	let categories: Category[] = [];
	$: product?.categoryIds, getCategories();
	let versions: Product[] = [];
	$: product?.versionsIds, getVersions();
	let isSingleSize: boolean;
	let singleSizeChangerMemory: UnitsInStock[] | number;
	let imageFiles: File[] = [];

	function handleStockInput(e: Event, size?: UnitsInStock) {
		if (!product) return;

		let noStock: boolean = true;
		let newValue: string | number = (e.target as HTMLInputElement).value;

		if (/^[+-]?\d+$/.test(newValue)) {
			newValue = Number(newValue);
			if (newValue < 0) {
				newValue = 0;
				(e.target as HTMLInputElement).value = '0';
			}
			if (typeof product.unitsInStock === 'object') {
				const match = product.unitsInStock.find((option) => option === size);
				if (match) {
					match.units = newValue;
				}

				for (let index = 0; index < product.unitsInStock.length; index++) {
					const element = product.unitsInStock[index];

					if (element.units > 0) {
						noStock = false;
					}
				}
			} else {
				product.unitsInStock = newValue;
				noStock = product.unitsInStock < 1;
			}
		} else {
			noStock = false;
		}

		if (noStock && product.status) {
			product.status = false;
			toast($dictionary.productStatusDeactivated);
		}
	}

	function handleStockInputBlur(e: Event, size?: UnitsInStock) {
		if (!product) return;

		const newValue: string | number = (e.target as HTMLInputElement).value;
		if (!/^[+-]?\d+$/.test(newValue)) {
			if (typeof product.unitsInStock === 'object') {
				const match = product.unitsInStock.find((option) => option === size);
				if (match) {
					(e.target as HTMLInputElement).value = match.units.toString();
				}
			} else {
				(e.target as HTMLInputElement).value = product.unitsInStock.toString();
			}
		}
	}

	function handleSingleSizeChange() {
		if (!product) return;
		let localMemory;
		if (singleSizeChangerMemory) {
			localMemory = singleSizeChangerMemory;
		} else if (isSingleSize) {
			localMemory = 1;
		} else {
			localMemory = emptyProduct.unitsInStock;
		}

		if (isSingleSize) {
			singleSizeChangerMemory = product.unitsInStock;
			product.unitsInStock = localMemory;

			// Remove elements that are in sizeCategoryIds
			product.categoryIds = product.categoryIds.filter((id) => !sizeCategoryIds.includes(id));
		} else {
			singleSizeChangerMemory = product.unitsInStock;
			product.unitsInStock = localMemory;

			// Add only missing elements from sizeCategoryIds
			product.categoryIds = [
				...product.categoryIds,
				...sizeCategoryIds.filter((id) => !product?.categoryIds.includes(id)),
			];
		}
	}

	function checkHREF() {
		if (!product) return;

		product.href = product.href.replace(/[^a-zA-Z0-9-]/g, '');
		if (product.href === '') {
			product.href = product.name.en
				.toLowerCase()
				.replaceAll(' ', '-')
				.replace(/[^a-zA-Z0-9-]/g, '');
		}
	}

	function handlePriceInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value;
		if (value === '') {
			target.value = '$';
		} else if (value[0] === '$') {
			target.value = value;
		} else {
			target.value = '$' + value;
		}
	}

	function checkPriceInput() {
		if (!product) return;

		// Normalize price and oldPrice
		product.price = formatPrice(product.price, '$0.00');
		product.oldPrice = formatPrice(product.oldPrice, '');

		// Ensure oldPrice is different from price
		if (product.oldPrice === product.price) {
			product.oldPrice = null;
		}
	}

	function formatPrice(value: string | null, defaultValue: string): string {
		if (!value || value === '$') return defaultValue;

		const num = parseFloat(value?.replace('$', ''));
		return isNaN(num) ? defaultValue : `$${num.toFixed(2)}`;
	}

	function getCategories() {
		if (!product) return;

		let visibleCategories = product.categoryIds.filter((id) => !sizeCategoryIds.includes(id));
		categories = denormalizeCategories(visibleCategories);
	}

	function syncCategories() {
		if (!product) return;

		product.categoryIds = categories.map((item) => item.id);

		// Maintain size's categories
		if (!isSingleSize) {
			product.categoryIds = [
				...product.categoryIds,
				...sizeCategoryIds.filter((id) => !product?.categoryIds.includes(id)),
			];
		}
	}

	function getVersions() {
		if (!product || !product.versionsIds) return;

		let visibleVersions = product.versionsIds.filter((id) => product?.id !== id);
		versions = findProductsByIds(visibleVersions, $allProductsStore);
	}

	function syncVersions() {
		if (!product) return;

		product.versionsIds = versions.map((item) => item.id);

		// Maintain product's id
		if (versions.length > 0) {
			product.versionsIds.push(product.id);
		}
	}

	async function setImageUrlsFromStorage(type: 'main' | 'hover' | 'all' = 'all') {
		if (!product) return;

		if (type === 'main' || type === 'all') {
			product.imageSources = await Promise.all(
				product.dbImageSources.map(async (imageSource) => {
					const imageRef = ref(storage, `products/${imageSource}`);
					return await getDownloadURL(imageRef);
				}),
			);
		}
		if (type === 'hover' || type === 'all') {
			if (product.dbImageHoverSource) {
				const imageRef = ref(storage, `products/${product.dbImageHoverSource}`);
				product.imageHoverSource = await getDownloadURL(imageRef);
			} else {
				product.imageHoverSource = '';
			}
		}
	}

	async function handleImageUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && product) {
			imageFiles = Array.from(target.files);
			for (let file of imageFiles) {
				file = randomizeFileName(file);

				imagesAddedLocally.push(file);

				product.dbImageSources = [...product.dbImageSources, file.name];
				product.imageSources = [...product.imageSources, URL.createObjectURL(file)];
			}
		}

		// Reset Input Element
		target.value = '';
	}

	async function handleImageDelete(imageSource: string, storageURL: string) {
		if (!product || !imageSource) return;

		imagesDeletedLocally.push(imageSource);

		// Only delete one instance of the imageSource
		const index = product!.dbImageSources.indexOf(imageSource);
		if (index !== -1) {
			product!.dbImageSources.splice(index, 1);
		}
		product!.imageSources = product!.imageSources.filter((src) => src !== storageURL);
	}

	async function handleHoverImageUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			imageFiles = Array.from(target.files);
			if (imageFiles.length > 1) {
				toast($dictionary.warningMoreThanOneFileUploadedForHoverImage);
			}
			for (let file of imageFiles) {
				if (product) {
					file = randomizeFileName(file);

					imagesAddedLocally.push(file);

					product.dbImageHoverSource = file.name;
					product.imageHoverSource = URL.createObjectURL(file);
					break;
				}
			}
		}

		// Reset Input Element
		target.value = '';
	}

	async function handleHoverImageDelete(imageSource: string) {
		if (!product || !imageSource) return;

		imagesDeletedLocally.push(imageSource);

		product.dbImageHoverSource = null;
		product.imageHoverSource = '';
	}

	const imagesAddedLocally: File[] = [];
	async function addImageToStorage(imageFile: File) {
		const imageRef = ref(storage, `products/${imageFile.name}`);
		await uploadBytes(imageRef, imageFile);
	}

	const imagesDeletedLocally: string[] = [];
	async function deleteImageFromStorage(imageSource: string) {
		const imageRef = ref(storage, `products/${imageSource}`);
		await deleteObject(imageRef);
	}

	function syncImageLists(): void {
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
	}

	onMount(async () => {
		id = $page.params.id;
		isNewProduct = id === newProductParameter;
		product = isNewProduct
			? emptyProduct
			: structuredClone($allProductsStore.find((p) => p.id === id));

		if (product) {
			isSingleSize = typeof product?.unitsInStock === 'number';
			getCategories();
			getVersions();
			product.details = product.details.map((el) => {
				if (!el.id) el.id = crypto.randomUUID();
				return el;
			});
			await setImageUrlsFromStorage();
		} else if (!isNewProduct) {
			toast.error($dictionary.invalidProductId);
			goto(baseRoute + '/admin/products');
			return;
		}
	});

	async function saveProduct() {
		// Validate the product
		if (!product) {
			toast.error($dictionary.productNotFound);
			return;
		} else if (!product.name.en || !product.name.es || !product.price || !product.href) {
			toast.error($dictionary.pleaseFillInAllRequiredFields);
			return;
		} else if (product.price === '$0.00') {
			toast.error($dictionary.zeroPriceNotValid);
			return;
		}
		$dataReady = false;

		// Update Images
		syncImageLists();
		for (let i = 0; i < imagesDeletedLocally.length; i++) {
			const element = imagesDeletedLocally[i];
			await deleteImageFromStorage(element);
		}
		for (let i = 0; i < imagesAddedLocally.length; i++) {
			const element = imagesAddedLocally[i];
			await addImageToStorage(element);
		}
		await setImageUrlsFromStorage();

		// Save the product
		if (id === newProductParameter) {
			// Modify product to include new id
			const newDocRef = doc(collection(db, 'products'));
			product.id = newDocRef.id;
			if (Array.isArray(product.versionsIds)) {
				product.versionsIds = product.versionsIds.map((id) =>
					id?.trim() === '' ? newDocRef.id : id,
				);
			}

			// Update Product in Database
			await setDoc(newDocRef, product);

			// Update Product Locally
			allProductsStore.update((products) => {
				if (!product) return products;
				return [...products, product];
			});

			toast.success($dictionary.newProductCreatedSuccessfully);
		} else {
			// Update Product in Database
			const docRef = doc(db, 'products', id);
			await updateDoc(docRef, product);

			// Update Product Locally
			allProductsStore.update((products) => {
				const index = products.findIndex((p) => p.id === id);
				if (index !== -1 && product) {
					products[index] = product;
				}
				return products;
			});

			toast.success($dictionary.changesSavedSuccessfully);
		}

		$dataReady = true;
		goto(baseRoute + '/admin/products');
	}

	async function deleteProduct() {
		// Delete Product from Firestore
		try {
			const docRef = doc(db, 'products', id);
			await deleteDoc(docRef);

			allProductsStore.update((products) => products.filter((p) => p.id !== id));

			toast.success($dictionary.productDeletedSuccessfully);
		} catch (error) {
			toast.error($dictionary.productCouldNotBeDeleted);
		}

		// Delete Product's Images from Storage
		try {
			if (product) {
				for (let index = 0; index < product.dbImageSources.length; index++) {
					const element = product.dbImageSources[index];
					await deleteImageFromStorage(element);
				}
				if (product.dbImageHoverSource) {
					await deleteImageFromStorage(product.dbImageHoverSource);
				}
			}
		} catch (error) {
			toast($dictionary.warningProductImagesCouldNotBeDeleted);
		}

		goto(baseRoute + '/admin/products');
	}
</script>

<svelte:head>
	<title
		>{isNewProduct ? $dictionary.createProduct : $dictionary.editProduct} -
		{product?.name[$language] || $dictionary.unnamedProduct}</title
	>
</svelte:head>

{#if product}
	<EditForm
		object={product}
		saveFunction={saveProduct}
		deleteFunction={deleteProduct}
		staticText={{
			createTitle: $dictionary.createProduct,
			editTitle: $dictionary.editProduct,
			unnamedSubtitle: $dictionary.unnamedProduct,
			createButton: $dictionary.createNewProduct,
			saveButton: $dictionary.saveChanges,
			deleteButton: $dictionary.deleteProduct,
			deleteDialogTitle: `${$dictionary.openQuestionMark}${$dictionary.delete} ${product.name[$language]}?`,
			deleteDialogDescription: `${$dictionary.areYouSureThatYouWantToDeleteTheProductCalled} ${product.name[$language]}?`,
			deleteDialogConfirmButton: $dictionary.confirm,
		}}
		backLink="{baseRoute}/admin/products"
		isNew={isNewProduct}
	>
		<!-- GENERAL INFORMATION -->
		<FormSection title={$dictionary.generalInformation}>
			<FormParagraph content={$dictionary.provideBasicDetails} />
			<InputGroup
				label={`${$dictionary.name} (${$dictionary.english})`}
				focusElementID="name-en"
				image={`${baseImageRoute}/usFlag.webp`}
			>
				<FormInput
					bind:value={product.name.en}
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
				<FormInput bind:value={product.name.es} required id="name-es" />
			</InputGroup>
			<InputGroup
				label={`${$dictionary.description} (${$dictionary.english})`}
				image={`${baseImageRoute}/usFlag.webp`}
			>
				<Texteditor bind:content={product.description.en} />
			</InputGroup>
			<InputGroup
				label={`${$dictionary.description} (${$dictionary.spanish})`}
				image={`${baseImageRoute}/spainFlag.webp`}
			>
				<Texteditor bind:content={product.description.es} />
			</InputGroup>

			<FormParagraph content={$dictionary.enterUniqueLink} />
			<InputGroup label={`${$dictionary.productUrl}`} focusElementID="href">
				<FormInput
					bind:value={product.href}
					required
					id="href"
					changeCallback={checkHREF}
				/>
			</InputGroup>
		</FormSection>

		<!-- PRICING & STOCK -->
		<FormSection title={$dictionary.pricingAndStock}>
			<FormParagraph content={$dictionary.setPriceAndStock} />
			<InputGroup label={`${$dictionary.price}`} focusElementID="price">
				<FormInput
					required
					id="price"
					bind:value={product.price}
					inputCallback={handlePriceInput}
					blurCallback={checkPriceInput}
				/>
			</InputGroup>
			<InputGroup
				label={`${$dictionary.oldPrice} (${$dictionary.optional})`}
				focusElementID="old-price"
			>
				<FormInput
					id="old-price"
					bind:value={product.oldPrice}
					inputCallback={handlePriceInput}
					blurCallback={checkPriceInput}
				/>
			</InputGroup>
			<InputGroup label={`${$dictionary.singleSize}`}>
				<BooleanInput
					bind:value={isSingleSize}
					callback={handleSingleSizeChange}
					descriptionBefore={`"${product.name[$language] || '...'}" ${$dictionary.has}`}
					descriptionDynamic={{
						on: $dictionary.onlyOneSize,
						off: $dictionary.multipleSizes,
					}}
				/>
			</InputGroup>
			<InputGroup label={`${$dictionary.unitsInStock}`} focusElementID="units-in-stock">
				{#if typeof product.unitsInStock === 'object'}
					{#each product.unitsInStock as size}
						<FormInput
							label="{$dictionary.size} {size.name}"
							id="units-in-stock-{size.id}"
							type="number"
							required
							value={size.units}
							inputCallback={(e) => handleStockInput(e, size)}
							blurCallback={(e) => handleStockInputBlur(e, size)}
						/>
					{/each}
				{:else}
					<FormInput
						id="units-in-stock"
						type="number"
						required
						bind:value={product.unitsInStock}
						inputCallback={handleStockInput}
						blurCallback={handleStockInputBlur}
					/>
				{/if}
			</InputGroup>
			<InputGroup label={`${$dictionary.productStatus}`}>
				<BooleanInput
					bind:value={product.status}
					descriptionBefore={`"${product.name[$language] || '...'}" ${$dictionary.is}`}
					descriptionDynamic={{
						on: $dictionary.visible,
						off: $dictionary.hidden,
					}}
				/>
			</InputGroup>
		</FormSection>

		<!-- CATEGORIES & VERSIONS -->
		<FormSection title={$dictionary.categoriesAndVersions}>
			<FormParagraph content={$dictionary.specifyCategoriesAndVersions} />
			<InputGroup label={$dictionary.mainVersion}>
				<BooleanInput
					bind:value={product.mainVersion}
					descriptionBefore={`"${product.name[$language] || '...'}"`}
					descriptionDynamic={{
						on: $dictionary.is,
						off: $dictionary.isnot,
					}}
					descriptionAfter={$dictionary.theMainVersion}
				/>
			</InputGroup>
			<InputGroup label={$dictionary.categories} focusElementID="categories-picker">
				<ArrayPicker
					bind:selectedElements={categories}
					array={categoriesStore}
					impossibleOptionsIds={sizeCategoryIds}
					placeholder={$dictionary.addANewCategory}
					on:change={syncCategories}
					id="categories-picker"
				/>
			</InputGroup>
			<InputGroup
				label="{$dictionary.versions} ({$dictionary.optional})"
				focusElementID="version-picker"
			>
				<ArrayPicker
					bind:selectedElements={versions}
					array={$allProductsStore}
					impossibleOptionsIds={[product.id]}
					placeholder={$dictionary.addANewVersion}
					on:change={syncVersions}
					id="version-picker"
				/>
			</InputGroup>
		</FormSection>

		<!-- IMAGES -->
		<FormSection title={$dictionary.images}>
			<FormParagraph content={$dictionary.uploadProductImages} />
			<InputGroup label={$dictionary.images}>
				<ImageInput
					bind:webSources={product.imageSources}
					bind:originalSources={product.dbImageSources}
					deleteCallback={handleImageDelete}
					uploadCallback={handleImageUpload}
				/>
			</InputGroup>
			<InputGroup label={$dictionary.hoverImage}>
				<ImageInput
					bind:webSources={product.imageHoverSource}
					bind:originalSources={product.dbImageHoverSource}
					deleteCallback={handleHoverImageDelete}
					uploadCallback={handleHoverImageUpload}
				/>
			</InputGroup>
		</FormSection>

		<!-- ADDITIONAL DETAILS -->
		<FormSection title={$dictionary.additionalDetails}>
			<FormParagraph content={$dictionary.specifyProductDetails} />
			<TableInput bind:elements={product.details} />
		</FormSection>
	</EditForm>
{/if}
