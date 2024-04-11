import { buildStyles } from "./SnippetPreview";

const currProduct = {
    media: [{ src: "https://via.placeholder.com/150", alt: "product image" }],
    title: "Product Title",
    variants: [{ price: 10000 }],
};

export const insertFrequentlyBoughtTogether = (
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
    title.innerHTML = configuration.texts.containerTitle.value; //! containerTitle.value needed if in snippetPreview
    fbtForm.appendChild(title);

    // Create a container element for the product cards
    const container = document.createElement("div");
    container.classList.add("fbt-container");
    fbtForm.appendChild(container);
    console.log("currProduct: ", currProduct);

    console.log("offerProducts: ", offerProducts);
    // Insert the product card for the current product
    const discountAmount = getDiscount(configuration);
    console.log("discountAmount: ", discountAmount);
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
    console.log("productPrice: ", productPrice);
    console.log("newPrice: ", newPrice);
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
    if (variantSelector)
        //@ts-ignore
        variantSelector.innerHTML = variants.map((variant) => {
            return `<option value="${gidToId(variant.id)}">${variant.title}</option>`;
        });
    return variantSelector;
}
function gidToId(gid) {
    if (typeof gid !== "string") return gid;
    return gid.split("/").pop();
}
function appendBelowAddToCart(parentElement, elementToAppend) {
    const placeAfter = (element, before) =>
        before?.parentNode?.insertBefore(element, before.nextSibling);
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

export const insertVolumeDiscount = (volumeData) => {
    // Create a form element for the volume discount section
    const vdForm = document.createElement("form");
    vdForm.action = "";
    vdForm.id = "vd-form";

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
export const insertUpgrade = (offerProducts, promotionId) => {
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

const addSubmissionListener = (formId, type) => {
    return null;
};
const getDiscount = (configuration) => {
    console.log("configuration: ", configuration);
    if (configuration?.offerDiscount) {
        return {
            value: configuration.offerDiscount.value.value,
            type: configuration.offerDiscount.type.value,
        };
    }
    return { value: 0, type: "percentage" };
};
