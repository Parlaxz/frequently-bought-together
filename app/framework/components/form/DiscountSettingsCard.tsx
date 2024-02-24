import { BlockStack, Card, ChoiceList, Text } from "@shopify/polaris";
import TextBox from "./TextBox";

/**
 * Renders a card component for selecting a discount type, whether
 * it be a percentage, fixed amount, or free shipping.
 *
 * @param type - The selected discount type.
 * @param value - The value of the discount.
 * @param freeShipping - Indicates if free shipping is included in the choices.
 * @param label - The label for the card. If not provided, a default label will be used.
 * @returns The DiscountTypeCard component.
 */
function DiscountSettingsCard({
    type,
    value,
    freeShipping = false,
    label,
}: {
    type: Field;
    value: Field;
    freeShipping?: boolean;
    label?: string;
}) {
    const choices = [
        {
            label: "Percentage",
            value: "percentage",
        },
        {
            label: "Fixed Amount",
            value: "fixedAmount",
        },
    ];
    if (freeShipping) {
        choices.push({
            label: "Free Shipping",
            value: "freeShipping",
        });
    }

    let discountValueBox = <></>;
    if (type.value === "percentage") {
        discountValueBox = (
            <TextBox
                field={value}
                label="Percentage Value"
                variant="percentage"
            />
        );
    } else if (type.value === "fixedAmount") {
        discountValueBox = (
            <TextBox field={value} label="Fixed Amount Value" variant="money" />
        );
    } else if (type.value === "freeShipping") {
        discountValueBox = <>FreeShipping TODO</>;
    }
    return (
        <Card>
            <BlockStack gap={"200"}>
                <Text variant="headingMd" as="h2">
                    {label ?? "LaBeL MiSsInG"}
                </Text>
                <ChoiceList
                    title="Discount Type"
                    choices={choices}
                    {...type}
                    selected={type.value}
                    onChange={(val) => {
                        type.onChange(val[0]);
                    }}
                />
                {discountValueBox}
            </BlockStack>
        </Card>
    );
}

export default DiscountSettingsCard;
