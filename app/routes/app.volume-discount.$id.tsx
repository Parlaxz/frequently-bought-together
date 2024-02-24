import type { ActionFunctionArgs } from "@remix-run/node";

import { Form, json, useLoaderData } from "@remix-run/react";
import {
    CombinationCard,
    DiscountClass,
    onBreadcrumbAction,
} from "@shopify/discount-app-components";
import {
    Layout,
    Page,
    PageActions,
    BlockStack,
    Card,
    Text,
} from "@shopify/polaris";

import shopifyServer, {
    authenticate,
    unauthenticated,
} from "../shopify.server";
import {
    getPromotion,
    updatePromotions,
} from "~/framework/lib/helpers/metafields";
import {
    createFunctionalDiscount,
    getFunctionId,
} from "~/framework/lib/helpers/functionalDiscount";
import { useDiscountForm } from "~/framework/lib/helpers/hooks";
import { getAppDiscountNodes } from "~/framework/lib/helpers/discounts";
import { getAllTags } from "~/framework/components/form/TagPicker";
import ProductPicker from "~/framework/components/form/ProductPicker";
import TextBox from "~/framework/components/form/TextBox";
import VolumeDiscountCard from "~/framework/components/form/VolumeDiscountCard";

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

/**
 * Generates a randomly generated ID.
 * @returns {string} The randomly generated ID.
 */
const randomlyGeneratedId = () => {
    return Math.random().toString(36).substr(2, 9);
};

// This is a server-side action that is invoked when the form is submitted.
// It makes an admin GraphQL request to create a discount.
export const action = async ({ params, request }: ActionFunctionArgs) => {
    // 1. get prerequisites from the request and params
    let { id } = params;
    const { admin } = await shopifyServer.authenticate.admin(request);

    // 2. Generate a random ID if it's a new discount.
    if (id === "new") {
        id = randomlyGeneratedId();
    }

    //2. get and parse form data
    const formData = await request.formData();
    const parsedDiscount = JSON.parse(String(formData.get("discount") || ""));

    //3. Check if a functional discount exists, if not create one
    const existingDiscount = await getAppDiscountNodes(admin);
    const discountTitle = "Don't-Delete--AC-Promotion-Discount-Manager";

    const discountManagerExists = existingDiscount
        .map((discount: any) => {
            return discount.discount.title === discountTitle;
        })
        .includes(true);
    if (!discountManagerExists) {
        const discountManager = {
            ...parsedDiscount,
            title: discountTitle,
            type: "volumeDiscount",
        };
        const functionId = await getFunctionId(admin, "upsellApp");

        return createFunctionalDiscount({
            admin,
            functionId,
            discount: discountManager,
            namespace: NAMESPACE,
            key: KEY,
        });
        //TODO: create discount for free shipping
    }
    //4. Save the discount in the metafields in the promotion
    const promotionDiscount = {
        ...parsedDiscount,
        title: parsedDiscount.title,
        id: id,
        type: "volumeDiscount",
    };
    await updatePromotions(admin, promotionDiscount);

    return json({ status: "success" });
};

//------------------------------------CONFIGURE HERE------------------------------------
const NAMESPACE = "$app:upsellApp";
const KEY = "function-configuration";
//----------------------------------END CONFIGURE HERE-----------------------------------

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

        volumes: {
            type: "percentage" | "fixedAmount";
            value: number;
        }[];
    }

    const config: ConfigShape = {
        target: {
            type:
                loaderData?.discount?.configuration?.target?.type ?? "product",
            value: loaderData?.discount?.configuration?.target?.value ?? [],
        },
        volumes: loaderData?.discount?.configuration?.volumes ?? [
            { type: "percentage", value: 0 },
        ],
    };
    //----------------------------------END CONFIGURE HERE-----------------------------------

    const { isNew, redirect, isLoading, errorBanner, fields, submit } =
        useDiscountForm(config);
    const { discountTitle, combinesWith, configuration } = fields;
    return (
        <Page
            title={isNew ? "New discount" : "Edit discount"}
            backAction={{
                content: "Discounts",
                onAction: () => onBreadcrumbAction(redirect, true),
            }}
            primaryAction={{
                content: "Save",
                onAction: submit,
                loading: isLoading,
            }}
        >
            <Layout>
                {errorBanner}
                <Layout.Section>
                    <Form method="post">
                        <BlockStack align="space-around" gap={"200"}>
                            {isNew && (
                                <Card>
                                    <Text variant="headingMd" as="h2">
                                        Frequently Bought Together
                                    </Text>
                                    <TextBox
                                        label="Discount Title"
                                        field={discountTitle}
                                    />
                                </Card>
                            )}
                            <ProductPicker
                                type={configuration.target.type}
                                value={configuration.target.value}
                                tags={tags}
                                label={"Target Products"}
                            />
                            <VolumeDiscountCard
                                volumes={configuration.volumes}
                            />
                            {/* TODO: Discount message to show in cart when discount is applied */}
                            {/* TODO: Apply To Input
                            Decide if to apply to the discount to all products or offer 
                            products only */}
                            {/* TODO:  */}
                            {/* TODO: Priority:
                            Number Used to decide how important this promo is if others of the
                            same type are shown */}
                            {/* TODO: Preview Image */}
                            {/* TODO: Description of the promotion */}
                            <div className="hidden">
                                <CombinationCard
                                    combinableDiscountTypes={combinesWith}
                                    discountClass={DiscountClass.Product}
                                    discountDescriptor={"Discount"}
                                />
                            </div>
                        </BlockStack>
                    </Form>
                </Layout.Section>
                <Layout.Section></Layout.Section>
                <Layout.Section>
                    <PageActions
                        primaryAction={{
                            content: "Save discount",
                            onAction: submit,
                            loading: isLoading,
                        }}
                        secondaryActions={[
                            {
                                content: "Discard",
                                onAction: () =>
                                    onBreadcrumbAction(redirect, true),
                            },
                        ]}
                    />
                </Layout.Section>
            </Layout>
        </Page>
    );
}
