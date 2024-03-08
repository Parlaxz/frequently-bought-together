/**
 * Get the current app installation for the app
 * @example used in anytime wanting to set appdata metafields
 * @param admin API client
 */
export const getCurrentAppInstallation = async (admin: any) => {
    const response = await admin.graphql(
        `#graphql
                       query {
                                currentAppInstallation {
                                   id
                                }
                        }`,
    );
    const data = await response.json();
    return data?.data?.currentAppInstallation?.id;
};

/**
 * Get the metafields associated with the app installation
 * @param admin API client
 */
export const getAppMetafields = async (admin: any) => {
    const appInstallationId = await getCurrentAppInstallation(admin);
    const response = await admin.graphql(
        `#graphql
                            query GetAppInstallationMetafields($ownerId: ID!) {
                                    appInstallation(id: $ownerId) {
                                    metafields(first: 3) {
                                    edges {
                                            node {
                                            namespace
                                            key
                                            value
                                            }
                                    }
                                    }
                                    }
                                    }`,
        {
            variables: {
                ownerId: appInstallationId,
            },
        },
    );
    const data = await response.json();
    return data?.data?.appInstallation?.metafields;
};

/**
 * Set the metafields associated with the app installation
 * @param admin API client
 * @param metafields The metafields to set
 */
export const setAppMetafields = async (admin: any, metafields: Metafield[]) => {
    const appInstallationId = await getCurrentAppInstallation(admin);
    const metafieldInput = metafields.map((metafield: Metafield) => {
        metafield.ownerId = appInstallationId;
        return metafield;
    });
    const response = await admin.graphql(
        `#graphql
                               mutation UpdateAppDataMetafields($metafieldsSetInput: [MetafieldsSetInput!]!) {
                                metafieldsSet(metafields: $metafieldsSetInput) {
                                    metafields {
                                        id
                                        namespace
                                        key
                                    }
                                    userErrors {
                                        field
                                        message
                                    }
                                }
                            }`,
        {
            variables: {
                metafieldsSetInput: metafieldInput,
            },
        },
    );
    const data = await response.json();
    return data?.data?.appInstallationUpdate?.appInstallation;
};

export const getPromotions = async (admin: any) => {
    const appMetafields = await getAppMetafields(admin);
    const promotions = appMetafields?.edges?.find(
        (edge: any) =>
            edge.node.namespace === "storage" && edge.node.key === "promotions",
    );
    return JSON.parse(promotions?.node?.value);
};

export const getPromotion = async (admin: any, id: string) => {
    const promotions = await getPromotions(admin);
    return promotions.find((p: any) => p.id === id);
};

/** Steps
    1. get the `promotions` array via [[getPromotions()]]
    2. filter out any promotion with the same id as the `promotion` parameter
    3. append the `promotion` parameter to `promotions`
    4. get the current app installation via [[getCurrentAppInstallation()]]
    5. build the metafields array via
    ```js
    {
            namespace: "storage",
            key: "promotions",
            type: "json",
            value: promotions,
    }
    ```
    6. set the promotions array via [[setAppMetafields()]] 
    
     */
export const updatePromotions = async (
    admin: any,
    session: any,
    promotion: any,
) => {
    const promotions = await getPromotions(admin);

    const newPromotions = promotions.filter((p: any) => p.id !== promotion.id);
    newPromotions.push(promotion);
    const metafields = {
        namespace: "storage",
        key: "promotions",
        type: "json",
        value: JSON.stringify(newPromotions),
    };
    const response = await setAppMetafields(admin, [metafields]);
    initStorefrontTokens(admin, session);

    return response;
};

export const initStorefrontTokens = async (admin: any, session: any) => {
    const appMetafields = await getAppMetafields(admin);
    const storefrontTokens = appMetafields?.edges?.find(
        (edge: any) =>
            edge.node.namespace === "storage" &&
            edge.node.key === "storefrontToken",
    );
    if (!storefrontTokens) {
        const storefront_access_token =
            new admin.rest.resources.StorefrontAccessToken({
                session: session,
            });
        storefront_access_token.title = "storefrontToken";
        await storefront_access_token.save({
            update: true,
        });
        const access_token = storefront_access_token.access_token;
        const metafields = {
            namespace: "storage",
            key: "storefrontToken",
            type: "json",
            value: JSON.stringify({ access_token }),
        };

        await setAppMetafields(admin, [metafields]);
    }
};
