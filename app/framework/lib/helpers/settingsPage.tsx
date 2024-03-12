import { json } from "@remix-run/react";
import { getAllTags } from "~/framework/components/form/TagPicker";

import { getPromotion, updatePromotions } from "./metafields";
import { initFunctionalDiscount } from "./functionalDiscount";
import shopifyServer, { authenticate, unauthenticated } from "~/shopify.server";

export const runSettingsPageLoader = async (params: any, request: any) => {
    // Step 1. get prerequisites via parsing the request and params
    const { id } = params;
    const { admin } = await authenticate.admin(request);
    // Step 2. get tags
    const { storefront } = await unauthenticated.storefront(
        "appdevelopment-ac.myshopify.com",
    );
    const tags = await getAllTags(storefront);

    // Step 3. If a new discount is being created, return an empty discount object.
    if (id === "new") {
        return json({ discount: null, tags });
    }
    // Step 4. If an existing discount is being edited, return the discount data.
    const returnData = await getPromotion(admin, id ?? "");
    return json({ discount: returnData, tags });
};

export const runSettingsPageAction = async (
    params: any,
    request: any,
    NAMESPACE: string,
    KEY: string,
    promoName: string,
) => {
    let { id } = params;
    const { admin, session } = await shopifyServer.authenticate.admin(request);

    // 2. Generate a random ID if it's a new discount.
    if (id === "new") {
        id = randomlyGeneratedId();
    }

    //2. get and parse form data
    const formData = await request.formData();
    const parsedDiscount = JSON.parse(String(formData.get("discount") || ""));
    //3. Save the discount in the metafields in the promotion
    const promotionDiscount = {
        ...parsedDiscount,
        title:
            parsedDiscount?.configuration?.metadata?.title ??
            parsedDiscount.title,
        id: id,
        type: promoName,
    };
    await updatePromotions(admin, session, promotionDiscount);
    //4. Check if a functional discount exists, if not create one
    await initFunctionalDiscount(
        admin,
        parsedDiscount,
        NAMESPACE,
        KEY,
        "upsellApp",
        promoName,
    );

    return json({ status: "success" });
};
/**
 * Generates a randomly generated ID.
 * @returns {string} The randomly generated ID.
 */
const randomlyGeneratedId = () => {
    return Math.random().toString(36).substr(2, 9);
};

export const getMetadata = (metadata: any) => {
    return {
        discountMessage: metadata?.discountMessage ?? "",
        title: metadata?.title ?? "",
        appliesTo: metadata?.appliesTo ?? "all",
        placement: metadata?.placement ?? "productPage",
        priority: metadata?.priority ?? 0,
    };
};

export interface ProductSelection {
    type: "product" | "tag" | "collection";
    value: string[];
    numItems?: number;
}
export interface ConfigMetadata {
    title: string;
    discountMessage: string;
    appliesTo: string;
    placement: string;
    priority: number;
}
export interface ConfigDiscount {
    type: string;
    value: string;
    offerOnly: boolean;
}
