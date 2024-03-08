import { json } from "@remix-run/react";
import { DiscountMethod } from "@shopify/discount-app-components";
import { getAppDiscountNodes, getFunctionalDiscountNodes } from "./discounts";
import { getAppMetafields, getPromotions } from "./metafields";

/**
 * Creates a functional discount in the shopify admin. The main helper function for
 * discount function extensions.
 * @example Typically used in a server action to create a discount once a form is submitted
 * @param discount - The discount data to create.
 * @param id - The ID of the discount.
 * @param functionId - The ID of the function.
 * @param admin - The admin API client.
 * @param namespace - The namespace of the metafield of the metafield associated with the configuration of the discount.
 * @param key - The key of the metafield of the metafield associated with the configuration of the discount.
 * @returns The response from the Shopify admin.
 *
 */
export const createFunctionalDiscount = async ({
    discount,
    functionId,
    admin,
    namespace,
    key,
}: {
    admin: any;
    functionId: string | undefined;
    discount: DiscountValues;
    namespace: string;
    key: string;
}) => {
    const {
        title,
        method,
        code,
        combinesWith,
        usageLimit,
        appliesOncePerCustomer,
        startsAt,
        endsAt,
        configuration,
    }: DiscountValues = discount;

    const baseDiscount = {
        functionId,
        title,
        combinesWith,
        startsAt: new Date(startsAt),
        endsAt: endsAt && new Date(endsAt),
    };

    if (method === DiscountMethod.Code) {
        const baseCodeDiscount = {
            ...baseDiscount,
            title: code,
            code,
            usageLimit,
            appliesOncePerCustomer,
        };

        const response = await admin.graphql(
            `#graphql
              mutation CreateCodeDiscount($discount: DiscountCodeAppInput!) {
                discountCreate: discountCodeAppCreate(codeAppDiscount: $discount) {
                  userErrors {
                    code
                    message
                    field
                  }
                }
              }`,
            {
                variables: {
                    discount: {
                        ...baseCodeDiscount,
                        metafields: [
                            {
                                namespace: namespace,
                                key: key,
                                type: "json",
                                value: JSON.stringify({ ...configuration }),
                            },
                        ],
                    },
                },
            },
        );

        const responseJson = await response.json();
        const errors = responseJson?.data?.discountCreate?.userErrors ?? [];
        return json({ errors });
    } else {
        const response = await admin.graphql(
            `#graphql
                    mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
                        discountCreate: discountAutomaticAppCreate(automaticAppDiscount: $discount) {
                        userErrors {
                            code
                            message
                            field
                        }
                        }
                    }
                    `,
            {
                variables: {
                    discount: {
                        ...baseDiscount,
                        metafields: [
                            {
                                namespace: namespace,
                                key: "function-configuration",
                                type: "json",
                                value: JSON.stringify({ ...configuration }),
                            },
                        ],
                    },
                },
            },
        );

        const responseJson = await response.json();
        const errors = responseJson?.data?.discountCreate?.userErrors ?? [];
        return json({ errors });
    }
};

/**
 * Updates a functional discount in the shopify admin. The main helper function for
 * discount function extensions.
 * @example Typically used in a server action to update a discount once a form is submitted if it already exists.
 * @param discount - The discount data to update.
 * @param id - The ID of the discount.
 * @param functionId - The ID of the function.
 * @param admin - The admin API client.
 * @param namespace - The namespace of the metafield of the metafield associated with the configuration of the discount.
 * @param metafieldId - The ID of the metafield associated with the configuration of the discount.
 * @returns The response from the Shopify admin.
 */
export const updateFunctionalDiscount = async ({
    discount,
    id,
    functionId,
    admin,
    metafieldId,
}: {
    admin: any;
    functionId: string | undefined;
    id: string | undefined;
    discount: DiscountValues;
    metafieldId: string | undefined;
}) => {
    const {
        title,
        method,
        code,
        combinesWith,
        usageLimit,
        appliesOncePerCustomer,
        startsAt,
        endsAt,
        configuration,
    }: DiscountValues = discount;

    const baseDiscount = {
        functionId,
        title,
        combinesWith,
        startsAt: new Date(startsAt),
        endsAt: endsAt && new Date(endsAt),
    };

    if (method === DiscountMethod.Code) {
        const baseCodeDiscount = {
            ...baseDiscount,
            title: code,
            code,
            usageLimit,
            appliesOncePerCustomer,
            metafields: [
                {
                    id: metafieldId,
                    type: "json",
                    value: JSON.stringify({ ...configuration }),
                },
            ],
        };

        const response = await admin.graphql(
            `#graphql
                mutation discountCodeAppUpdate($codeAppDiscount: DiscountCodeAppInput!, $id: ID!) {
                  discountCodeAppUpdate(codeAppDiscount: $codeAppDiscount, id: $id) {
                    codeAppDiscount {
                      discountId
                      title
                      endsAt
                    }
                    userErrors {
                      field
                      message
                    }
                  }
                }`,
            {
                variables: {
                    id: id,
                    codeAppDiscount: {
                        ...baseCodeDiscount,
                    },
                },
            },
        );
        const responseJson = await response.json();

        const errors = responseJson?.data?.discountCreate?.userErrors ?? [];
        return json({ errors });
    } else {
        const response = await admin.graphql(
            `#graphql
                    mutation UpdateAutomaticDiscount($discount: DiscountAutomaticAppInput! $id: ID!) {
                        discountCreate: discountAutomaticAppUpdate(automaticAppDiscount: $discount, id: $id ) {
                        userErrors {
                            code
                            message
                            field
                        }
                        }
                    }
                    `,
            {
                variables: {
                    discount: {
                        ...baseDiscount,
                        metafields: [
                            {
                                id: metafieldId,
                                type: "json",
                                value: JSON.stringify({ ...configuration }),
                            },
                        ],
                    },
                    id: id,
                },
            },
        );

        const responseJson = await response.json();
        const errors = responseJson?.data?.discountCreate?.userErrors ?? [];
        return json({ errors });
    }
};
/**
 * Builds a GraphQL query for retrieving discount information.
 * @example Used in getFunctionalDiscount to build a query to retrieve a discount.
 * @param namespace - The namespace of the metafield.
 * @param key - The key of the metafield.
 * @param id - The ID of the discount node.
 * @returns The GraphQL query string.
 */
const buildDiscountQuery = (
    namespace: string,
    key: string,
    id: string | undefined,
) => {
    const codeString = `title
        startsAt
        endsAt
        usageLimit
        codes(first: 3){
            edges{
                node{
                        code
                    }
            }
        }
        combinesWith {
            orderDiscounts
            productDiscounts
            shippingDiscounts
        }`;
    const autoString = `
        title
        startsAt
        endsAt
        combinesWith {
                orderDiscounts
                productDiscounts
                shippingDiscounts
            }
        `;
    const autoTypes = [
        "DiscountAutomaticApp",
        "DiscountAutomaticBasic",
        "DiscountAutomaticBxgy",
        "DiscountAutomaticFreeShipping",
    ];
    const codeTypes = [
        "DiscountCodeApp",
        "DiscountCodeBasic",
        "DiscountCodeBxgy",
        "DiscountCodeFreeShipping",
    ];
    const codeStrings = codeTypes
        .map((type) => {
            return `... on ${type} {
                ${codeString}
            }`;
        })
        .join("\n");
    const autoStrings = autoTypes
        .map((type) => {
            return `... on ${type} {
                ${autoString}
            }`;
        })
        .join("\n");

    return (
        "#graphql" +
        `
            query {
                discountNode(id: "gid://shopify/DiscountNode/${id}") {
                id
                metafield(namespace: "${namespace}", key: "${key}") {
                    value
                    id
                }
                discount {
                    ${codeStrings}
                    ${autoStrings}
                }
                }
            }`
    );
};
/**
 * A dictionary that maps discount method names to their corresponding discount methods.
 */
const methodDict = {
    DiscountCodeApp: DiscountMethod.Code,
    DiscountCodeBasic: DiscountMethod.Code,
    DiscountCodeBxgy: DiscountMethod.Code,
    DiscountCodeFreeShipping: DiscountMethod.Code,
    DiscountCodeNode: DiscountMethod.Code,
    DiscountAutomaticApp: DiscountMethod.Automatic,
    DiscountAutomaticBasic: DiscountMethod.Automatic,
    DiscountAutomaticBxgy: DiscountMethod.Automatic,
    DiscountAutomaticFreeShipping: DiscountMethod.Automatic,
    DiscountAutomaticNode: DiscountMethod.Automatic,
};

/**
 * Retrieves a functional discount from the Shopify admin via the id of the discount.
 * Typically used in a loader to retrieve a discount by its ID.
 * @param id the id of the functional discount
 * @param admin API client
 * @param NAMESPACE The namespace of the metafield associated with the configuration of the discount.
 * @param KEY The key of the metafield associated with the configuration of the discount.
 * @returns The functional discount, or null if no discount is found.
 * @example getFunctionalDiscount(id, admin, NAMESPACE, KEY)
 */
export async function getFunctionalDiscount(
    id: string | undefined,
    admin: any,
    NAMESPACE: string,
    KEY: string,
) {
    const discountQuery = buildDiscountQuery(NAMESPACE, KEY, id);

    const response = await admin.graphql(discountQuery);
    const data = await response.json();

    //@ts-ignore
    const method = methodDict[data?.data?.discountNode?.id.split("/")[3]];
    const returnData = {
        discount: {
            discountId: data?.data?.discountNode?.id,
            discountMethod: method,
            discountTitle: data?.data?.discountNode?.discount?.title,
            discountCode:
                data?.data?.discountNode?.discount?.codes?.edges[0]?.node?.code,
            combinesWith: data?.data?.discountNode?.discount?.combinesWith,
            startDate: data?.data?.discountNode?.discount?.startsAt,
            endDate: data?.data?.discountNode?.discount?.endsAt,
            usageLimit: data?.data?.discountNode?.discount?.usageLimit,
            configuration: JSON.parse(
                data?.data?.discountNode?.metafield?.value,
            ),
            metafieldId: data?.data?.discountNode?.metafield?.id,
        },
    };
    //if no discount is found, return null
    if (!returnData.discount.discountId) return null;
    return returnData;
}

/**
 * Typically a prerequisite for retrieving a functional discount, this function retrieves the ID of a function with a given title.
 * Useful since we can't directly query for a function by title.
 * Used in getFunctionalDiscount to retrieve the ID of a function by its title. Used in the action since I don't have access to the function ID directly.
 * @param admin API client
 * @param functionTitle The title of the function being retrieved
 * @returns The ID of the function with the given title or null if no function is found
 * @example getFunctionId(admin, functionTitle)
 */
export const getFunctionId = async (admin: any, functionTitle: string) => {
    const query = `query {
                    shopifyFunctions(first: 25) {
                      nodes {
                    app {
                      title
                    }
                    apiType
                    title
                    id
                      }
                    }
              }
              `;
    const response = await admin.graphql(query);
    const data = await response.json();
    const functionId = data.data.shopifyFunctions.nodes.find(
        (node: any) => node.title === functionTitle,
    ).id;
    if (functionId) return functionId;
    else return null;
};

export const initFunctionalDiscount = async (
    admin: any,
    parsedDiscount: DiscountValues,
    NAMESPACE: string,
    KEY: string,
    appName: string,
    discountType: string,
) => {
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
            type: discountType,
        };
        const functionId = await getFunctionId(admin, appName);

        return createFunctionalDiscount({
            admin,
            functionId,
            discount: discountManager,
            namespace: NAMESPACE,
            key: KEY,
        });
        //TODO: create discount for free shipping
    } else {
        const functionId = await getFunctionId(admin, appName);

        const functionalNodes = await getFunctionalDiscountNodes(admin);
        const discount = functionalNodes.nodes.find(
            (node: any) => node.discount.appDiscountType.title === "upsellApp",
        );
        const metafield = discount.metafields.nodes.find((node: any) => {
            return node.key === "function-configuration";
        });
        const promotions = await getPromotions(admin);
        parsedDiscount.configuration = promotions;

        const metafieldId = metafield.id;
        const functionDiscountData = {
            admin,
            functionId,
            discount: parsedDiscount,
            id: discount.discount.discountId,
            metafieldId: metafieldId,
        };
        return updateFunctionalDiscount(functionDiscountData);
    }
};
