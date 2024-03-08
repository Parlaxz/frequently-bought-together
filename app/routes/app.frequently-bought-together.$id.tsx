import type { ActionFunctionArgs } from "@remix-run/node";

import { json, useLoaderData } from "@remix-run/react";
import {
    CombinationCard,
    DiscountClass,
} from "@shopify/discount-app-components";
import { Card, ChoiceList } from "@shopify/polaris";

import shopifyServer, {
    authenticate,
    unauthenticated,
} from "../shopify.server";
import {
    getPromotion,
    updatePromotions,
} from "~/framework/lib/helpers/metafields";
import { initFunctionalDiscount } from "~/framework/lib/helpers/functionalDiscount";
import { useDiscountForm } from "~/framework/lib/helpers/hooks";
import { getAllTags } from "~/framework/components/form/TagPicker";
import ProductPicker from "~/framework/components/form/ProductPicker";
import DiscountSettingsCard from "~/framework/components/form/DiscountSettingsCard";
import TextBox from "~/framework/components/form/TextBox";
import PromotionMetadataCard from "~/framework/components/form/PromotionMetadataCard";
import PromoPage from "~/framework/components/form/PromoPage";

/**
 * Loads the data for the frequently bought together app.
 * @param params - The parameters for the action.
 * @param request - The request object.
 * @returns A Promise that resolves to an object containing the discount data and tags.
 */
export const loader = async ({ params, request }: ActionFunctionArgs) => {
    // 1. get prerequisites via parsing the request and params
    const { id } = params;
    const { admin } = await authenticate.admin(request);
    // 2. get tags
    const { storefront } = await unauthenticated.storefront(
        "appdevelopment-ac.myshopify.com",
    );
    const tags = await getAllTags(storefront);

    // 3. If a new discount is being created, return an empty discount object.
    if (id === "new") {
        return json({ discount: null, tags });
    }
    // 4. If an existing discount is being edited, return the discount data.
    const returnData = await getPromotion(admin, id ?? "");
    return json({ discount: returnData, tags });
};

// This is a server-side action that is invoked when the form is submitted.
// It makes an admin GraphQL request to create a discount.
export const action = async ({ params, request }: ActionFunctionArgs) => {
    const promoName = "frequentlyBoughtTogether";
    // 1. get prerequisites from the request and params
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

//------------------------------------CONFIGURE HERE------------------------------------
const NAMESPACE = "$app:upsellApp";
const KEY = "function-configuration";
//----------------------------------END CONFIGURE HERE

export default function FrequentlyBoughtTogether() {
    //build discount data
    const loaderData: any = useLoaderData();
    const { tags } = loaderData;

    //------------------------------------CONFIGURE HERE------------------------------------
    interface ConfigShape {
        target: {
            type: "product" | "tag" | "collection";
            value: string[];
        };
        offerItems: {
            type: "product" | "tag" | "collection";
            value: string[];
            numItems: number;
        };
        offerDiscount: { type: string; value: string; offerOnly: boolean };
        metadata: {
            title: string;
            discountMessage: string;
            appliesTo: string;
            placement: string;
            priority: number;
        };
    }
    const loaderConfig = loaderData?.discount?.configuration;
    const config: ConfigShape = {
        target: {
            type: loaderConfig?.target?.type ?? "product",
            value: loaderConfig?.target?.value ?? [],
        },
        offerItems: {
            type: loaderConfig?.offerItems?.type ?? "product",
            value: loaderConfig?.offerItems?.value ?? [],
            numItems: loaderConfig?.offerItems?.numItems ?? 1,
        },
        offerDiscount: {
            type: loaderConfig?.offerDiscount?.type ?? "percentage",
            value: loaderConfig?.offerDiscount?.value ?? "0",
            offerOnly: loaderConfig?.offerDiscount?.offerOnly ?? false,
        },
        metadata: {
            discountMessage: loaderConfig?.metadata?.discountMessage ?? "",
            title: loaderConfig?.metadata?.title ?? "",
            appliesTo: loaderConfig?.metadata?.appliesTo ?? "all",
            placement: loaderConfig?.metadata?.placement ?? "productPage",
            priority: loaderConfig?.metadata?.priority ?? 0,
        },
    };

    //load form
    const { isNew, redirect, isLoading, errorBanner, fields, submit } =
        useDiscountForm(config);
    const { combinesWith, configuration } = fields;
    //end load form

    const nonEmptyFields = [
        configuration?.metadata?.title,
        configuration?.metadata?.discountMessage,
    ];
    //----------------------------------END CONFIGURE HERE

    return (
        <PromoPage
            isNew={isNew}
            redirect={redirect}
            submit={submit}
            isLoading={isLoading}
            errorBanner={errorBanner}
            nonEmptyFields={nonEmptyFields}
            title={"Frequently Bought Together"}
            subtitle={
                "This promotion encourages customers to buy multiple products together by displaying a pack of products at a discounted price."
            }
        >
            {/* TODO: Preview Image */}
            {/* TODO: Description of the promotion */}

            <PromotionMetadataCard configuration={configuration} />

            <ProductPicker
                type={configuration.target.type}
                value={configuration.target.value}
                tags={tags}
                label={"Target Products"}
            />
            <Card>
                <ProductPicker
                    type={configuration.offerItems.type}
                    value={configuration.offerItems.value}
                    tags={tags}
                    label="Offer Products"
                    isCard={false}
                />
                <TextBox
                    field={configuration.offerItems.numItems}
                    label="Number of Items"
                    variant="number"
                    minimum={1}
                    maximum={4}
                />
            </Card>
            <DiscountSettingsCard
                type={configuration.offerDiscount.type}
                value={configuration.offerDiscount.value}
                label="Discount Settings"
            >
                <ChoiceList
                    title="Applies To"
                    choices={[
                        { label: "All Products", value: "all" },
                        {
                            label: "Offer Products Only",
                            value: "offer",
                        },
                    ]}
                    selected={[configuration.metadata.appliesTo.value]}
                    onChange={(val) => {
                        configuration.metadata.appliesTo.onChange(val[0]);
                    }}
                />
            </DiscountSettingsCard>

            {/* TODO: Priority:
                Number Used to decide how important this promo is if others of the
                same type are shown */}
            <div className="hidden">
                <CombinationCard
                    combinableDiscountTypes={combinesWith}
                    discountClass={DiscountClass.Product}
                    discountDescriptor={"Discount"}
                />
            </div>
        </PromoPage>
    );
}
/**
 * Generates a randomly generated ID.
 * @returns {string} The randomly generated ID.
 */
const randomlyGeneratedId = () => {
    return Math.random().toString(36).substr(2, 9);
};
