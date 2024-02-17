import type { ActionFunctionArgs } from "@remix-run/node";

import { Form, json } from "@remix-run/react";
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
    TextField,
    Text,
    ChoiceList,
} from "@shopify/polaris";

import shopifyServer, { authenticate } from "../shopify.server";

import { useDiscountForm } from "framework/lib/discounts/functional/hooks";
import {
    createFunctionalDiscount,
    getFunctionId,
    getFunctionalDiscount,
    updateFunctionalDiscount,
} from "framework/lib/discounts/functional/helpers";
import { ResourcePicker } from "framework/components/form/ResourcePicker";
import { getAppMetafields } from "framework/lib/metafields/helpers";

//------------------------------------CONFIGURE HERE------------------------------------
const NAMESPACE = "$app:upsellApp";
const KEY = "function-configuration";
//----------------------------------END CONFIGURE HERE-----------------------------------

export const loader = async ({ params, request }: ActionFunctionArgs) => {
    const { id } = params;
    const { admin } = await authenticate.admin(request);
    const metafields = await getAppMetafields(admin);
    console.log("metafields", metafields.edges[0].node);
    if (id === "new") {
        return json({ discount: null });
    }

    const returnData = await getFunctionalDiscount(id, admin, NAMESPACE, KEY);
    return json({ discount: returnData });
};

// This is a server-side action that is invoked when the form is submitted.
// It makes an admin GraphQL request to create a discount.
export const action = async ({ request }: ActionFunctionArgs) => {
    //1. get prerequisites
    const { admin } = await shopifyServer.authenticate.admin(request);
    const functionId = await getFunctionId(admin, "upsellApp");

    //2. get and parse form data
    const formData = await request.formData();

    const parsedDiscount = JSON.parse(String(formData.get("discount") || ""));
    const parsedId = String(formData.get("id") || "");
    const parsedMetafieldId = String(formData.get("metafieldId") || "");
    //3. create Discount
    if (parsedId) {
        return updateFunctionalDiscount({
            admin,
            functionId,
            discount: parsedDiscount,
            id: parsedId,
            metafieldId: parsedMetafieldId,
        });
    } else {
        return createFunctionalDiscount({
            admin,
            functionId,
            discount: parsedDiscount,
            namespace: NAMESPACE,
            key: KEY,
        });
    }
};
export interface ConfigShape {
    target: {
        type: "product" | "tag" | "collection";
        value: string[];
    };
    offerItems: { type: "product" | "tag" | "collection"; value: string[] };
    offerDiscount: { type: string; value: string; offerOnly: boolean };
}
// This is the React component for the page.
export default function DiscountNew() {
    //build discount data

    const config: ConfigShape = {
        target: {
            type: "product",
            value: [],
        },
        offerItems: {
            type: "product",
            value: [],
        },
        offerDiscount: {
            type: "percentage",
            value: "10",
            offerOnly: false,
        },
    };

    const { isNew, redirect, isLoading, errorBanner, fields, submit } =
        useDiscountForm(config);
    const { discountTitle, combinesWith, configuration } = fields;
    console.log("configuration", configuration);

    return (
        // Render a discount form using Polaris components and the discount app components
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
                                    <TextField
                                        label="Discount Title"
                                        autoComplete="on"
                                        {...discountTitle}
                                    />
                                </Card>
                            )}
                            <Card>
                                <BlockStack gap={"200"}>
                                    <Text variant="headingMd" as="h2">
                                        Target Products
                                    </Text>
                                    <ChoiceList
                                        title="Trigger Type"
                                        choices={[
                                            {
                                                label: "Product",
                                                value: "product",
                                            },
                                            {
                                                label: "Collection",
                                                value: "collection",
                                            },
                                            {
                                                label: "Tag",
                                                value: "tag",
                                            },
                                        ]}
                                        {...configuration.target.type}
                                        selected={
                                            configuration.target.type.value
                                        }
                                        onChange={(value) => {
                                            configuration.target.type.onChange(
                                                value[0],
                                            );
                                        }}
                                    />
                                    {configuration.target.type.value ===
                                    "tag" ? (
                                        <>tag</>
                                    ) : configuration.target.type.value ===
                                      "collection" ? (
                                        <ResourcePicker
                                            label="Pick your Trigger Collections"
                                            {...configuration.target.value}
                                            isCollection
                                        />
                                    ) : configuration.target.type.value ===
                                      "product" ? (
                                        <ResourcePicker
                                            label="Pick your Trigger Products"
                                            {...configuration.target.value}
                                        />
                                    ) : (
                                        <></>
                                    )}
                                </BlockStack>
                            </Card>
                            <Card>
                                <BlockStack gap={"200"}>
                                    <Text variant="headingMd" as="h2">
                                        Offer Products
                                    </Text>

                                    <ChoiceList
                                        title="Offer Type"
                                        choices={[
                                            {
                                                label: "Product",
                                                value: "product",
                                            },
                                            {
                                                label: "Collection",
                                                value: "collection",
                                            },
                                            {
                                                label: "Tag",
                                                value: "tag",
                                            },
                                        ]}
                                        {...configuration.target.type}
                                        selected={
                                            configuration.target.type.value
                                        }
                                        onChange={(value) => {
                                            configuration.target.type.onChange(
                                                value[0],
                                            );
                                        }}
                                    />
                                    {configuration.target.type.value ===
                                    "tag" ? (
                                        <>tag</>
                                    ) : configuration.target.type.value ===
                                      "collection" ? (
                                        <ResourcePicker
                                            label="Pick your Offer Collections"
                                            {...configuration.target.value}
                                            isCollection
                                        />
                                    ) : configuration.target.type.value ===
                                      "product" ? (
                                        <ResourcePicker
                                            label="Pick your Offer Products"
                                            {...configuration.target.value}
                                        />
                                    ) : (
                                        <></>
                                    )}
                                </BlockStack>
                            </Card>
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
