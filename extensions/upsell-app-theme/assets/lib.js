//#region declarations
const currProduct = window.currProduct;
const storefrontToken = window.storefrontToken;
console.log("Window.storefrontToken", storefrontToken);
const promotions = window.promotions;
const shopUrl = window.shopUrl ?? window.ac_shopURL;
//#endregion

//#region Promotion Management and Logic
/**
 * Builds promotions based on the provided array of promotions.
 * @param {Array} promotions - The array of promotions to build.
 * @returns {Promise<void>} - A promise that resolves when the promotions are built.
 */
const mainPromotionManager = async (promotions) => {
    console.log("running mainPromotionManager!");
    //step 1. sort promotions by priority
    promotions = promotions.sort((a, b) => {
        return (
            a.configuration.metadata.priority -
            b.configuration.metadata.priority
        );
    });

    const isProductPage = window.location.pathname.includes("/products/");
    //step 2. break the promotions apart to each type

    const promotionTypes = [
        {
            type: "frequentlyBoughtTogether",
            promotions: promotions.filter(
                (promotion) => promotion.type === "frequentlyBoughtTogether",
            ),
            page: "product", //can be product, cart, popup, general
            function: insertFrequentlyBoughtTogether,
        },
        {
            type: "volumeDiscount",
            promotions: promotions.filter(
                (promotion) => promotion.type === "volumeDiscount",
            ),
            page: "product", //can be product, cart, popup, general
            function: insertVolumeDiscount,
        },
        {
            type: "upgradeDiscount",
            promotions: promotions.filter(
                (promotion) => promotion.type === "upgradeDiscount",
            ),
            page: "product", //can be product, cart, popup, general
            function: insertUpgrade,
        },
        {
            type: "freeGift",
            promotions: promotions.filter(
                (promotion) => promotion.type === "freeGift",
            ),
            page: "product", //can be product, cart, popup, general
            function: insertFreeGift,
        },
        {
            type: "productAddons",
            promotions: promotions.filter(
                (promotion) => promotion.type === "productAddons",
            ),
            page: "product", //can be product, cart, popup, general
            function: insertProductAddons,
        },
    ];
    //3. get the product collections and tags
    const collections = await getCollectionsForProduct(currProduct.handle);
    const tags = currProduct.tags.map((tag) => tag.toLowerCase());

    //4. for each type, find the first triggered promotion
    const promotionData = {
        frequentlyBoughtTogether: {
            promotionId: null,
            itemIds: [],
        },
        volumeDiscount: {
            promotionId: null,
            itemIds: [],
        },
        addonDiscount: {
            promotionId: null,
            itemIds: [],
        },
        upgradeDiscount: {
            promotionId: null,
            itemIds: [],
        },
        freeGift: {
            promotionId: null,
            itemIds: [],
        },
        productAddons: {
            promotionId: null,
            itemIds: [],
        },

        collections: collections,
        tags: tags,
    };

    promotionTypes.forEach(async (promotionType) => {
        //productPage promotions
        if (promotionType.page === "product" && isProductPage) {
            for (const promotion of promotionType.promotions) {
                const isTrigger = await isTriggerProduct(
                    promotion?.configuration?.target,
                    collections,
                    tags,
                );
                if (isTrigger) {
                    console.log("promotion triggered!", promotion);
                    //5. get the offer products for the triggered promotion and assign them to the promotionData
                    const offerProducts = await getOfferProducts(promotion);
                    console.log(
                        "🚀 ~ file: lib.js:80 ~ promotionTypes.forEach ~ offerProducts:",
                        offerProducts,
                    );

                    promotionData[promotionType.type].promotionId =
                        promotion.id;
                    if (offerProducts && offerProducts.length > 0) {
                        promotionData[promotionType.type].itemIds = [
                            ...offerProducts.map((product) => product.id),
                        ];
                    }
                    promotionData[promotionType.type].itemIds.push(
                        currProduct.id,
                    );
                    console.log("promotionData: ", promotionData);
                    //6. run the promotion function to build the promotion and insert it into the page
                    console.log("promotion", promotion);
                    promotionType.function(
                        offerProducts,
                        promotion.id,
                        promotion.configuration,
                    );
                    break;
                }
            }
        }
        //need another condition for the cart page and announcement bar
        console.log("promotionData: ", promotionData);
        if (isProductPage) window.ac_promotionData = promotionData;
        else window.ac_promotionData = "not on product page";
    });
};

/**
 * Checks if a promotion is triggered based on its configuration and the current product.
 * @param {Object} promotion - The promotion object.
 * @returns {boolean} - Returns true if the promotion is triggered, false otherwise.
 */
async function isTriggerProduct(target, collections, tags) {
    const triggerType = target?.type;
    const triggerValue = target?.value;
    console.log("triggerType: ", triggerType);

    if (triggerType === "product") {
        const triggerProducts = triggerValue.map((trigger) => trigger.handle);
        if (triggerProducts.includes(currProduct.handle)) {
            return true;
        }
    } else if (triggerType === "collection") {
        try {
            const triggerCollectionHandles = triggerValue.map((trigger) => {
                return trigger.handle;
            });
            const productCollectionHandles = collections.map((collection) => {
                return collection.handle;
            });
            if (
                triggerCollectionHandles.some((handle) =>
                    productCollectionHandles.includes(handle),
                )
            ) {
                return true;
            }
        } catch (error) {
            console.error(error.message || error);
        }
    } else if (triggerType === "tag") {
        if (tags.some((tag) => triggerValue.includes(tag))) {
            return true;
        }
    }

    return false;
}
const getDiscount = (configuration) => {
    console.log("configuration: ", configuration);
    if (configuration?.offerDiscount) {
        return configuration?.offerDiscount;
    }
    return { amount: 0, type: "percentage" };
};
/**
 * Retrieves the offer products based on the given promotion.
 *
 * @param {Object} promotion - The promotion object.
 * @returns {Promise<Array>} - A promise that resolves to an array of offer products.
 */
const getOfferProducts = async (promotion) => {
    //array of products, collections or tags
    if (!promotion?.configuration?.offerItems) {
        return [];
    }
    const offerValue = promotion?.configuration?.offerItems?.value;
    //can be product or collection or tag
    const offerType = promotion?.configuration?.offerItems?.type;

    let offerProducts = [];
    const offerCollections = [];

    if (offerType === "collection") {
        const offerHandles = offerValue.map((value) => value.handle);
        const offerCount = promotion?.configuration?.offerItems?.numItems;
        console.log("offerCount: ", offerCount);
        for (const productHandle of offerHandles) {
            const product = await getCollectionByHandle(productHandle);
            offerCollections.push(product);
        }
        offerCollections.forEach((collection) => {
            for (let i = 0; offerProducts.length < offerCount; i++) {
                if (
                    collection.products.edges[i].node.handle !==
                    currProduct.handle
                ) {
                    offerProducts.push(collection.products.edges[i].node);
                }
            }
        });
    }
    if (offerType === "product") {
        const offerHandles = offerValue.map((value) => value.handle);

        for (const collectionHandle of offerHandles) {
            const collection = await getProductByHandle(collectionHandle);
            offerProducts.push(collection);
        }
    }
    if (offerType === "tag") {
        //get products by tag
        const offerTags = offerValue;
        for (const tag of offerTags) {
            const products = await getProductsByTag(tag);

            //TODO: add logic to get specific product from tag
            console.log("productsx: ", products);
            if (products[0].handle === currProduct.handle) {
                offerProducts.push(products[1]);
            } else {
                offerProducts.push(products[0]);
            }
        }
    }
    console.log("offerProducts!: ", offerProducts);
    return offerProducts;
};
//#endregion

//#region API Functions
const productFields = `
                        title
                        id
                        handle
                        featuredImage{
                                url
                                altText
                        }
                        options(first: 100) {
                                id
                                name
                                values
                        }
                        variants(first: 100) {
                                edges {
                                        node {
                                                id
                                                title
                                                price{
                                                        amount
                                                }
                                                compareAtPrice{
                                                        amount
                                                
                                                }
                                        }
                                }
                        }
                        `;
async function getCollectionsForProduct(productHandle) {
    const apiUrl = `${shopUrl}/api/2024-01/graphql.json`;
    const storefrontAccessToken = storefrontToken;

    const query = `
          query GetCollectionsForProduct($productHandle: String!) {
            productByHandle(handle: $productHandle) {
              id
              title
              collections(first: 100) {
                edges {
                  node {
                        id
                        title
                        handle
                        description
                        products(first: 10) {
                          edges {
                            node {
                              id
                              title
                              handle
                            }
                          }
                        }
                  }
                }
              }
            }
          }
        `;

    const variables = {
        productHandle: productHandle,
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
            },
            body: JSON.stringify({
                query: query,
                variables: variables,
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.data.productByHandle.collections.edges.map(
            (edge) => edge.node,
        );
    } catch (error) {
        throw new Error(`Error: ${error.message || error}`);
    }
}
async function getCollectionByHandle(collectionHandle) {
    const apiUrl = `${shopUrl}/api/2024-01/graphql.json`;
    const storefrontAccessToken = storefrontToken;

    const query = `
          query GetCollectionByHandle($collectionHandle: String!) {
            collectionByHandle(handle: $collectionHandle) {
              id
              title
              handle
              description
              products(first: 10) {
                edges {
                  node {
                    ${productFields}
                  }
                }
              }
            }
          }
        `;

    const variables = {
        collectionHandle: collectionHandle,
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
            },
            body: JSON.stringify({
                query: query,
                variables: variables,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.data.collectionByHandle;
    } catch (error) {
        throw new Error(`Error: ${error.message || error}`);
    }
}
async function getProductByHandle(productHandle) {
    const apiUrl = `${shopUrl}/api/2024-01/graphql.json`;
    const storefrontAccessToken = storefrontToken;

    const query = `
                  query GetProductByHandle($productHandle: String!) {
                productByHandle(handle: $productHandle) {
                  ${productFields}
                  description
                  collections(first: 10) {
                        edges {
                          node {
                        id
                        title
                        handle
                          }
                        }
                  }
                }
                  }
                `;

    const variables = {
        productHandle: productHandle,
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
            },
            body: JSON.stringify({
                query: query,
                variables: variables,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.data.productByHandle;
    } catch (error) {
        throw new Error(`Error: ${error.message || error}`);
    }
}
async function getProductsByTag(tag) {
    const apiUrl = `${shopUrl}/api/2024-01/graphql.json`;
    const storefrontAccessToken = storefrontToken;

    const query = `
          query getProducts($first: Int, $query: String) {
            products(first: $first, query: $query) {
              edges {
                cursor
                node {
                  ${productFields}
                }
              }
            }
          }
        `;

    const variables = {
        first: 3, // You can adjust the number of products to retrieve
        query: `tag:${tag}`,
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
            },
            body: JSON.stringify({
                query: query,
                variables: variables,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.data.products.edges.map((edge) => edge.node);
    } catch (error) {
        throw new Error(`Error: ${error.message || error}`);
    }
}

//#endregion

//#region HTML Builder Functions
function appendBelowAddToCart(parentElement, elementToAppend) {
    const placeAfter = (element, before) =>
        before.parentNode.insertBefore(element, before.nextSibling);
    const placeBefore = (element, after) =>
        after.parentNode.insertBefore(element, after);
    console.log("searching for form");
    const appComponentContainer = document.createElement("div");
    appComponentContainer.id = "appComponentContainer";
    appComponentContainer.innerHTML = "";
    appComponentContainer?.appendChild(elementToAppend);

    const formWithAction = parentElement.querySelector(
        "form[action*='/cart/add']",
    );
    console.log("formWithAction: ", formWithAction);
    const productFormClass = parentElement.querySelector(".product-form");
    const productFormTag = parentElement.querySelector("product-form");
    const buyButtonsTag = parentElement.querySelector("buy-buttons");
    const form = parentElement.querySelector("form");
    if (form) {
        //append below button
        console.log("form Found It");
        placeAfter(appComponentContainer, form);
    }
    if (productFormTag) {
        //append below button
        console.log("productFormTag Found It");
        placeAfter(appComponentContainer, productFormTag);
    } else if (productFormClass) {
        //append below button
        console.log("productFormClass Found It");
        placeAfter(appComponentContainer, productFormClass);
    } else if (buyButtonsTag) {
        //append below button
        console.log("buyButtonsTag Found It");
        placeAfter(appComponentContainer, buyButtonsTag);
    } else if (formWithAction) {
        //append below button
        console.log("formWithAction Found It");
        placeAfter(appComponentContainer, formWithAction);
    }
}
function insertProductCard(args) {
    let {
        imgSrc,
        imgAlt,
        productTitle,
        productPrice,
        variants,
        targetElement,
        classData,
        isGift,
        discountAmount,
    } = args;
    if (!classData) {
        classData = "product-card";
    }
    if (!isGift) {
        isGift = false;
    }
    let newPrice = productPrice;
    console.log("discountAmount: ", discountAmount);
    if (discountAmount?.type === "percentage") {
        newPrice = `${(
            productPrice -
            productPrice * (discountAmount.value / 100)
        ).toFixed(2)}`;
    } else if (discountAmount?.type === "fixed") {
        newPrice = `${(productPrice - discountAmount.value).toFixed(2)}`;
    }
    const card = document.createElement("div");
    card.classList.add(classData);

    const productPreview = document.createElement("div");
    productPreview.classList.add("product-preview-img-title");
    productPreview.innerHTML = `
                <div class="product-preview__image">
                        <img src="${imgSrc}" alt="${imgAlt}" width="100" height="100"/>
                        </div>
                        <div class="product-preview__title">
                        <h3>${productTitle}</h3>
                        </div>
                        </div>
                        `;
    card.appendChild(productPreview);
    const productDetails = document.createElement("div");
    productDetails.classList.add("product-details");
    productDetails.innerHTML = `
        <div class ="price-row"><p class="old-price">$${productPrice}</p><p class="new-price">$${newPrice}</p></div>
        `;
    productDetails.appendChild(insertvariantSelector(variants));
    card.appendChild(productDetails);

    targetElement.appendChild(card);
}
function insertAddToCartButton(targetElement) {
    const button = document.createElement("button");
    button.classList.add("promo-add-to-cart");
    button.innerHTML = "Add to Cart";
    targetElement.appendChild(button);
}
function insertvariantSelector(variants) {
    const variantSelector = document.createElement("select");
    variantSelector.classList.add("variant-selector");
    variantSelector.innerHTML = variants.map((variant) => {
        return `<option value="${gidToId(variant.id)}">${variant.title}</option>`;
    });
    return variantSelector;
}
const insertFrequentlyBoughtTogether = (
    offerProducts,
    promotionId,
    configuration,
) => {
    // Create a form element for the frequently bought together section
    const fbtForm = document.createElement("form");
    fbtForm.action = "";
    fbtForm.id = "fbt-form";
    buildStyles(configuration.styles, "#fbt-form");

    // Create a title element for the frequently bought together section
    const title = document.createElement("h2");
    console.log("configuration: ", configuration);
    title.innerHTML = configuration.texts.containerTitle; //! containerTitle.value needed if in snippetPreview
    fbtForm.appendChild(title);

    // Create a container element for the product cards
    const container = document.createElement("div");
    container.classList.add("fbt-container");
    fbtForm.appendChild(container);
    console.log("currProduct: ", currProduct);

    console.log("offerProducts: ", offerProducts);
    // Insert the product card for the current product
    const discountAmount = getDiscount(configuration);

    insertProductCard({
        imgSrc: currProduct?.media[0]?.src,
        imgAlt: currProduct?.media[0]?.alt,
        productTitle: currProduct?.title,
        productPrice: `${(currProduct?.variants[0]?.price / 100).toFixed(2)}`,
        variants: currProduct?.variants,
        targetElement: container,
        discountAmount: discountAmount,
    });

    // Insert the product cards for the offer products
    offerProducts.forEach((product) => {
        if (product) {
            // Add a plus symbol before each offer product card
            container.innerHTML += `<div class="triggerPlusSymbol">+</div>`;

            // Insert the product card for the offer product
            insertProductCard({
                imgSrc: product.featuredImage.url,
                imgAlt: product.featuredImage.altText,
                productTitle: product.title,
                productPrice: product.variants.edges[0].node.price.amount,
                variants: product.variants.edges.map((variant) => variant.node),
                targetElement: container,
                discountAmount: discountAmount,
            });
        }
    });

    // Insert the "Add to Cart" button
    insertAddToCartButton(fbtForm);

    // Append the frequently bought together section to the product description
    const body = document.querySelector("body");
    appendBelowAddToCart(body, fbtForm);

    // Add event listener for form submission
    const itemIds = offerProducts.map((product) =>
        parseInt(product.id.split("/").pop()),
    );
    itemIds.push(currProduct.id);
    addSubmissionListener("#fbt-form", "fbt");
};
const insertProductAddons = (offerProducts, promotionId) => {
    // Create a form element for the frequently bought together section
    const fbtForm = document.createElement("form");
    fbtForm.action = "";
    fbtForm.id = "fbt-form";

    // Create a title element for the frequently bought together section
    const title = document.createElement("h2");
    title.innerHTML = "Product Addons";
    fbtForm.appendChild(title);

    // Create a container element for the product cards
    const container = document.createElement("div");
    container.classList.add("fbt-container");
    fbtForm.appendChild(container);

    // Insert the product card for the current product
    insertProductCard({
        imgSrc: currProduct?.media[0]?.src,
        imgAlt: currProduct?.media[0]?.alt,
        productTitle: currProduct?.title,
        productPrice: `$${(currProduct?.variants[0]?.price / 100).toFixed(2)}`,
        variants: currProduct?.variants,
        targetElement: container,
    });

    // Insert the product cards for the offer products
    offerProducts.forEach((product) => {
        if (product) {
            // Add a plus symbol before each offer product card
            container.innerHTML += `<div class="triggerPlusSymbol">+</div>`;

            // Insert the product card for the offer product
            insertProductCard({
                imgSrc: product.featuredImage.url,
                imgAlt: product.featuredImage.altText,
                productTitle: product.title,
                productPrice: product.variants.edges[0].node.price.amount,
                variants: product.variants.edges.map((variant) => variant.node),
                targetElement: container,
            });
        }
    });

    // Insert the "Add to Cart" button
    insertAddToCartButton(container);

    // Append the frequently bought together section to the product description
    const body = document.querySelector("body");
    appendBelowAddToCart(body, fbtForm);

    // Add event listener for form submission
    const itemIds = offerProducts.map((product) =>
        parseInt(product.id.split("/").pop()),
    );
    itemIds.push(currProduct.id);
    addSubmissionListener("#fbt-form", "fbt");
};
const insertUpgrade = (offerProducts, promotionId) => {
    // Create a form element for the frequently bought together section
    const fbtForm = document.createElement("form");
    fbtForm.action = "";
    fbtForm.id = "ug-form";

    // Create a title element for the frequently bought together section
    const title = document.createElement("h2");
    title.innerHTML = "Upgrade";
    fbtForm.appendChild(title);

    // Create a container element for the product cards
    const container = document.createElement("div");
    container.classList.add("ug-container");
    fbtForm.appendChild(container);

    // Insert the product cards for the offer products
    offerProducts.forEach((product) => {
        if (product) {
            // Add a plus symbol before each offer product card

            // Insert the product card for the offer product
            const option = document.createElement("input");
            option.type = "radio";
            option.name = "upgradeProduct";
            option.value = product.id;
            option.text = product.title;
            option.id = product.id;
            const upgradeRow = document.createElement("div");
            upgradeRow.classList.add("upgrade-row");
            upgradeRow.appendChild(option);

            insertProductCard({
                imgSrc: product.featuredImage.url,
                imgAlt: product.featuredImage.altText,
                productTitle: product.title,
                productPrice: product.variants.edges[0].node.price.amount,
                variants: product.variants.edges.map((variant) => variant.node),
                targetElement: upgradeRow,
                classData: "upgrade-product-card",
                discountAmount: 0,
            });
            container.appendChild(upgradeRow);
        }
    });

    // Insert the "Add to Cart" button
    insertAddToCartButton(container);

    // Append the frequently bought together section to the product description
    const body = document.querySelector("body");
    appendBelowAddToCart(body, fbtForm);

    // Add event listener for form submission
    const itemIds = offerProducts.map((product) =>
        parseInt(product.id.split("/").pop()),
    );
    itemIds.push(currProduct.id);
    addSubmissionListener("#ug-form", "ug");
};

const buildStyles = (styles, containerClass) => {
    console.log("styles: ", styles);
    console.log("containerClass: ", containerClass);
    const styleClasses = styles.classes;
    const styleTags = styles.tags;
    const styleIds = styles.ids;

    const currentStyle = document.getElementById("customACStyles");
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.id = "customACStyles";
    console.log("styleSheet: ", styleSheet);
    console.log("currentStyle: ", currentStyle);

    let styleString = "";
    if (styleClasses) {
        for (const [key, value] of Object.entries(styleClasses)) {
            console.log("key: ", key);
            console.log("value: ", value);
            styleString += `${containerClass} .${key} {`;
            for (const [prop, propValue] of Object.entries(value)) {
                styleString += `${prop}: ${propValue};`;
            }
            styleString += "}";
        }

        if (styleTags) {
            for (const [key, value] of Object.entries(styleTags)) {
                styleString += `${containerClass} ${key.toLowerCase()} {`;
                for (const [prop, propValue] of Object.entries(value)) {
                    styleString += `${prop}: ${propValue};`;
                }
                styleString += "}";
            }
        }

        if (styleIds) {
            for (const [key, value] of Object.entries(styleIds)) {
                styleString += `${containerClass} #${key} {`;
                for (const [prop, propValue] of Object.entries(value)) {
                    styleString += `${prop}: ${propValue};`;
                }
                styleString += "}";
            }
        }

        styleSheet.innerHTML = styleString;
        console.log("styleSheet: ", styleSheet);
    }

    if (currentStyle) {
        currentStyle.innerHTML = styleSheet.innerHTML;
    } else {
        document.head.appendChild(styleSheet);
    }
};

const insertFreeGift = (offerProducts, promotionId) => {
    // Create a form element for the frequently bought together section
    const fbtForm = document.createElement("form");
    fbtForm.action = "";
    fbtForm.id = "fbt-form";

    // Create a title element for the frequently bought together section
    const title = document.createElement("h2");
    title.innerHTML = "Free Gift";
    fbtForm.appendChild(title);

    // Create a container element for the product cards
    const container = document.createElement("div");
    container.classList.add("fbt-container");
    fbtForm.appendChild(container);

    // Insert the product card for the current product
    insertProductCard({
        imgSrc: currProduct?.media[0]?.src,
        altText: currProduct?.media[0]?.alt,
        productTitle: currProduct?.title,
        productPrice: `$${(currProduct?.variants[0]?.price / 100).toFixed(2)}`,
        variants: currProduct?.variants,
        targetElement: container,
        classData: "product-card",
        isGift: true,
    });

    // Insert the product cards for the offer products
    offerProducts.forEach((product) => {
        if (product) {
            // Add a plus symbol before each offer product card
            container.innerHTML += `<div class="triggerPlusSymbol">+</div>`;

            // Insert the product card for the offer product
            insertProductCard({
                imgSrc: product.featuredImage.url,
                altText: product.title,
                productTitle: product.title,
                productPrice: product.variants.edges[0].node.price.amount,
                variants: product.variants.edges.map((variant) => variant.node),
                targetElement: container,
            });
        }
    });
    console.log("container: ", container);
    // Insert the "Add to Cart" button
    insertAddToCartButton(container);

    // Append the frequently bought together section to the product description
    const body = document.querySelector("body");
    appendBelowAddToCart(body, fbtForm);

    // Add event listener for form submission
    const itemIds = offerProducts.map((product) =>
        parseInt(product.id.split("/").pop()),
    );
    itemIds.push(currProduct.id);
    addSubmissionListener("#fbt-form", "fbt");
};
const insertVolumeDiscount = (offerProducts, promotionId) => {
    // Create a form element for the volume discount section
    const vdForm = document.createElement("form");
    vdForm.action = "";
    vdForm.id = "vd-form";

    const volumeData = promotions.find(
        (promotion) => promotion.id === promotionId,
    )?.configuration?.volumes;

    // Create a title element for the volume discount section
    const title = document.createElement("h2");
    title.innerHTML = "Buy more, Save more";
    vdForm.appendChild(title);

    // Create a container element for the product cards
    const container = document.createElement("div");
    container.classList.add("vd-container");
    container.type = "radio";
    vdForm.appendChild(container);
    // show all the quanitities and their respective discounts as options in a form
    volumeData.forEach((volume) => {
        const quantity = volume.quantity;
        const discount = volume.value;

        // Create a radio button element
        const radioBtn = document.createElement("input");
        radioBtn.type = "radio";
        radioBtn.name = "volumeDiscount"; // Set a common name for all radio buttons in the list
        radioBtn.value = `${quantity}`; // Set the value as a combination of quantity and discount
        // Create a label for the radio button to display quantity and discount
        const label = document.createElement("label");
        label.textContent = `Buy ${quantity} and save ${discount}%`;

        // Append the radio button and label to the container
        container.appendChild(radioBtn);
        container.appendChild(label);

        // Add a line break for better readability
        container.appendChild(document.createElement("br"));
    });

    // Insert the "Add to Cart" button
    insertAddToCartButton(container);

    // Append the volume discount section to the product description
    const body = document.querySelector("body");
    appendBelowAddToCart(body, vdForm);

    // Add event listener for form submission
    addSubmissionListener("#vd-form", "volume");
};
//#endregion

//#region Add to Cart Helper Functions

const addSubmissionListener = (formId, type) => {
    document.querySelector(formId).addEventListener("submit", function (e) {
        e.preventDefault();
        let formData = {};
        //!TYPE 1: FBT
        if (type === "fbt") {
            // Get the selected variant for each selection in the form
            const selectedOptions = Array.from(
                document.querySelector(formId).elements,
            )
                .filter((el) => el.tagName === "SELECT")
                .map((el) => el.options[el.selectedIndex].value);

            // Create the form data to add items to the cart
            formData = {
                items: selectedOptions.map((id) => {
                    return {
                        id: id,
                        quantity: 1,
                        properties: {
                            __promotionData: JSON.stringify(
                                window.ac_promotionData,
                            ),
                        },
                    };
                }),
                sections:
                    "cart-items,cart-icon-bubble,cart-notification-button,cart-notification-product,cart-drawer",
            };
        }
        //! TYPE 2: VOLUME
        else if (type === "volume") {
            // Get the selected quantity and discount from the form
            const selectedQuantity = document.querySelector(
                `${formId} input[name="volumeDiscount"]:checked`,
            ).value;
            console.log(
                "🚀 ~ file: lib.js:689 ~ selectedQuantity:",
                selectedQuantity,
            );

            // Create the form data to add items to the cart
            formData = {
                items: [
                    {
                        id: currProduct.variants[0].id, //TODO add logic to get the correct variant ID when there are multiple options available
                        quantity: selectedQuantity,
                        properties: {
                            __promotionData: JSON.stringify(
                                window.ac_promotionData,
                            ),
                        },
                    },
                ],
                sections:
                    "cart-items,cart-icon-bubble,cart-notification-button,cart-notification-product,cart-drawer",
            };
            console.log("🚀 ~ file: lib.js:692 ~ formData:", formData);
        }
        //! TYPE 3: UPGRADE
        else if (type === "ug") {
            // Get the selected variant for each selection in the form
            const selectedRow = document
                .querySelector(`${formId} input[name="upgradeProduct"]:checked`)
                .parentElement.querySelector(".variant-selector");
            console.log("selectedRow: ", selectedRow);
            const selectedOption =
                selectedRow.options[selectedRow.selectedIndex].value;
            console.log("selectedOption: ", selectedOption);
            formData = {
                items: [
                    {
                        id: selectedOption,
                        quantity: 1,
                        properties: {
                            __promotionData: JSON.stringify(
                                window.ac_promotionData,
                            ),
                        },
                    },
                ],
                sections:
                    "cart-items,cart-icon-bubble,cart-notification-button,cart-notification-product,cart-drawer",
            };
            console.log("🚀 ~ file: lib.js:692 ~ formData:", formData);
        }
        // Send a POST request to add items to the cart
        fetch(window.Shopify.routes.root + "cart/add.js", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
            .then(async (response) => {
                const data = await response.json();
                console.log("data: ", data);
                if (data.items.length > 0) {
                    // Open the cart drawer if items were added to the cart
                    Object.entries(data.sections).forEach(([section, data]) => {
                        console.log("section: ", section, "data: ", data);
                        const docItem = document.querySelector(`#${section}`);
                        if (docItem) docItem.innerHTML = data;
                    });
                    const cart =
                        document.querySelector("#cart-notification") ??
                        document.querySelector("cart-drawer") ??
                        document.querySelector("#cart-drawer"); //Broadcast theme
                    cart.classList.add("active");
                    cart.classList.add("is-open");
                    cart.classList.add("drawer--is-open");
                }
                return data;
            })

            .catch((e) => {
                console.error(e);
            });
    });
};
function customFetchInterceptor(callback) {
    const originalFetch = window.fetch;

    window.fetch = async function (url, options) {
        const formData = options?.body;
        console.log("url: ", url);

        if (
            url.includes("cart/add") &&
            typeof formData !== "string" &&
            formData instanceof FormData
        ) {
            try {
                console.log("cart added!");
                const variantId = formData?.get("id");
                const quantity = formData?.get("quantity");
                const cartData = {
                    id: variantId,
                    quantity: quantity,
                    properties: {
                        __promotionData: JSON.stringify(
                            window.ac_promotionData,
                        ),
                    },
                    sections:
                        "cart-items,cart-icon-bubble,cart-notification-button,cart-notification-product,cart-drawer",
                };
                console.log("cartData: ", cartData);
                return await addToCart(cartData);
            } catch (error) {
                console.error("Error:", error);

                if (typeof callback === "function") {
                    callback(null, error);
                }

                throw error;
            }
        } else {
            const response = await originalFetch(url, options);
            if (typeof callback === "function") {
                callback(response);
            }

            return response;
        }
    };
}

const addToCart = async (formData) => {
    try {
        const response = await fetch(
            window.Shopify.routes.root + "cart/add.js",
            {
                method: "POST",
                body: JSON.stringify(formData),
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            },
        );
        console.log("response!: ", await response.clone().json());
        return response;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};
//#endregion

//#region Utility Functions
function gidToId(gid) {
    if (typeof gid !== "string") return gid;
    return gid.split("/").pop();
}
//#endregion

//#region Main
mainPromotionManager(promotions);

customFetchInterceptor(async (response) => {
    // This callback function will be called after each fetch call
    // You can perform any custom actions here with the response
});
console.log("end of lib.js!");

//,PromotionData shape
/**
 *, {
 *,      frequentlyBoughtTogether:{
 *,              promotionId: number,
 *,              itemIds: number[]
 *,      },
 *,     volumeDiscount:{
 *,             promotionId: number,
 *,     },
 *,      addonDiscount:{
 *,       promotionId: number,
 *,              itemIds: number[]
 *,     }
 *,      collections: string[],
 *,            tags: string[],
 *,
 *, }
 */

//#endregion
