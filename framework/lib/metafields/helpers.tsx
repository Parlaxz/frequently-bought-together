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
    console.log("appInstallationId", appInstallationId);
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
    console.log("appMetafields", appMetafields);
    const promotions = appMetafields?.edges?.find(
        (edge: any) =>
            edge.node.namespace === "storage" && edge.node.key === "promotions",
    );

    return promotions;
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
export const updatePromotions = async (admin: any, promotion: any) => {
    const promotions = await getPromotions(admin);
    const currentPromotions = promotions?.node?.value || [];
    const newPromotions = currentPromotions.filter(
        (p: any) => p.id !== promotion.id,
    );
    newPromotions.push(promotion);
    const metafields = {
        namespace: "storage",
        key: "promotions",
        type: "json",
        value: JSON.stringify(newPromotions),
    };
    const response = await setAppMetafields(admin, [metafields]);
    return response;
};
