//#region imports

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import {
    CombinationCard,
    DiscountClass,
} from "@shopify/discount-app-components";
import SnippetPreview from "~/framework/components/Styling/SnippetPreview";
import {
    ProductPicker,
    PromoPage,
    PromotionMetadataCard,
} from "~/framework/components/components";
import VolumeDiscountCard from "~/framework/components/form/VolumeDiscountCard";
import { getStyling } from "~/framework/components/form/getStyling";

import { useDiscountForm } from "~/framework/lib/helpers/hooks";

import type {
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
const promoName = "volumeDiscount";
//!----------------------------------END CONFIGURE HERE

export default function VolumeDiscount() {
    //build discount data
    const loaderData: any = useLoaderData();
    const { tags } = loaderData;

    //!------------------------------------CONFIGURE HERE------------------------------------
    interface ConfigShape {
        target: ProductSelection;
        volumes: {
            type: "percentage" | "fixedAmount";
            value: number;
            quantity: number;
        }[];
        metadata: ConfigMetadata;
        styles: object;
    }

    const loaderConfig = loaderData?.discount?.configuration;
    const config: ConfigShape = {
        target: {
            type: loaderConfig?.target?.type ?? "product",
            value: loaderConfig?.target?.value ?? [],
        },
        volumes: loaderData?.discount?.configuration?.volumes ?? [
            { type: "percentage", value: 0, quantity: 1 },
        ],
        metadata: getMetadata(loaderConfig?.metadata),
        styles: {
            classes: getStyling(loaderConfig, "class", ["promo-add-to-cart"]),

            tags: getStyling(loaderConfig, "tag", ["H2"]),
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
            title={"Volume Discount"}
            subtitle={
                "TODO: Add a description here. This will be visible to the customer."
            }
        >
            <SnippetPreview
                configuration={configuration}
                type="volume-discount"
            />
            <PromotionMetadataCard configuration={configuration} />

            <ProductPicker
                type={configuration.target.type}
                value={configuration.target.value}
                tags={tags}
                label={"Target Products"}
            />
            <VolumeDiscountCard volumes={configuration.volumes} />

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
