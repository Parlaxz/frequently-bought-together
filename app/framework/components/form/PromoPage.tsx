import { onBreadcrumbAction } from "@shopify/discount-app-components";
import { BlockStack, Layout, Page, PageActions } from "@shopify/polaris";
import { Form } from "@remix-run/react";

function PromoPage({
    isNew,
    redirect,
    submit,
    isLoading,
    children,
    errorBanner,
    nonEmptyFields,
    title,
    subtitle,
}: {
    isNew: boolean;
    redirect: any;
    submit: any;
    isLoading: boolean;
    children: any;
    errorBanner: any;
    nonEmptyFields: Field[];

    title: string;
    subtitle: string;
}) {
    const isDisabled = nonEmptyFields.some((field) => {
        return field.value === "";
    });
    return (
        <>
            <Page
                title={isNew ? `New ${title} discount` : title}
                subtitle={subtitle}
                backAction={{
                    content: "Discounts",
                    onAction: () => onBreadcrumbAction(redirect, true),
                }}
                primaryAction={{
                    content: "Save",
                    onAction: submit,
                    loading: isLoading,
                    disabled: isDisabled,
                }}
            >
                <Layout>
                    {errorBanner}
                    <Layout.Section>
                        <Form method="post">
                            <BlockStack align="space-around" gap={"200"}>
                                {children}
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
                                disabled: isDisabled,
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
        </>
    );
}

export default PromoPage;
