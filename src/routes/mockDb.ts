import toast from "svelte-french-toast";
import { activeSNavMenu, baseRoute, type CartItem, cartItems, categoriesStore, dictionary, type Language, language, productsStore } from "./stores"
import { get } from 'svelte/store';

export type translatableContent = { en: string; es: string; }

// #region Categories
export type Category = {
    id: string;

    dbImageSrc: string;
    imageSrc: string;
    smallImageSrc?: string;
    dbSmallImageSrc?: string;
    imageAlt: translatableContent;

    name: translatableContent;
    description: translatableContent;
    href: string;

    genderSpecific: boolean;
    sizeAgnostic: boolean;
};

type CatalogSection = {
    name: translatableContent;
    categoryIds: string[];
    categories?: Category[]; // Optional, will be filled by denormalize function
};

export type CatalogCategory = {
    id: string;
    href: string;
    name: translatableContent;
    featuredCategoryId: string | undefined;
    featuredCategory?: Category; // Optional, will be filled by the denormalize function
    sections: CatalogSection[];
}


export let featuredCategories: string[] = ['7', '15']

export const sizeOptions = [
    { id: '16', name: 'XS' },
    { id: '17', name: 'S' },
    { id: '18', name: 'M' },
    { id: '19', name: 'L' },
    { id: '20', name: 'XL' },
    { id: '21', name: 'XXL' },
];
export const sizeCategoryIds = sizeOptions.map((option) => {
    return option.id;
});

export const genderOptions = [
    { id: '7', name: get(dictionary).men },
    { id: '15', name: get(dictionary).women },
];
export const genderCategoryIds = genderOptions.map((option) => {
    return option.id;
});


export function denormalizeCatalogCategory(catalogCategory: CatalogCategory, categories: Category[] = get(categoriesStore)): CatalogCategory {
    // Denormalize each section by mapping the category IDs to their full data
    const denormalizedSections: CatalogSection[] = catalogCategory.sections.map(section => {
        const denormalizedCategoryIds = section.categoryIds.map(categoryId => {
            // Find the full category data by its ID
            const categoryData = categories.find(category => category.id === categoryId);
            if (!categoryData) {
                console.error(`Category with ID ${categoryId} not found`);
            }

            return categoryData;
        }).filter(category => category !== undefined) as Category[];;

        // Return the section with the denormalized categories included
        return {
            ...section,
            categories: denormalizedCategoryIds
        };
    });

    // Find the full category data for the featuredCategoryId
    const featuredCategory = categories.find(category => category.id === catalogCategory.featuredCategoryId);

    // Construct and return the full denormalized catalog category object
    return {
        ...catalogCategory,
        featuredCategory, // Add the full featuredCategory object
        sections: denormalizedSections
    };
}

export function denormalizeCategories(ids: string[], categories: Category[] = get(categoriesStore)): Category[] {
    const denormalizedCategoryIds = ids.map(categoryId => {
        // Find the full category data by its ID
        const categoryData = categories.find(category => category.id === categoryId);
        if (!categoryData) {
            console.error(`Category with ID ${categoryId} not found`);
        }

        return categoryData;
    }).filter(category => category !== undefined) as Category[];

    // Return an object with the denormalized categories.
    return denormalizedCategoryIds;
}

export function findCatalogCategoryByID(id: string): CatalogCategory | undefined {
    return categoryMenus.find(categoryMenu => categoryMenu.id === id);
}

export function findCatalogSectionByName(sectionName: string): CatalogSection | undefined {
    // Flatten the array of sections from all categories
    const allSections: CatalogSection[] = categoryMenus.flatMap(category => category.sections);

    // Find the first section that matches the sectionName
    const matchingSection = allSections.find(section => section.name[get(language) as Language] === sectionName);

    return matchingSection;
}

export function findCategoryByHref(href: string, categories: Category[] = get(categoriesStore)): Category | undefined {
    return categories.find(category => category.href === href);
}

export function findCategoryById(id: string, categories: Category[] = get(categoriesStore)): Category | undefined {
    return categories.find(category => category.id === id);
}

export function getCategoryIdsFromHrefs(hrefs: string[], categories: Category[] = get(categoriesStore)): string[] {
    return hrefs.map(href => {
        const category = findCategoryByHref(href, categories);
        if (!category) {
            console.error(`Category not found for href: ${href}`);
        }
        return category?.id;
    }).filter(id => id !== undefined) as string[];
}

export function getCategoryHrefsFromIds(ids: string[], categories: Category[] = get(categoriesStore)): string[] {
    return ids.map(id => {
        const category = findCategoryById(id, categories);
        if (!category) {
            console.error(`Category not found for id: ${id}`);
        }
        return category?.href;
    }).filter(href => href !== undefined) as string[];;
}

export function getCategoryNamesFromIds(ids: string[], categories: Category[] = get(categoriesStore)): string[] {
    return ids.map(id => {
        const category = findCategoryById(id, categories);
        if (!category) {
            console.error(`Category not found for id: ${id}`);
        }
        return category?.name[get(language) as Language];
    }).filter(name => name !== undefined) as string[];;
}
// #endregion

// #region Menus
export type MenuItem = {
    name: string;
    href?: string;
    icon?: string;
    classname?: string;
    callback?: () => void;

    iconStyle?: string;
};

export const mainMenu: MenuItem[] = [
    {
        name: get(dictionary).home,
        classname: 'baseButton extraSpaceLink',
        icon: 'home',
        href: `${baseRoute}/`,
    },
    {
        name: get(dictionary).men,
        classname: 'baseButton extraSpaceLink',
        icon: 'man',
        iconStyle: 'font-size: 2em; margin-left: -8px;',
        callback: () => generateSectionsMenu('menmenu'),
    },
    {
        name: get(dictionary).women,
        classname: 'baseButton extraSpaceLink',
        icon: 'woman',
        iconStyle: 'font-size: 2em; margin-left: -8px;',
        callback: () => generateSectionsMenu('womenmenu'),
    },
    {
        name: get(dictionary).custom,
        classname: 'baseButton extraSpaceLink',
        icon: 'mail',
        href: `${baseRoute}/custom`,
    },
    // {
    //     name: get(dictionary).ourWork,
    //     classname: 'baseButton extraSpaceLink',
    //     icon: 'people',
    //     href: `${baseRoute}/our-work`,
    // },
    {
        name: get(dictionary).myAccount,
        classname: 'baseButton extraSpaceLink',
        icon: 'person-circle',
        href: `${baseRoute}/my-account`,
    },
];

export let categoryMenus: CatalogCategory[] = [
    {
        id: 'menmenu',
        name: { en: "men", es: "hombres" },
        href: "men",
        featuredCategoryId: undefined,
        sections: [
            {
                name: { en: "apparel", es: "ropa" },
                categoryIds: [
                    '1', '2', '6'
                ]
            },
            // {
            //     name: { en: "conditions", es: "condiciones" },
            //     categoryIds: [
            //         8, 9, 10
            //     ]
            // },
            // {
            //     name: { en: "featured", es: "destacados" },
            //     categoryIds: [
            //         11, 12, 13, 14
            //     ]
            // }
        ]
    },
    {
        id: 'womenmenu',
        name: { en: "women", es: "mujeres" },
        href: "women",
        featuredCategoryId: undefined,
        sections: [
            {
                name: { en: "apparel", es: "ropa" },
                categoryIds: [
                    '1', '2', '6'
                ]
            },
            // {
            //     name: { en: "conditions", es: "condiciones" },
            //     categoryIds: [
            //         8, 9, 10
            //     ]
            // },
            // {
            //     name: { en: "featured", es: "destacados" },
            //     categoryIds: [
            //         11, 12, 13, 14
            //     ]
            // }
        ]
    }
];

export function generateSectionsMenu(catalogCategoryID: string, categories: Category[] = get(categoriesStore)): void {
    const catalogCategory = findCatalogCategoryByID(catalogCategoryID);

    if (!catalogCategory) {
        console.error(`Catalog category ${catalogCategoryID} not found`);
        return;
    }

    const sectionsMenu: MenuItem[] = [
        {
            name: catalogCategory.name[get(language) as Language],
            classname: "baseButton backButton",
            callback: () => renderMenu(mainMenu),
        },
        ...catalogCategory.sections.map(section => ({
            name: section.name[get(language) as Language],
            callback: () => generateCategoryMenu(section.name[get(language) as Language], catalogCategoryID, categories),
        })),
    ];

    renderMenu(sectionsMenu);
}

export function generateCategoryMenu(sectionName: string, catalogCategoryID: string, categories: Category[] = get(categoriesStore)): void {
    // Find the catalog category by name
    const catalogCategory = findCatalogCategoryByID(catalogCategoryID);
    if (!catalogCategory) {
        console.error(`Catalog category ${catalogCategoryID} not found`);
        return;
    }

    // Denormalize the catalog category to include category objects
    const denormalizedCatalogCategory = denormalizeCatalogCategory(catalogCategory, categories);

    // Find the section within the catalog category
    const section = denormalizedCatalogCategory.sections.find(s => s.name[get(language) as Language] === sectionName);
    if (!section || !section.categories) {
        console.error(`Section ${sectionName} not found in catalog category ${catalogCategoryID}`);
        return;
    }

    // Map the categories to MenuItem[]
    const categoryMenu: MenuItem[] = [
        {
            name: sectionName,
            classname: "baseButton backButton",
            callback: () => generateSectionsMenu(catalogCategoryID, categories),
        },
        ...section.categories.map(category => ({
            name: category.name[get(language) as Language],
            href: `${baseRoute}/catalog/${category.href}/${!category.genderSpecific
                ? catalogCategory.href
                : ''}`,
        })),
    ];

    // Render the new menu
    renderMenu(categoryMenu)
}

export function renderMenu(menu: MenuItem[]) {
    activeSNavMenu.set(menu)
}
// #endregion

// #region Products
export type Product = {
    id: string,
    name: translatableContent,
    status: boolean,
    description: translatableContent,
    details: TableEntry[],
    imageSources: string[],
    dbImageSources: string[],
    imageHoverSource: string | null,
    dbImageHoverSource: string | null,
    imageAlt: translatableContent,
    price: string,
    oldPrice: string | null,
    mainVersion: boolean,
    versionsIds: string[] | null,
    href: string,
    categoryIds: string[]
    unitsInStock: UnitsInStock[] | number
}

export type UnitsInStock = {
    id: string;
    name: string;
    units: number;
}

export type TableEntry = {
    id: string;
    label: translatableContent;
    value: translatableContent;
    status: boolean;
};

export function findProductsByIds(ids: string[], products: Product[] = get(productsStore)): Product[] {
    // Convert the products object to an array of products
    const productArray = Object.values(products);

    // Get products with the specified IDs
    const matchingProducts = productArray.filter(product =>
        ids.includes(product.id)
    );

    return matchingProducts;
}

export function findProductsByCategoryIds(categoryIds: string[], products: Product[] = get(productsStore)): Product[] {
    // Convert the products object to an array of products
    const productArray = Object.values(products);

    // Filter products that include all of the specified category IDs
    const matchingProducts = productArray.filter(product =>
        categoryIds.every(id => product.categoryIds.includes(id) && product.mainVersion)
    );

    return matchingProducts;
}

export function findProductByHref(hrefParam: string, products: Product[] = get(productsStore)): Product | undefined {
    return Object.values(products).find((product) => product.href === hrefParam);
}

export function findSimilarProducts(product: Product, count: number, products: Product[] = get(productsStore)): Product[] {
    // Convert products object to an array and filter out the original product
    const otherProducts = Object.values(products).filter(
        (p) =>
            p.id !== product.id &&
            p.mainVersion === true &&
            !product.versionsIds?.includes(p.id),
    );

    // Shuffle the array to get random products
    const shuffledProducts = otherProducts.sort(() => 0.5 - Math.random());

    // Slice the array to get the specified count or the maximum amount possible
    return shuffledProducts.slice(0, count);
}

export function findProductsByCategoryHrefs(hrefs: string[], products: Product[] = get(productsStore), categories: Category[] = get(categoriesStore)): Product[] {
    let categoryIds = getCategoryIdsFromHrefs(hrefs, categories);
    return findProductsByCategoryIds(categoryIds, products);
}

export function getUnitsAvailable(product: Product, sizeId: string | undefined): number {
    let units = 0;
    if (typeof product.unitsInStock === 'number') {
        units = product.unitsInStock;
    } else {
        const optionToCheckStock = product.unitsInStock.find((option) => option.id === sizeId);
        if (optionToCheckStock) {
            units = optionToCheckStock.units;
        }
    }

    return units;
}
// #endregion

// #region Reviews
export type Review = {
    productId: string,
    date: string,
    text: string,
    name: string,
    imageSrc: string,
    rating: number,
}

export let reviews: Review[] = [
    // Jersey
    {
        productId: "menjersey",
        date: '01-20-2024',
        text:
            'Nice color and good fabric quality. This is the perfect size and the blue version matches my style perfectly.',
        name: 'kylejameson',
        imageSrc: '/images/lawyers/Alejandro_Rodriguez.jpg',
        rating: 5,
    },
    {
        productId: 'menjersey',
        date: '01-25-2024',
        text:
            'Absolutely love the new Jersey 2024, the red color is vibrant and it feels very comfortable to wear.',
        name: 'sarahc',
        imageSrc: '/images/lawyers/Sofia_Lindström.jpg',
        rating: 5,
    },
    {
        productId: 'menjersey',
        date: '02-01-2024',
        text:
            'The Jersey 2024 is amazing. It fits true to size and is very stylish for any event.',
        name: 'markuslee',
        imageSrc: '/images/lawyers/Brian_Mitchell.jpg',
        rating: 5,
    },
    {
        productId: 'menjersey',
        date: '02-05-2024',
        text:
            'Great jersey, the material is high-quality and the blue is just the right shade. Highly recommend!',
        name: 'annak',
        imageSrc: '/images/lawyers/Emily_Davis.jpg',
        rating: 5,
    },
    {
        productId: 'menjersey',
        date: '02-10-2024',
        text:
            'Picked up the Jersey 2024 for my workout sessions, and it’s been fantastic. Breathable and flexible!',
        name: 'lucas98',
        imageSrc: '/images/lawyers/Marcus_Turner.jpg',
        rating: 5,
    },

    // Cycling Bib
    {
        productId: 'cyclingbib',
        date: '03-01-2024',
        text:
            'The Cycling Bib 2024 is a game-changer. The fit is exceptional, and it provides the comfort needed on long rides. Top-notch quality!',
        name: 'michaelsmith',
        imageSrc: '/images/lawyers/Brian_Mitchell.jpg',
        rating: 5,
    },
    {
        productId: 'cyclingbib',
        date: '03-04-2024',
        text:
            'Just finished a century ride with the Cycling Bib 2024, and I couldn’t be happier. Supportive, stylish, and the blue color is stunning!',
        name: 'julie_w',
        imageSrc: '/images/lawyers/Sofia_Lindström.jpg',
        rating: 5,
    },
    {
        productId: 'cyclingbib',
        date: '03-07-2024',
        text:
            'The red Cycling Bib 2024 fits like a glove and breathes so well. It\'s my new go-to for all my cycling tours.',
        name: 'daveanderson',
        imageSrc: '/images/lawyers/Rahul_Patel.jpg',
        rating: 5,
    },
    {
        productId: 'cyclingbib',
        date: '03-10-2024',
        text:
            'Incredible comfort and sleek design! The Cycling Bib 2024 has made my rides more enjoyable. Highly recommend it to any cyclist!',
        name: 'lindseyb',
        imageSrc: '/images/lawyers/Ji-Yeon_Kim.jpg',
        rating: 5,
    },

    // Rada Socks
    {
        productId: 'radaSocks',
        date: '03-01-2024',
        text: 'These RADA Socks are a game-changer! Super comfortable for my daily runs and stylish enough for casual wear.',
        name: 'julianv',
        imageSrc: '/images/lawyers/Marcus_Turner.jpg',
        rating: 5,
    },
    {
        productId: 'radaSocks',
        date: '03-03-2024',
        text: 'I was skeptical about the price, but these socks are worth every penny. They feel like walking on clouds!',
        name: 'emilyrose',
        imageSrc: '/images/lawyers/Ji-Yeon_Kim.jpg',
        rating: 5,
    },
    {
        productId: 'radaSocks',
        date: '03-05-2024',
        text: 'Bought these for my hiking trips, and they’ve been fantastic. No blisters, and my feet stay dry!',
        name: 'mikejones',
        imageSrc: '/images/lawyers/Brian_Mitchell.jpg',
        rating: 5,
    },
    {
        productId: 'radaSocks',
        date: '03-07-2024',
        text: 'The comfort level of RADA Socks is unbeatable. Plus, they look great with all my shoes!',
        name: 'anna_k',
        imageSrc: '/images/lawyers/Emily_Davis.jpg',
        rating: 5,
    },
];

export function findReviewsByProductId(productId: string): Review[] {
    return reviews.filter((review) => review.productId === productId);
}

export function calculateAverageRating(reviews: Review[]): string | undefined {
    if (reviews.length === 0) {
        return undefined;
    }

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    return averageRating.toFixed(1);
}
// #endregion

// #region Cart
export type DenormalizedCartItem = {
    productId: string,
    sizeId?: string,
    quantity: number,
    name: string,
    imageSrc: string,
    description: string,
    price: string,
    totalItemPrice: number,
    href: string,
}

export function denormalizeCartItems(cartItems: CartItem[], products: Product[] = get(productsStore), categories: Category[] = get(categoriesStore)): DenormalizedCartItem[] {
    return cartItems.map((item) => {
        const product = Object.values(products).find(product => product.id === item.productId);
        if (!product) {
            return null;
        }

        const unitsAvailable = getUnitsAvailable(product, item.sizeId);
        if (!unitsAvailable) {
            return null;
        }

        let productSize;
        if (item.sizeId) {
            productSize = findCategoryById(item.sizeId, categories)?.name[get(language) as Language];
        }
        let name = `${product.name[get(language) as Language]}${productSize ? " - " + get(dictionary).size + ' ' + productSize : ""}`

        if (item.quantity > unitsAvailable) {
            item.quantity = unitsAvailable;
            toast(`${unitsAvailable === 1 ? get(dictionary).thereIs : get(dictionary).thereAre} ${unitsAvailable} ${unitsAvailable === 1 ? get(dictionary).unitLeft : get(dictionary).unitsLeft}: ${name}`)
        }

        const itemPrice = parseFloat(product.price.replace(/[^0-9.-]+/g, ""));
        const totalItemPrice = itemPrice * item.quantity;

        return {
            productId: item.productId,
            sizeId: item.sizeId,
            quantity: item.quantity,
            name: name,
            imageSrc: product.imageSources[0],
            description: product.description[get(language) as Language],
            price: product.price,
            totalItemPrice: totalItemPrice,
            href: product.href
        };
    }).filter(item => item !== null);
}

export function addToCart(productId: string, quantity: number, sizeId?: string, name?: string): void {
    // Adds a product to the cart or updates the quantity if the product already exists.
    cartItems.update(items => {
        sizeId ||= '0'

        const existingItemIndex = items.findIndex(item => item.productId === productId && item.sizeId === sizeId);
        if (existingItemIndex !== -1) {
            // Update quantity of an existing item
            const updatedItems = [...items];
            updatedItems[existingItemIndex] = {
                ...updatedItems[existingItemIndex],
                quantity,
            };
            if (name) {
                toast.success(get(dictionary).quantityUpdated,
                    {
                        style:
                            "max-width: 60%; text-align: center; box-shadow: 2px 2px 20px var(--content-5)",
                        position: "bottom-center"
                    })
            }
            return updatedItems;
        } else {
            // Add new item to the cart
            if (name) {
                toast.success(`"${name}" ${get(dictionary).hasBeenAddedToTheCart}`,
                    {
                        style:
                            "max-width: 60%; text-align: center; box-shadow: 2px 2px 20px var(--content-5)",
                        position: "bottom-center"
                    })
            }
            return [...items, { productId, quantity, sizeId }];
        }
    });
}

export function removeFromCart(productId: string, name: string, sizeId?: string): void {
    sizeId ||= '0'

    cartItems.update(items => items.filter(item => item.productId !== productId || item.sizeId !== sizeId));

    toast.success(`"${name}" ${get(dictionary).hasBeenRemovedFromTheCart}`,
        {
            style:
                "max-width: 60%; text-align: center; box-shadow: 2px 2px 20px var(--content-5)",
            position: "bottom-center"
        })
}

export function getCartItemFromIDs(cartItemsStore: CartItem[], productId: string, sizeId?: string) {
    sizeId ||= '0'

    return Object.values(cartItemsStore).find(item => item.productId === productId && item.sizeId === sizeId)
}
// #endregion

// #region Portfolio
export type PortfolioItem = {
    src: string;
    alt?: translatableContent;
    title?: translatableContent;
    description?: translatableContent;
}

export let portfolio: PortfolioItem[] = [
    // {
    //     src: `demo/woman-small.webp`,
    //     alt: { en: 'Cyclist wearing our high-performance jersey', es: 'Ciclista usando nuestra camiseta de alto rendimiento' },
    //     title: { en: 'High-Performance Women’s Jersey', es: 'Camiseta de Alto Rendimiento para Mujeres' },
    //     description: {
    //         en: 'Showcasing our latest in women’s cycling jerseys, this piece combines aerodynamics with unparalleled comfort. Developed in collaboration with professional cyclists, it features breathable, moisture-wicking fabric and a form-fitting design for those who refuse to compromise on performance or style.',
    //         es: 'Presentando lo último en camisetas de ciclismo para mujeres, esta pieza combina la aerodinámica con un confort sin igual. Desarrollada en colaboración con ciclistas profesionales, cuenta con un tejido transpirable que absorbe la humedad y un diseño ajustado para quienes no renuncian al rendimiento ni al estilo.'
    //     },
    // },
    // {
    //     src: `demo/man-small.webp`,
    //     alt: { en: 'Cyclist in action wearing our mountain biking gear', es: 'Ciclista en acción usando nuestro equipo de ciclismo de montaña' },
    //     title: { en: 'All-Terrain Mountain Biking Gear', es: 'Equipo de Ciclismo de Montaña Todo Terreno' },
    //     description: {
    //         en: 'Designed for the trails, our all-terrain gear set is built to withstand the most challenging conditions. With reinforced stitching, ample storage for long rides, and integrated protective padding, this gear represents our commitment to combining durability with the freedom of movement.',
    //         es: 'Diseñado para los senderos, nuestro equipo todo terreno está construido para resistir las condiciones más desafiantes. Con costuras reforzadas, amplio almacenamiento para recorridos largos y acolchado protector integrado, este equipo representa nuestro compromiso de combinar durabilidad con la libertad de movimiento.'
    //     },
    // },
    // {
    //     src: `demo/amsterdam-small.webp`,
    //     alt: { en: 'Urban cyclist apparel by the canals of Amsterdam', es: 'Ropa de ciclista urbano junto a los canales de Ámsterdam' },
    //     title: { en: 'Urban Commuter Series', es: 'Serie para Ciclistas Urbanos' },
    //     description: {
    //         en: 'Inspired by the cycling culture of Amsterdam, our Urban Commuter Series marries functionality with sleek, minimalist design. Waterproof, yet breathable materials and subtle reflective details ensure safety and comfort in urban environments, making every commute a statement.',
    //         es: 'Inspirada en la cultura ciclista de Ámsterdam, nuestra Serie para Ciclistas Urbanos combina funcionalidad con un diseño elegante y minimalista. Materiales impermeables pero transpirables y detalles reflectantes sutiles garantizan la seguridad y el confort en entornos urbanos, haciendo de cada trayecto una declaración de estilo.'
    //     },
    // },
    // {
    //     src: `demo/women.webp`,
    //     alt: { en: 'Eco-friendly cycling wear collection', es: 'Colección de ropa de ciclismo ecológica' },
    //     title: { en: 'Eco-Friendly Collection', es: 'Colección Ecológica' },
    //     description: {
    //         en: 'Our Eco-Friendly Collection is a testament to our commitment to sustainability. Made from recycled materials without compromising on performance, these pieces offer cyclists a way to support the environment while enjoying their ride. Join us on the journey towards a greener future.',
    //         es: 'Nuestra Colección Ecológica es un testimonio de nuestro compromiso con la sostenibilidad. Hecha de materiales reciclados sin comprometer el rendimiento, estas piezas ofrecen a los ciclistas una forma de apoyar al medio ambiente mientras disfrutan de su paseo. Únete a nosotros en el camino hacia un futuro más verde.'
    //     },
    // },
    {
        src: 'custom/1.webp'
    },
    {
        src: 'custom/2.webp'
    },
    {
        src: 'custom/3.webp'
    },
    {
        src: 'custom/4.webp'
    },
    {
        src: 'custom/5.webp'
    },
    {
        src: 'custom/6.webp'
    },
    {
        src: 'custom/7.webp'
    },
    {
        src: 'custom/8.webp'
    },
    {
        src: 'custom/9.webp'
    },
    {
        src: 'custom/10.webp'
    },
    {
        src: 'custom/11.webp'
    },
    {
        src: 'custom/12.webp'
    },
    {
        src: 'custom/13.webp'
    },
    {
        src: 'custom/14.webp'
    },
    {
        src: 'custom/15.webp'
    },
    {
        src: 'custom/16.webp'
    },
    {
        src: 'custom/17.webp'
    },
    {
        src: 'custom/18.webp'
    },
    {
        src: 'custom/19.webp'
    },
    {
        src: 'custom/20.webp'
    },
    {
        src: 'custom/21.webp'
    },
    {
        src: 'custom/22.webp'
    },
    {
        src: 'custom/23.webp'
    },
    {
        src: 'custom/24.webp'
    },
    {
        src: 'custom/25.webp'
    },
    {
        src: 'custom/26.webp'
    },
    {
        src: 'custom/27.webp'
    },
    {
        src: 'custom/28.webp'
    },
    {
        src: 'custom/29.webp'
    },
    {
        src: 'custom/30.webp'
    },
    {
        src: 'custom/31.webp'
    },
    {
        src: 'custom/32.webp'
    },
    {
        src: 'custom/33.webp'
    },
    {
        src: 'custom/34.webp'
    },
    {
        src: 'custom/35.webp'
    },
    {
        src: 'custom/36.webp'
    },
    {
        src: 'custom/37.webp'
    },
    {
        src: 'custom/38.webp'
    },
    {
        src: 'custom/39.webp'
    },
    {
        src: 'custom/40.webp'
    },
    {
        src: 'custom/41.webp'
    },
    {
        src: 'custom/42.webp'
    },
    {
        src: 'custom/43.webp'
    },
    {
        src: 'custom/44.webp'
    },
    {
        src: 'custom/45.webp'
    },
    {
        src: 'custom/46.webp'
    },
    {
        src: 'custom/47.webp'
    },
    {
        src: 'custom/48.webp'
    },
    {
        src: 'custom/49.webp'
    },
    {
        src: 'custom/50.webp'
    },
    {
        src: 'custom/51.webp'
    },
    {
        src: 'custom/52.webp'
    },
    {
        src: 'custom/53.webp'
    },
    {
        src: 'custom/54.webp'
    },
    {
        src: 'custom/55.webp'
    },
    {
        src: 'custom/56.webp'
    },
];
// #endregion

// #region Orders
export type Order = {
    id?: string;
    userId: string;
    productId: number;
    arrivalDate: string;
    quantity: number;
    sizeId: number;
    trackingNumber: string;
    trackingUrl: string;
};
// #endregion

// #region Messages
export type Message = {
    id?: string;
    userId: string;
    firstName: string;
    lastName: string;
    teamName: string;
    email: string;
    phone: string;
    teamSize: string;
    messageContent: string;
    contactMethod: string;
};
// #endregion