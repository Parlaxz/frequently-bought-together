// @ts-check
import type { RunInput, FunctionRunResult, Target } from "../generated/api";
import { DiscountApplicationStrategy } from "../generated/api";
import {
    checkItemsInCart,
    cleanGID,
    cleanGIDs,
    getMatchingIds,
    processatcPromotionsMap,
} from "./helpers";
/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input: RunInput): FunctionRunResult {
    // Step 1: Preprocessing
    const configuration = JSON.parse(
        input?.discountNode?.metafield?.value ?? "{}",
    );
    const storePromotions = Object.values(configuration).map((promo: any) => {
        return {
            title: promo.title,
            id: promo.id,
            configuration: promo.configuration,
            condition: promo.configuration?.target ?? {},
            discount: {
                amount: promo.configuration?.offerDiscount?.value ?? 0,
                type: promo.configuration?.offerDiscount?.type ?? "percentage",
            },
            type: promo.type,
        };
    });
    console.log(
        "ids",
        storePromotions.map((p) => p.id),
    );
    const promotionsInCart = cleanGIDs(
        processatcPromotionsMap(
            input.cart.lines.map((line) => {
                return JSON.parse(line?.attribute?.value ?? "{}");
            }),
        ),
    );

    // Step 2: Build lineItemDiscounts
    const lineItemDiscounts: LineItemDiscount[] = input.cart.lines
        .map((line) => {
            if (line.merchandise.__typename === "ProductVariant") {
                const variantId = cleanGID(line.merchandise.id);
                const productId = cleanGID(line.merchandise.product.id);
                const productTitle = line.merchandise.product.title;

                return {
                    variantId,
                    productId,
                    productTitle,
                    discounts: [],
                };
            }
            return null;
        })
        .filter((n) => n);

    // Add promotions to lineItemDiscounts
    processFrequentlyBoughtTogether(
        promotionsInCart,
        storePromotions,
        lineItemDiscounts,
        input,
    );
    processUpgradeDiscount(
        promotionsInCart,
        storePromotions,
        lineItemDiscounts,
        input,
    );

    // Add volume discounts to lineItemDiscounts
    processVolumeDiscount(storePromotions, input, lineItemDiscounts);
    processFreeGiftDiscount(storePromotions, input, lineItemDiscounts);

    console.log(
        "lineItemDiscounts",
        JSON.stringify(lineItemDiscounts, null, 2),
    );
    // Step 3: Turn lineItemDiscounts into a discount object
    const discounts = lineItemDiscounts
        .filter((discount) => discount.discounts.length > 0)
        .map((discount, index, self) => {
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
                            (acc, curr) => acc + curr.value,
                            0,
                        ),
                    },
                },
                targets: targets,
                message: discount.discounts.reduce(
                    (acc, curr) => acc + ", " + curr.message,
                    "",
                ),
            };
        });

    // Step 4: Return the discount object
    return {
        discountApplicationStrategy: DiscountApplicationStrategy.All,
        discounts: discounts,
    };
}

function getQuantity(lines: any[], id: string | number) {
    const line = lines.find((line) => {
        return (
            line.merchandise.__typename === "ProductVariant" &&
            cleanGID(line.merchandise.product.id) === id
        );
    });

    return line?.quantity ?? 0;
}

function getLineItemById(lines: any[], id: string | number) {
    return lines.find(
        (line) =>
            line.merchandise.__typename === "ProductVariant" &&
            cleanGID(line.merchandise.product.id) === id,
    );
}

type LineItemDiscount = {
    variantId: string;
    productId: string;
    productTitle: string;
    discounts: {
        title: string;
        id: string;
        type: string;
        value: number;
        message: string;
        quantity?: number | null;
    }[];
    quantity?: number | null;
};
type Promotion = {
    promotionId: string;
    itemIds: string[];
};

type PromotionMap = {
    frequentlyBoughtTogether: Promotion[];
    addonDiscount: Promotion[];
    volumeDiscount: Promotion[];
    upgradeDiscount: Promotion[];
};
type StorePromotion = {
    id: string;
    title: string;
    type: string;
    discount: {
        type: "percentage" | "fixed";
        amount: string;
    };
    configuration: any;
};
const processFrequentlyBoughtTogether = (
    promotionsInCart: PromotionMap,
    storePromotions: StorePromotion[],
    lineItemDiscounts: LineItemDiscount[],
    input: RunInput,
) => {
    promotionsInCart.frequentlyBoughtTogether.forEach((parsedPromoData) => {
        if (checkItemsInCart(parsedPromoData, input.cart.lines)) {
            const promoSettings = storePromotions.find(
                (p) => p.id === parsedPromoData.promotionId,
            );

            if (promoSettings) {
                parsedPromoData.itemIds.forEach((productId) => {
                    const targetDiscount = lineItemDiscounts.find(
                        (discount) => discount.productId === productId,
                    );

                    if (targetDiscount) {
                        targetDiscount.quantity =
                            parsedPromoData.itemIds.reduce(
                                (acc, curr) =>
                                    Math.min(
                                        acc,
                                        getQuantity(input.cart.lines, curr),
                                    ),
                                1000,
                            );

                        targetDiscount.discounts.push({
                            title: promoSettings.title,
                            id: promoSettings.id,
                            type: promoSettings.discount.type,
                            value: parseInt(promoSettings.discount.amount, 10),
                            message:
                                promoSettings?.configuration.metadata
                                    .discountMessage,
                        });
                    }
                });
            }
        }
    });
};

const processFreeGiftDiscount = (
    storePromotions: StorePromotion[],
    input: RunInput,
    lineItemDiscounts: LineItemDiscount[],
) => {
    storePromotions
        .filter((promo) => promo.type === "freeGift")
        .forEach((promo) => {
            const targets = promo.configuration.offerItems;
            const itemsInCart = input.cart.lines.map((line) => {
                if (line.merchandise.__typename === "ProductVariant") {
                    const attributes = JSON.parse(
                        line?.attribute?.value ?? "{}",
                    );
                    return {
                        id: cleanGID(line.merchandise.product.id),
                        quantity: line.quantity,
                        collections: attributes.collections,
                        tags: attributes.tags,
                    };
                }
                return { id: 0, quantity: 0 };
            });

            const matchingIds = getMatchingIds(itemsInCart, targets);
            matchingIds.forEach((id) => {
                const targetDiscount = lineItemDiscounts.find(
                    (discount) => discount.productId === id,
                );

                if (targetDiscount) {
                    targetDiscount.discounts.push({
                        title: promo.title,
                        id: promo.id,
                        type: "percentage",
                        value: 100,
                        message: promo.configuration.metadata.discountMessage,
                        quantity: null,
                    });
                }
            });
        });
};

const processVolumeDiscount = (
    storePromotions: StorePromotion[],
    input: RunInput,
    lineItemDiscounts: LineItemDiscount[],
) => {
    storePromotions
        .filter((promo) => promo.type === "volumeDiscount")
        .forEach((promo) => {
            const targets = promo.configuration.target;
            const itemsInCart = input.cart.lines.map((line) => {
                if (line.merchandise.__typename === "ProductVariant") {
                    const attributes = JSON.parse(
                        line?.attribute?.value ?? "{}",
                    );
                    return {
                        id: cleanGID(line.merchandise.product.id),
                        quantity: line.quantity,
                        collections: attributes.collections,
                        tags: attributes.tags,
                    };
                }
                return { id: 0, quantity: 0 };
            });

            const matchingIds = getMatchingIds(itemsInCart, targets);
            matchingIds.forEach((id) => {
                const discountTiers = promo.configuration.volumes;
                const targetDiscount = lineItemDiscounts.find(
                    (discount) => discount.productId === id,
                );

                const targetTier = discountTiers.find(
                    (tier) =>
                        parseInt(tier.quantity) <=
                        (getLineItemById(input.cart.lines, id)?.quantity ?? 0),
                );

                if (targetDiscount && targetTier) {
                    targetDiscount.discounts.push({
                        title: promo.title,
                        id: promo.id,
                        type: targetTier.type,
                        value: parseInt(targetTier.value, 10),
                        message: promo.configuration.metadata.discountMessage,
                        quantity: parseInt(targetTier.quantity, 10),
                    });
                }
            });
        });
};
const processUpgradeDiscount = (
    promotionsInCart: PromotionMap,
    storePromotions: StorePromotion[],
    lineItemDiscounts: LineItemDiscount[],
    input: RunInput,
) => {
    promotionsInCart.upgradeDiscount.forEach((parsedPromoData) => {
        const promoSettings = storePromotions.find((p) => {
            //TODO: Find out why this is not working
            return p.id === parsedPromoData.promotionId;
        });
        if (promoSettings) {
            parsedPromoData.itemIds.forEach((productId) => {
                const targetDiscount = lineItemDiscounts.find(
                    (discount) => discount.productId === productId,
                );

                if (targetDiscount) {
                    console.log("input", JSON.stringify(input, null, 2));
                    targetDiscount.quantity =
                        input.cart.lines.find(
                            (line) =>
                                cleanGID(line.merchandise.product.id) ===
                                parseInt(productId, 10),
                        )?.quantity ?? 0;

                    targetDiscount.discounts.push({
                        title: promoSettings.title,
                        id: promoSettings.id,
                        type: promoSettings.discount.type,
                        value: parseInt(promoSettings.discount.amount, 10),
                        message:
                            promoSettings?.configuration.metadata
                                .discountMessage,
                    });
                }
            });
        }
    });
};
