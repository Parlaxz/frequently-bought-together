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
                metafieldsSetInput: metafields,
            },
        },
    );
    const data = await response.json();
    return data?.data?.appInstallationUpdate?.appInstallation;
};
