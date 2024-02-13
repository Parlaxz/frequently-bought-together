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
} from "@shopify/polaris";

import shopifyServer, { authenticate } from "../shopify.server";

import { useDiscountForm } from "framework/lib/discounts/functional/hooks";
import {
    createFunctionalDiscount,
    getFunctionalDiscount,
    updateFunctionalDiscount,
} from "framework/lib/discounts/functional/helpers";
import { ResourcePicker } from "framework/components/form";

//------------------------------------CONFIGURE HERE------------------------------------
const NAMESPACE = "$app:cart-goal";
const KEY = "function-configuration";
const DISCOUNT_NAME = "Cart Goal";
//----------------------------------END CONFIGURE HERE-----------------------------------

export const loader = async ({ params, request }: ActionFunctionArgs) => {
    const { id } = params;
    if (id === "new") {
        return json({ discount: null });
    }
    const { admin } = await authenticate.admin(request);

    const returnData = await getFunctionalDiscount(id, admin, NAMESPACE, KEY);
    return json({ discount: returnData });
};

// This is a server-side action that is invoked when the form is submitted.
// It makes an admin GraphQL request to create a discount.
export const action = async ({ params, request }: ActionFunctionArgs) => {
    //1. get basic info
    const { functionId } = params;
    const { admin } = await shopifyServer.authenticate.admin(request);

    //2. get and parse form data
    const formData = await request.formData();

    const parsedDiscount = JSON.parse(String(formData.get("discount") || ""));
    console.log("formData.get(id) ||)", formData.get("id"));

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

// This is the React component for the page.
export default function DiscountNew() {
    //build discount data
    const config: {
        title: string;
        default: any;
        type: "int" | "float" | "string";
    }[] = [
        { title: "goalAmount1", default: 10, type: "int" },
        { title: "percentage1", default: 10, type: "float" },
        { title: "discountType1", default: "cart", type: "string" },
    ];

    const { isNew, redirect, isLoading, errorBanner, fields, submit } =
        useDiscountForm(config);

    const { discountTitle, combinesWith, configuration } = fields;

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
                        <BlockStack align="space-around" gap={undefined}>
                            {isNew && (
                                <TextField
                                    label="Goal amount"
                                    autoComplete="on"
                                    {...discountTitle}
                                />
                            )}
                            <Card>
                                <BlockStack gap={undefined}>
                                    <Text variant="headingMd" as="h2">
                                        {DISCOUNT_NAME}
                                    </Text>
                                    <ResourcePicker label="trigger" />

                                    <TextField
                                        label="Goal amount"
                                        autoComplete="on"
                                        {...configuration.goalAmount1}
                                    />
                                    <TextField
                                        label="Discount percentage"
                                        autoComplete="on"
                                        {...configuration.percentage1}
                                        suffix="%"
                                    />
                                    <TextField
                                        label="Discount type"
                                        autoComplete="on"
                                        {...configuration.discountType1}
                                    />
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
