// @ts-check
import type {
    RunInput,
    FunctionRunResult,
    Target,
    ProductVariant,
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

    // Define a type for your configuration, and parse it from the metafield
    const configuration = JSON.parse(
        input?.discountNode?.metafield?.value ?? "{}",
    );
    const promosInCart = removeDuplicates(
        input.cart.lines.map((line) => {
            return JSON.parse(line?.attribute?.value ?? "{}");
        }),
    ).filter((n) => n);
    const promotions: any = Object.values(configuration);

    //TODO: 1. iterate through promosInCart and check that all items in each cartPromotion is in the cart
    // if all items in the cartPromotion are in the cart, then apply the promotion by getting the promotion data from the promotionId
    // in the promotions array
    const ATCPromoDiscounts = promosInCart.map((cartPromotion) => {
        const promotion = promotions.find((promo: { id: any }) => {
            return promo.id === cartPromotion.promotionId;
        });
        if (promotion) {
            // promotion is found in the promotions array
            // get the discount percentage and apply it to the items in the cart
            const cartLineItems = input.cart.lines
                .filter(
                    (line) => line.merchandise.__typename == "ProductVariant",
                )
                .map((line) => {
                    const variant: ProductVariant =
                        line.merchandise as ProductVariant;
                    return {
                        productVariant: {
                            id: variant.id,
                        },
                    };
                });

            console.log(
                "cartLineItems",
                JSON.stringify(cartLineItems, null, 2),
            );
            let discountValue = {};
            if (promotion?.configuration?.offerDiscount.type === "percentage") {
                discountValue = {
                    percentage: {
                        value: parseFloat(
                            promotion?.configuration?.offerDiscount.value,
                        ),
                    },
                };
            } else if (
                promotion?.configuration?.offerDiscount.type === "fixed"
            ) {
                discountValue = {
                    fixed: {
                        value: parseFloat(
                            promotion?.configuration?.offerDiscount.value,
                        ),
                    },
                };
            }

            return {
                discounts: [
                    {
                        targets: cartLineItems,
                        value: {
                            ...discountValue,
                        },
                    },
                ],
                discountApplicationStrategy: DiscountApplicationStrategy.First,
            };
        }
        return EMPTY_DISCOUNT;
    });
    console.log(
        "atcPromoDiscounts",
        JSON.stringify(ATCPromoDiscounts, null, 2),
    );
    //TODO: 2. find any promotions in the promotion array that are not ATC triggered and check their conditions
    // if the conditions are met, apply the promotion to the relevent items in the cart

    if (!configuration.quantity || !configuration.percentage) {
        return EMPTY_DISCOUNT;
    }

    const targets: Target[] = input.cart.lines
        // Use the configured quantity instead of a hardcoded value
        .filter(
            (line) =>
                line.quantity >= configuration.quantity &&
                line.merchandise.__typename == "ProductVariant",
        )
        .map((line) => {
            const variant: ProductVariant = line.merchandise as ProductVariant;
            return {
                productVariant: {
                    id: variant.id,
                },
            };
        });

    if (!targets.length) {
        console.error("No cart lines qualify for volume discount.");
        return EMPTY_DISCOUNT;
    }

    return {
        discounts: [
            {
                targets,
                value: {
                    percentage: {
                        // Use the configured percentage instead of a hardcoded value
                        value: configuration.percentage.toString(),
                    },
                },
            },
        ],
        discountApplicationStrategy: DiscountApplicationStrategy.First,
    };
}

/**
 * Removes duplicate elements from an array, accounting for even deeply nested objects.
 * @param arr - The array to remove duplicates from.
 * @returns A new array with duplicate elements removed.
 */
function removeDuplicates(arr: any[]) {
    return arr.filter(
        (value, index, self) =>
            index ===
            self.findIndex(
                (t) => t.place === value.place && t.name === value.name,
            ),
    );
}
