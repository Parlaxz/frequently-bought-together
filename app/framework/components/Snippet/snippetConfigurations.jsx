import {
    insertFrequentlyBoughtTogether,
    insertUpgrade,
    insertVolumeDiscount,
} from "./snippetHelpers";

export const fbtSnippetConfig = {
    offerProducts: [
        {
            featuredImage: {
                url: "https://via.placeholder.com/150",
                altText: "",
            },
            title: "Offer Product 1",
            variants: { edges: [{ node: { price: { amount: 100 } } }] },
            id: "gid://shopify/Product/1",
        },
        {
            featuredImage: {
                url: "https://via.placeholder.com/150",
                altText: "",
            },
            title: "Offer Product 1",
            variants: { edges: [{ node: { price: { amount: 100 } } }] },
            id: "gid://shopify/Product/1",
        },
    ],
    identifiers: [
        {
            type: "class",
            value: "old-price",
            ret: true,
        },
        {
            type: "class",
            value: "new-price",
            ret: true,
        },
        {
            type: "tag",
            value: "H3",
            ret: false,
        },
        {
            type: "id",
            value: "appComponentContainer",
            ret: true,
        },
        {
            type: "tag",
            value: "H2",
            ret: true,
        },
        {
            type: "tag",
            value: "P",
            ret: true,
        },
        {
            type: "class",
            value: "fbt-container",
            ret: true,
        },
        {
            type: "class",
            value: "product-card",
            ret: true,
        },
        {
            type: "class",
            value: "variant-selector",
            ret: true,
        },
        {
            type: "class",
            value: "promo-add-to-cart",
            ret: true,
        },
        {
            type: "tag",
            value: "IMG",
            ret: true,
        },
        {
            type: "class",
            value: "triggerPlusSymbol",
            ret: true,
        },
    ],
    insertFunction: insertFrequentlyBoughtTogether,
    formId: "#fbt-form",
};
export const vdSnippetConfig = {
    offerProducts: [
        {
            featuredImage: {
                url: "https://via.placeholder.com/150",
                altText: "",
            },
            title: "Offer Product 1",
            variants: { edges: [{ node: { price: { amount: 100 } } }] },
            id: "gid://shopify/Product/1",
        },
        {
            featuredImage: {
                url: "https://via.placeholder.com/150",
                altText: "",
            },
            title: "Offer Product 1",
            variants: { edges: [{ node: { price: { amount: 100 } } }] },
            id: "gid://shopify/Product/1",
        },
    ],
    identifiers: [
        {
            type: "tag",
            value: "H3",
            ret: false,
        },
        {
            type: "id",
            value: "appComponentContainer",
            ret: true,
        },
        {
            type: "tag",
            value: "H2",
            ret: true,
        },
        {
            type: "tag",
            value: "P",
            ret: true,
        },
        {
            type: "class",
            value: "vd-container",
            ret: true,
        },
        {
            type: "class",
            value: "product-card",
            ret: true,
        },
        {
            type: "class",
            value: "variant-selector",
            ret: true,
        },
        {
            type: "class",
            value: "promo-add-to-cart",
            ret: true,
        },
        {
            type: "tag",
            value: "IMG",
            ret: true,
        },
        {
            type: "class",
            value: "triggerPlusSymbol",
            ret: true,
        },
    ],
    insertFunction: insertVolumeDiscount,
    formId: "#vd-form",
};
export const ugSnippetConfig = {
    offerProducts: [
        {
            featuredImage: {
                url: "https://via.placeholder.com/150",
                altText: "",
            },
            title: "Offer Product 1",
            variants: { edges: [{ node: { price: { amount: 100 } } }] },
            id: "gid://shopify/Product/1",
        },
        {
            featuredImage: {
                url: "https://via.placeholder.com/150",
                altText: "",
            },
            title: "Offer Product 1",
            variants: { edges: [{ node: { price: { amount: 100 } } }] },
            id: "gid://shopify/Product/1",
        },
    ],
    identifiers: [
        {
            type: "tag",
            value: "H3",
            ret: false,
        },
        {
            type: "id",
            value: "appComponentContainer",
            ret: true,
        },
        {
            type: "tag",
            value: "H2",
            ret: true,
        },
        {
            type: "tag",
            value: "P",
            ret: true,
        },
        {
            type: "class",
            value: "vd-container",
            ret: true,
        },
        {
            type: "class",
            value: "product-card",
            ret: true,
        },
        {
            type: "class",
            value: "variant-selector",
            ret: true,
        },
        {
            type: "class",
            value: "promo-add-to-cart",
            ret: true,
        },
        {
            type: "tag",
            value: "IMG",
            ret: true,
        },
        {
            type: "class",
            value: "triggerPlusSymbol",
            ret: true,
        },
    ],
    insertFunction: insertUpgrade,
    formId: "#ug-form",
};
