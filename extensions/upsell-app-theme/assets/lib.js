const currProduct = window.currProduct;
const storefrontToken = window.storefrontToken;
const promotions = window.promotions;
const shopUrl = window.shopUrl;

//-----------------Promotion Functions-----------------//

/**
 * Checks if a promotion is triggered based on its configuration and the current product.
 * @param {Object} promotion - The promotion object.
 * @returns {boolean} - Returns true if the promotion is triggered, false otherwise.
 */
async function isTriggerProduct(promotion) {
    const triggerType = promotion?.configuration?.target?.type;
    const triggerValue = promotion?.configuration?.target?.value;
    console.log("triggerType: ", triggerType);
    if (triggerType === "product") {
        const triggerProducts = triggerValue.map((trigger) => trigger.handle);
        if (triggerProducts.includes(currProduct.handle)) {
            return true;
        }
    } else if (triggerType === "collection") {
        try {
            const collections = await getCollectionsForProduct(
                currProduct.handle,
            );
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
        //TODO: TEST THIS
        const productTags = currProduct.tags.map((tag) => tag.toLowerCase());
        if (productTags.some((tag) => triggerValue.includes(tag))) {
            return true;
        }
    }
    return false;
}

/**
 * Retrieves the offer products based on the given promotion.
 *
 * @param {Object} promotion - The promotion object.
 * @returns {Promise<Array>} - A promise that resolves to an array of offer products.
 */
const getOfferProducts = async (promotion) => {
    // ALOT of work needs to be done here for the collection and tag types
    // the issue is that they return arrays and choosing which product to display
    // is not clear
    //array of products, collections or tags
    const offerValue = promotion?.configuration?.offerItems?.value;
    //can be product or collection or tag
    const offerType = promotion?.configuration?.offerItems.type;

    let offerProducts = [];
    const offerCollections = [];

    if (offerType === "collection") {
        const offerHandles = offerValue.map((value) => value.handle);
        for (const productHandle of offerHandles) {
            const product = await getCollectionByHandle(productHandle);
            offerCollections.push(product);
        }
        offerProducts = offerCollections.map((collection) => {
            if (
                collection.products.edges[0].node.handle === currProduct.handle
            ) {
                return collection.products.edges[1].node;
            }
            return collection.products.edges[0].node;
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

/**
 * Builds promotions based on the provided array of promotions.
 * @param {Array} promotions - The array of promotions to build.
 * @returns {Promise<void>} - A promise that resolves when the promotions are built.
 */
const buildPromotions = async (promotions) => {
    //steps
    //1. sort promotions by priority
    promotions = promotions.sort((a, b) => {
        return (
            a.configuration.metadata.priority -
            b.configuration.metadata.priority
        );
    });

    const isProductPage = window.location.pathname.includes("/products/");
    //2. break the promotions apart to each type
    //3. for each type, find the first triggered promotion
    //4. get the offer products for the triggered promotion
    const promotionTypes = [
        {
            type: "frequentlyBoughtTogether",
            promotions: promotions.filter(
                (promotion) => promotion.type === "frequentlyBoughtTogether",
            ),
            page: "product",
            function: insertFrequentlyBoughtTogether,
        },
    ];

    promotionTypes.forEach(async (promotionType) => {
        //productPage promotions
        if (promotionType.page === "product" && isProductPage) {
            for (const promotion of promotionType.promotions) {
                const isTrigger = await isTriggerProduct(promotion);
                if (isTrigger) {
                    const offerProducts = await getOfferProducts(promotion);
                    promotionType.function(offerProducts, promotion.id);
                    break;
                }
            }
        }
        //need another condition for the cart page and announcement bar
    });
};

//-----------------API Functions-----------------//
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
    console.log("apiUrl: ", apiUrl);
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

//-----------------Builder Functions-----------------//
function insertProductCard(
    imgSrc,
    imgAlt,
    productTitle,
    productPrice,
    variants,
    targetElement,
) {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = ` <div class="product-preview">
        <div class="product-preview__image">
                <img src="${imgSrc}" alt="${imgAlt}" width="100" height="100"/>
                </div>
                <div class="product-preview__details">
                <h3>${productTitle}</h3>
                <p>${productPrice}</p>
                </div>
                </div>`;
    card.appendChild(insertvariantSelector(variants));
    targetElement.appendChild(card);
}
function insertAddToCartButton(targetElement) {
    const button = document.createElement("button");
    button.classList.add("add-to-cart");
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
const insertFrequentlyBoughtTogether = (offerProducts, promotionId) => {
    // Create a form element for the frequently bought together section
    const fbtForm = document.createElement("form");
    fbtForm.action = "";
    fbtForm.id = "fbt-form";

    // Create a title element for the frequently bought together section
    const title = document.createElement("h2");
    title.innerHTML = "Frequently Bought Together";
    fbtForm.appendChild(title);

    // Create a container element for the product cards
    const container = document.createElement("div");
    container.classList.add("fbt-container");
    fbtForm.appendChild(container);

    // Insert the product card for the current product
    insertProductCard(
        currProduct?.media[0]?.src,
        currProduct?.media[0]?.alt,
        currProduct?.title,
        `$${(currProduct?.variants[0]?.price / 100).toFixed(2)}`,
        currProduct?.variants,
        container,
    );

    // Insert the product cards for the offer products
    offerProducts.forEach((product) => {
        if (product) {
            // Add a plus symbol before each offer product card
            container.innerHTML += `<div class="triggerPlusSymbol">+</div>`;

            // Insert the product card for the offer product
            insertProductCard(
                product.featuredImage.url,
                product.featuredImage.altText,
                product.title,
                product.variants.edges[0].node.price.amount,
                product.variants.edges.map((variant) => variant.node),
                container,
            );
        }
    });

    // Insert the "Add to Cart" button
    insertAddToCartButton(container);

    // Append the frequently bought together section to the product description
    var productDescription = document.querySelector(".product__title");
    productDescription.appendChild(fbtForm);
    // Add event listener for form submission
    const itemIds = offerProducts.map((product) =>
        parseInt(product.id.split("/").pop()),
    );
    itemIds.push(currProduct.id);
    addSubmissionListener("#fbt-form", promotionId, itemIds);
};
//-----------------Helper Functions-----------------//
function gidToId(gid) {
    if (typeof gid !== "string") return gid;
    return gid.split("/").pop();
}

const addSubmissionListener = (formId, promotionId, itemIds) => {
    document.querySelector(formId).addEventListener("submit", function (e) {
        e.preventDefault();

        // Get the selected variant for each selection in the form
        const selectedOptions = Array.from(
            document.querySelector(formId).elements,
        )
            .filter((el) => el.tagName === "SELECT")
            .map((el) => el.options[el.selectedIndex].value);

        // Create the form data to add items to the cart
        let formData = {
            items: selectedOptions.map((id) => {
                return {
                    id: id,
                    quantity: 1,
                    properties: {
                        _promotionData: JSON.stringify({
                            promotionId,
                            itemIds,
                        }),
                    },
                };
            }),
        };
        console.log("formData: ", formData);
        // Send a POST request to add items to the cart
        fetch(window.Shopify.routes.root + "cart/add.js", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
            .then((response) => {
                return response.json();
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    });
};
function customFetchInterceptor(callback) {
    const originalFetch = window.fetch;

    window.fetch = async function (url, options) {
        console.log("Fetching:", url, options);
        const formData = options?.body;
        console.log("url: ", url);
        console.log("formData: ", formData);
        // console.log("originalFetch: ", originalFetch.toString());
        if (
            //     false &&
            url.includes("cart/add") &&
            typeof formData !== "string" &&
            formData instanceof FormData
        ) {
            try {
                console.log("cart added!");
                const variantId = formData?.get("id");
                const productId = formData?.get("product-id");
                const quantity = formData?.get("quantity");
                const promotionData = formData?.get("properties");
                console.log("variantId: ", variantId);
                console.log("productId: ", productId);
                console.log("quantity: ", quantity);
                console.log("promotionData: ", promotionData);
                const response = await fetch(
                    window.Shopify.routes.root + "cart/add.js",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            id: variantId,
                            quantity: quantity,
                            properties: {
                                _promotionData: JSON.stringify({
                                    placeholder: "placeholder",
                                    itemIds: [1, 2, 3],
                                }),
                            },
                            sections:
                                "cart-items,cart-icon-bubble,cart-notification-button,cart-notification-product,cart-drawer",
                        }),
                    },
                );
                console.log("response: ", response);
                return response;
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

//-----------------Run -----------------//
customFetchInterceptor(async (response) => {
    // This callback function will be called after each fetch call
    // You can perform any custom actions here with the response
});
console.log("end of lib.js!");
buildPromotions(promotions);
