import { useEffect, useMemo } from "react";
import { useForm, useField } from "@shopify/react-form";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { CurrencyCode } from "@shopify/react-i18n";
import {
    useActionData,
    useLoaderData,
    useNavigation,
    useSubmit,
} from "@remix-run/react";
import {
    DiscountMethod,
    RequirementType,
} from "@shopify/discount-app-components";
import { Banner, Layout } from "@shopify/polaris";
import type { ConfigShape } from "~/routes/app.frequently-bought-together.$id";

/**
 * Custom hook for managing discount form logic
 * @param config - An array of configuration objects for each field in the form.
 * @returns An object containing various properties and functions related to the discount form.
 * @example const { fields, submit, isLoading, currencyCode, errorBanner, redirect, isNew, actionData } = useDiscountForm(config);
 *
 */
export const useDiscountForm = (config: any, defaultTitle = "") => {
    const loaderData = useLoaderData();
    //@ts-ignore
    const discountData = loaderData?.discount?.discount;

    const loaderDiscountMethod = discountData?.discountMethod;
    const isNew = discountData == null;
    const submitForm = useSubmit();
    const actionData = useActionData() as { errors?: any[] };
    const navigation = useNavigation();
    const app = useAppBridge();
    const todaysDate = useMemo(() => new Date(), []);

    const isLoading = navigation.state === "submitting";
    const currencyCode = CurrencyCode.Usd;
    const submitErrors = actionData?.errors || [];
    const redirect = Redirect.create(app);
    useEffect(() => {
        if (actionData?.errors?.length === 0) {
            redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
                name: Redirect.ResourceType.Discount,
            });
        }
    }, [actionData, redirect]);
    const errorBanner =
        submitErrors.length > 0 ? (
            <Layout.Section>
                <Banner tone="critical">
                    <p>There were some issues with your form submission:</p>
                    <ul>
                        {submitErrors.map(
                            (
                                {
                                    message,
                                    field,
                                }: { message: string; field: string[] },
                                index: number,
                            ) => {
                                return (
                                    <li key={`${message}${index}`}>
                                        {field.join(".")} {message}
                                    </li>
                                );
                            },
                        )}
                    </ul>
                </Banner>
            </Layout.Section>
        ) : null;

    const transformedConfig = transformObjectHandler(config);
    console.log("transformedConfig");

    const { fields, submit } = useForm({
        fields: {
            discountId: useField(discountData?.discountId || ""),
            discountTitle: useField(
                discountData?.discountTitle || defaultTitle,
            ),
            discountMethod: useField(
                discountData?.discountMethod || DiscountMethod.Automatic,
            ),
            discountCode: useField(
                loaderDiscountMethod === DiscountMethod.Code
                    ? discountData?.discountCode || ""
                    : "",
            ),
            combinesWith: useField(
                discountData?.combinesWith || {
                    orderDiscounts: true,
                    productDiscounts: true,
                    shippingDiscounts: true,
                },
            ),
            requirementType: useField(RequirementType.None),
            requirementSubtotal: useField("0"),
            requirementQuantity: useField("0"),
            usageLimit: useField(discountData?.usageLimit || null),
            appliesOncePerCustomer: useField(false),
            startDate: useField(
                discountData?.startDate || todaysDate.toISOString(),
            ),
            endDate: useField(discountData?.endDate || null),
            configuration: transformedConfig,
            metafieldId: useField(discountData?.metafieldId || ""),
        },
        onSubmit: async (form) => {
            const discountConfig: any = {};

            const discount = {
                title: form.discountTitle,
                method: form.discountMethod,
                code: form.discountCode,
                combinesWith: form.combinesWith,
                usageLimit:
                    form.usageLimit == null ? null : parseInt(form.usageLimit),
                appliesOncePerCustomer: form.appliesOncePerCustomer,
                startsAt: form.startDate,
                endsAt: form.endDate,
                configuration: discountConfig,
            };

            submitForm(
                {
                    discount: JSON.stringify(discount),
                    id: form.discountId,
                    metafieldId: form.metafieldId,
                },
                { method: "post" },
            );

            return { status: "success" };
        },
    });

    return {
        isNew,
        actionData,
        redirect,
        isLoading,
        currencyCode,
        errorBanner,
        fields,
        submit,
    };
};
function transformObjectHandler(obj: ConfigShape) {
    return TransformObject(obj);
}
function TransformObject(obj: any) {
    const result: any = {};
    for (const key in obj) {
        const value = obj[key];
        console.log("key", key);
        console.log("value", value);
        if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
        ) {
            console.log(1);
            result[key] = TransformObject(value);
        } else {
            console.log(2);
            console.log("key", key);
            console.log("value", value);

            result[key] = DynamicField(value);
        }
    }

    return result;
}
const DynamicField = (value: any) => {
    return useField(value);
};
