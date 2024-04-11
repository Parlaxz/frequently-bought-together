export const cleanGID = (gid: string | number) => {
    if (typeof gid !== "string") {
        return gid;
    }
    return parseInt(gid.split("/").pop() ?? "0", 10);
};

export function cleanGIDs(promotionsInCart: any) {
    const cleanedPromotions = {
        frequentlyBoughtTogether: [],
        addonDiscount: [],
        volumeDiscount: [],
        upgradeDiscount: [],
    };

    // Helper function to convert GIDs to integers

    // Clean frequentlyBoughtTogether promotions
    cleanedPromotions.frequentlyBoughtTogether =
        promotionsInCart.frequentlyBoughtTogether.map(
            (promo: { promotionId: string; itemIds: any[] }) => ({
                promotionId: promo.promotionId,
                itemIds: promo.itemIds.map(cleanGID),
            }),
        );
    cleanedPromotions.volumeDiscount = promotionsInCart.volumeDiscount.map(
        (promo: { promotionId: string; itemIds: any[] }) => ({
            promotionId: promo.promotionId,
            itemIds: promo.itemIds.map(cleanGID),
        }),
    );
    cleanedPromotions.upgradeDiscount = promotionsInCart.upgradeDiscount.map(
        (promo: { promotionId: string; itemIds: any[] }) => ({
            promotionId: promo.promotionId,
            itemIds: promo.itemIds.map(cleanGID),
        }),
    );
    // No need to clean addonDiscount and volumeDiscount since they don't have itemIds in your example

    return cleanedPromotions;
}

interface Item {
    id: number;
    quantity: number;
    collections: string[];
    tags: string[];
}

interface ProductTarget {
    type: "product";
    value: { id: string; title: string; handle: string }[];
}

interface CollectionTarget {
    type: "collection";
    value: string[];
}

interface TagTarget {
    type: "tag";
    value: string[];
}

type TargetFilter = ProductTarget | CollectionTarget | TagTarget;

export function getMatchingIds(
    itemsInCart: Item[],
    targets: TargetFilter,
): number[] {
    const matchingIds: number[] = [];

    itemsInCart.forEach((item) => {
        if (targets.type === "product") {
            if (
                targets.value.some((target) => {
                    return item.id === cleanGID(target.id);
                })
            ) {
                matchingIds.push(item.id);
            }
        } else if (targets.type === "collection") {
            if (
                item.collections.some((collection) =>
                    targets.value.includes(collection),
                )
            ) {
                matchingIds.push(item.id);
            }
        } else if (targets.type === "tag") {
            if (item.tags.some((tag) => targets.value.includes(tag))) {
                matchingIds.push(item.id);
            }
        }
    });

    return matchingIds;
}

export const checkItemsInCart = (
    promo: {
        promotionId: string;
        itemIds: string[] | number[];
    },
    cart: any,
) => {
    const allInCart = promo.itemIds.every((id: any) => {
        return cart.some((line: any) => {
            return cleanGID(line.merchandise.product.id) === id;
        });
    });
    return allInCart;
};

export function processatcPromotionsMap(inputArray: any[]) {
    const uniquePromotions = inputArray.reduce(
        (accumulator, currentItem) => {
            const frequentlyBoughtTogether =
                currentItem.frequentlyBoughtTogether;
            const addonDiscount = currentItem.addonDiscount;
            const volumeDiscount = currentItem.volumeDiscount;
            const upgradeDiscount = currentItem.upgradeDiscount;
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
            if (upgradeDiscount && upgradeDiscount.promotionId) {
                const existingUpgradeDiscount =
                    accumulator.upgradeDiscount.find(
                        (promo: any) =>
                            promo.promotionId === upgradeDiscount.promotionId,
                    );

                if (!existingUpgradeDiscount) {
                    accumulator.upgradeDiscount.push(upgradeDiscount);
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
            upgradeDiscount: [],
        },
    );
    return uniquePromotions;
}
