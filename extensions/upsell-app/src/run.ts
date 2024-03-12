// @ts-check
import type {
    RunInput,
    FunctionRunResult,
    Target,
    //     ProductVariant,
} from "../generated/api";
import { DiscountApplicationStrategy } from "../generated/api";

const EMPTY_DISCOUNT: FunctionRunResult = {
    discountApplicationStrategy: DiscountApplicationStrategy.First,
    discounts: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input: RunInput): FunctionRunResult {
    // The run function essentially returns a discount object where:
    // 1. It filters things that don't qualify for the discount (quantity < 2)
    // 2. Maps the qualified items to a target object (productVariant ids)
    // 3. Returns a discount object with the targets and the discount value
    // Notes: I decide the input in the run.graphql file, so I can make many different types of inputs
    // and then use the input in the run function to determine what to do with the input

    //step 1: preprocessing all relevent base data to be used for promotions and discounts
    const configuration = JSON.parse(
        input?.discountNode?.metafield?.value ?? "{}",
    );
    //get the list of promotions on the user's store from the configuration
    const storePromotions = Object.values(configuration).map((promo: any) => {
        return {
            title: promo.title,
            method: promo.method,
            code: promo.code,
            id: promo.id,
            configuration: promo.configuration,
        };
    });
    const currAppliedPromos = input.cart.lines.map((line) => {
        return JSON.parse(line?.attribute?.value ?? "{}");
    });
    //relates all atc promotions to the items in the cart
    const atcPromotionsMap = cleanGIDs(
        processatcPromotionsMap(currAppliedPromos),
    );
    //step 2: build the lineItemDiscounts object and insert the promotions that apply to each line item
    // the map that relates each line item to the promotions that apply to it
    //step 2.1: initialize the lineItemDiscounts object
    const lineItemDiscounts: object = {};
    input.cart.lines.forEach((line) => {
        if (line.merchandise.__typename === "ProductVariant") {
            const variantId = cleanGID(line.merchandise.id);
            const productId = cleanGID(line.merchandise.product.id);
            const productTitle = line.merchandise.product.title;
            //@ts-ignore
            lineItemDiscounts[variantId] = {
                variantId,
                productId,
                productTitle,
                discounts: [],
            };
        }
    });
    //step 2.2: for each promotion, check if the required items are in the cart and if so, add the promotion to the lineItemDiscounts object
    atcPromotionsMap.frequentlyBoughtTogether.forEach(
        (promo: { promotionId: string; itemIds: string[] | number[] }) => {
            //check that the required quantity is in the cart
            const allInCart = checkItemsInCart(promo, input.cart.lines);
            if (allInCart) {
                const findPromo = (promoId: string) =>
                    storePromotions.find((p) => p.id === promoId);

                const promotion = findPromo(promo.promotionId);
                if (promotion) {
                    const discountData = promotion?.configuration.offerDiscount;
                    promo?.itemIds?.forEach((productId: any) => {
                        const targetDiscount = Object.values(
                            lineItemDiscounts,
                        ).find((discount) => discount.productId === productId);
                        targetDiscount.quantity = promo.itemIds.reduce(
                            (acc: number, curr: any) => {
                                return Math.min(
                                    acc,
                                    input.cart.lines.find((line: any) => {
                                        return (
                                            cleanGID(
                                                line.merchandise.product.id,
                                            ) === curr
                                        );
                                    })?.quantity ?? 0,
                                );
                            },
                            1000,
                        );
                        // get the minimum quantity of the items in the promotion that are in the cart
                        //get the minimum quantity of the items in the promotion that are in the cart
                        targetDiscount.discounts.push({
                            title: promotion.title,
                            id: promotion.id,
                            type: discountData.type,
                            value: discountData.value,
                            message:
                                promotion?.configuration.metadata
                                    .discountMessage,
                        });
                    });
                    //     console.log(
                    //         "lineItemDiscounts",
                    //         JSON.stringify(lineItemDiscounts, null, 2),
                    //     );
                }
            }
        },
    );
    //TODO: add the addonDiscount logic
    //TODO: add the volumeDiscount logic
    // Step 3: Turn the lineItemDiscounts object into a discount object that shopify accepts
    console.log(
        "lineItemDiscounts",
        JSON.stringify(lineItemDiscounts, null, 2),
    );
    if (Object.keys(lineItemDiscounts).length === 0) {
        return EMPTY_DISCOUNT;
    }
    //     console.log(
    //         "lineItemDiscounts",
    //         JSON.stringify(lineItemDiscounts, null, 2),
    //     );
    const discounts = Object.values(lineItemDiscounts)
        .map((discount) => {
            console.log(
                "🚀 ~ file: run.ts:119 ~ .map ~ discount:",
                JSON.stringify(discount, null, 2),
            );

            if (discount.discounts.length === 0) {
                return null;
            }
            const targets: Target[] = [
                {
                    productVariant: {
                        id: `gid://shopify/ProductVariant/${discount.variantId}`,
                        quantity: discount.quantity,
                    },
                },
            ];
            return {
                value: {
                    percentage: {
                        value: discount.discounts.reduce(
                            (acc: number, curr: any) => {
                                return acc + curr.value;
                            },
                            0,
                        ),
                    },
                },
                targets: targets,
                message: discount.discounts.reduce(
                    (acc: string, curr: { message: string }) => {
                        return acc + ", " + curr.message;
                    },
                    discount.productTitle,
                ),
            };
        })
        .filter((discount) => discount !== null);
    console.log(
        "🚀 ~ file: run.ts:159 ~ run ~ discounts:",
        JSON.stringify(discounts, null, 2),
    );

    // step 4: return the discount object
    return {
        discountApplicationStrategy: DiscountApplicationStrategy.All,
        // @ts-ignore
        discounts,
    };
    //todo: return the discount object
}

const cleanGID = (gid: string | number) => {
    if (typeof gid !== "string") {
        return gid;
    }
    return parseInt(gid.split("/").pop() ?? "0", 10);
};
function cleanGIDs(atcPromotionsMap: any) {
    const cleanedPromotions = {
        frequentlyBoughtTogether: [],
        addonDiscount: [],
        volumeDiscount: [],
    };

    // Helper function to convert GIDs to integers

    // Clean frequentlyBoughtTogether promotions
    cleanedPromotions.frequentlyBoughtTogether =
        atcPromotionsMap.frequentlyBoughtTogether.map(
            (promo: { promotionId: string; itemIds: any[] }) => ({
                promotionId: promo.promotionId,
                itemIds: promo.itemIds.map(cleanGID),
            }),
        );

    // No need to clean addonDiscount and volumeDiscount since they don't have itemIds in your example

    return cleanedPromotions;
}
function processatcPromotionsMap(inputArray: any[]) {
    const uniquePromotions = inputArray.reduce(
        (accumulator, currentItem) => {
            const frequentlyBoughtTogether =
                currentItem.frequentlyBoughtTogether;
            const addonDiscount = currentItem.addonDiscount;
            const volumeDiscount = currentItem.volumeDiscount;

            // Process frequentlyBoughtTogether promotions
            if (
                frequentlyBoughtTogether &&
                frequentlyBoughtTogether.promotionId
            ) {
                const existingFrequentlyBoughtTogether =
                    accumulator.frequentlyBoughtTogether.find(
                        (promo: any) =>
                            promo.promotionId ===
                            frequentlyBoughtTogether.promotionId,
                    );

                if (!existingFrequentlyBoughtTogether) {
                    accumulator.frequentlyBoughtTogether.push(
                        frequentlyBoughtTogether,
                    );
                }
            }

            // Process addonDiscount promotions
            if (addonDiscount && addonDiscount.promotionId) {
                const existingAddonDiscount = accumulator.addonDiscount.find(
                    (promo: any) =>
                        promo.promotionId === addonDiscount.promotionId,
                );

                if (!existingAddonDiscount) {
                    accumulator.addonDiscount.push(addonDiscount);
                }
            }

            // Process volumeDiscount promotions
            if (volumeDiscount && volumeDiscount.promotionId) {
                const existingVolumeDiscount = accumulator.volumeDiscount.find(
                    (promo: any) =>
                        promo.promotionId === volumeDiscount.promotionId,
                );

                if (!existingVolumeDiscount) {
                    accumulator.volumeDiscount.push(volumeDiscount);
                }
            }

            return accumulator;
        },
        {
            frequentlyBoughtTogether: [],
            addonDiscount: [],
            volumeDiscount: [],
        },
    );

    return uniquePromotions;
}
const checkItemsInCart = (promo: any, cart: any) => {
    const allInCart = promo.itemIds.every((id: any) => {
        return cart.some((line: any) => {
            //     console.log("id", id);
            return cleanGID(line.merchandise.product.id) === id;
        });
    });
    return allInCart;
};
