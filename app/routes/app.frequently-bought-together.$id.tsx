//#region imports

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import {
    CombinationCard,
    DiscountClass,
} from "@shopify/discount-app-components";
import { Card, ChoiceList } from "@shopify/polaris";
import SnippetPreview from "~/framework/components/Snippet/SnippetPreview";
import {
    DiscountSettingsCard,
    ProductPicker,
    PromoPage,
    PromotionMetadataCard,
    TextBox,
} from "~/framework/components/components";
import { getStyling } from "~/framework/components/form/getStyling";

import { useDiscountForm } from "~/framework/lib/helpers/hooks";

import type {
    ConfigDiscount,
    ConfigMetadata,
    ProductSelection,
} from "~/framework/lib/helpers/settingsPage";
import {
    getMetadata,
    runSettingsPageAction,
    runSettingsPageLoader,
} from "~/framework/lib/helpers/settingsPage";
//#endregion
//#region server functions

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    return runSettingsPageLoader(params, request);
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
    // 1. get prerequisites from the request and params
    return runSettingsPageAction(params, request, NAMESPACE, KEY, promoName);
};
//#endregion

//!------------------------------------CONFIGURE HERE------------------------------------
const NAMESPACE = "$app:upsellApp";
const KEY = "function-configuration";
const promoName = "frequentlyBoughtTogether";
//!----------------------------------END CONFIGURE HERE

export default function FrequentlyBoughtTogether() {
    //build discount data
    const loaderData: any = useLoaderData();
    const { tags } = loaderData;

    //!------------------------------------CONFIGURE HERE------------------------------------
    interface ConfigShape {
        texts: {
            containerTitle: string;
        };
        target: ProductSelection;
        offerItems: ProductSelection;
        offerDiscount: ConfigDiscount;
        metadata: ConfigMetadata;
        styles: object;
    }

    const loaderConfig = loaderData?.discount?.configuration;
    const config: ConfigShape = {
        texts: {
            containerTitle:
                loaderConfig?.texts?.containerTitle ??
                "Frequently Bought Together",
        },
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
        metadata: getMetadata(loaderConfig?.metadata),
        styles: {
            classes: getStyling(loaderConfig, "class", [
                "promo-add-to-cart",
                "triggerPlusSymbol",
                "fbt-container",
                "old-price",
                "new-price",
            ]),

            tags: getStyling(loaderConfig, "tag", ["H2", "IMG", "H3"]),
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
    //!----------------------------------END CONFIGURE HERE

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
                "Boost sales by showcasing complementary products at a discounted price, enticing customers to purchase multiple items together."
            }
        >
            <SnippetPreview
                configuration={configuration}
                type="frequently-bought-together"
            />
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
