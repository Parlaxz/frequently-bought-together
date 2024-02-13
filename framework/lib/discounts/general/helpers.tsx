import { json } from "@remix-run/react";

/**
 * Get a list of discount nodes which are app discounts
 * @example used typically to check for existing app discounts before creating a new one
 * @param admin API client
 * @returns A list of discount nodes which are app discounts
 */
export const getAppDiscountNodes = async (admin: any) => {
    const response = await admin.graphql(
        `#graphql
                        query {
                          discountNodes(first: 25, query: "appDiscountType:*") {
                            edges {
                              node {
                                id
                                discount {
                                  ... on DiscountCodeBasic {
                                    title
                                  }
                                  ... on DiscountCodeBxgy {
                                    title
                                  }
                                  ... on DiscountCodeFreeShipping {
                                    title
                                  }
                                  ... on DiscountAutomaticApp {
                                    title
                                  }
                                  ... on DiscountAutomaticBasic {
                                    title
                                  }
                                  ... on DiscountAutomaticBxgy {
                                    title
                                  }
                                  ... on DiscountAutomaticFreeShipping {
                                    title
                                  }
                                }
                              }
                            }
                          }
                        }`,
    );
    const data = await response.json();
    return data?.data?.discountNodes?.edges.map((edge: any) => edge.node);
};

/**
 * Get a discount node by its ID
 * @param admin API client
 * @param id The ID of the discount node
 * @returns The discount node
 */
export const getAppDiscountNode = async (admin: any, id: string) => {
    const discountId = id;
    const response = await admin.graphql(
        `#graphql
                            query($discountId: ID!) {
                              discountNode(id: $discountId) {
                                    id
                                    discount {
                                      ... on DiscountCodeBasic {
                                    title
                                      }
                                      ... on DiscountCodeBxgy {
                                    title
                                      }
                                      ... on DiscountCodeFreeShipping {
                                    title
                                      }
                                      ... on DiscountAutomaticApp {
                                    title
                                      }
                                      ... on DiscountAutomaticBasic {
                                    title
                                      }
                                      ... on DiscountAutomaticBxgy {
                                    title
                                      }
                                      ... on DiscountAutomaticFreeShipping {
                                    title
                                      }
                                    }
                              }
                            }`,
        { variables: { discountId } },
    );
    const data = await response.json();
    return data?.data?.discountNode;
};

/**
 * Create a basic discount for automatic free shipping
 * @param admin API client
 * @param minimumAmount Minimum amount for free shipping
 * @param title Title of the discount
 * @returns The free shipping discount with title and status
 *
 */
export const createFreeShippingDiscount = async (
    admin: any,
    minimumAmount: string,
    title: string,
) => {
    const response = await admin.graphql(
        `#graphql
                 mutation discountAutomaticFreeShippingCreate($freeShippingAutomaticDiscount: DiscountAutomaticFreeShippingInput!) {
                       discountAutomaticFreeShippingCreate(freeShippingAutomaticDiscount: $freeShippingAutomaticDiscount) {
                            automaticDiscountNode {
                                     id
                                     automaticDiscount {
                                        ... on DiscountAutomaticFreeShipping {
                                            title
                                            status
                                        }
                                     }
                            }
                             userErrors {
                                    field
                                     message
                            }
                    }
                    }
    
                    `,
        {
            variables: {
                freeShippingAutomaticDiscount: {
                    combinesWith: {
                        orderDiscounts: true,
                        productDiscounts: true,
                    },
                    minimumRequirement: {
                        subtotal: {
                            greaterThanOrEqualToSubtotal: minimumAmount,
                        },
                    },
                    title,
                    startsAt: "2023-09-07T15:50:00Z",
                },
            },
        },
    );

    const responseJson = await response.json();
    const errors = responseJson?.data?.discountCreate?.userErrors ?? [];
    return json({ data: responseJson, errors });
};

/**
 * Update a basic discount for automatic free shipping
 * @param admin API client
 * @param minimumAmount Minimum amount for free shipping
 * @param title Title of the discount
 * @param id ID of the discount
 * @returns The free shipping discount with title and status
 */
export const updateFreeShippingDiscount = async (
    admin: any,
    minimumAmount: string,
    id: string,
) => {
    const response = await admin.graphql(
        `#graphql
                         mutation discountAutomaticFreeShippingUpdate($freeShippingAutomaticDiscount: DiscountAutomaticFreeShippingInput!, $id: ID!) {
                           discountAutomaticFreeShippingUpdate(id:$id, freeShippingAutomaticDiscount: $freeShippingAutomaticDiscount) {
                                automaticDiscountNode {
                                         id
                                                automaticDiscount {
                                                ... on DiscountAutomaticFreeShipping {
                                                        title
                                                        status
                                                }
                                                }
                                }
                                 userErrors {
                                        field
                                         message
                                }
                        }
                        }
        
                        `,
        {
            variables: {
                freeShippingAutomaticDiscount: {
                    minimumRequirement: {
                        subtotal: {
                            greaterThanOrEqualToSubtotal: minimumAmount,
                        },
                    },
                },
                id,
            },
        },
    );

    const responseJson = await response.json();
    const errors = responseJson?.data?.discountCreate?.userErrors ?? [];
    return json({ data: responseJson, errors });
};

/**
 * deactivates an automatic discount given the id
 * @param admin API client
 * @param id ID of the discount
 */
export const deactivateDiscount = async (admin: any, id: string) => {
    const response = await admin.graphql(
        `#graphql
                        mutation discountAutomaticDeactivate($id: ID!) {
                                discountAutomaticDeactivate(id: $id) {
                            automaticDiscountNode {
                              id
                            }
                            userErrors {
                              field
                              message
                            }
                          }
                        }
                        `,
        { variables: { id } },
    );

    const responseJson = await response.json();
    const errors = responseJson?.data?.discountCreate?.userErrors ?? [];
    return json({ errors });
};

/**
 * activates an automatic discount given the id
 * @param admin API client
 * @param id ID of the discount
 * @returns The discount node
 */
export const activateDiscount = async (admin: any, id: string) => {
    const response = await admin.graphql(
        `#graphql
                        mutation discountAutomaticActivate($id: ID!) {
                                discountAutomaticActivate(id: $id) {
                            automaticDiscountNode {
                              id
                            }
                            userErrors {
                              field
                              message
                            }
                          }
                        }
                        `,
        { variables: { id } },
    );

    const responseJson = await response.json();
    const errors = responseJson?.data?.discountCreate?.userErrors ?? [];
    return json({ errors });
};

export const getAutomaticDiscountByTitle = async (
    admin: any,
    title: string,
) => {
    const response = await admin.graphql(
        `#graphql
  query automaticDiscountByTitle($title: String!){
    automaticDiscountNodes(first: 2, query: $title) {
      edges {
        node {
          id
          automaticDiscount {
            ... on DiscountAutomaticBasic {
              title
              summary
              customerGets {
                items {
                  ... on AllDiscountItems {
                    allItems
                  }
                }
              }
              minimumRequirement {
                ... on DiscountMinimumQuantity {
                  greaterThanOrEqualToQuantity
                }
              }
            }
            ... on DiscountAutomaticBxgy {
              title
              summary
              customerBuys {
                value {
                  ... on DiscountQuantity {
                    quantity
                  }
                  ... on DiscountPurchaseAmount {
                    amount
                  }
                }
              }
              customerGets {
                value {
                  ... on DiscountOnQuantity {
                    quantity {
                      quantity
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
        }`,
        { variables: { title: "title:" + title } },
    );

    const data = await response.json();
    return data;
};
