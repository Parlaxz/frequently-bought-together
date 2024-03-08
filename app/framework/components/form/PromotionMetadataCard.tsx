import { BlockStack, Card, ChoiceList, Text } from "@shopify/polaris";
import TextBox from "./TextBox";
function PromotionMetadataCard({
    configuration,
    showPlacement = true,
}: {
    configuration: any;
    showPlacement?: boolean;
}) {
    return (
        <Card>
            {" "}
            <BlockStack gap={"200"}>
                <Text variant="headingMd" as="h2">
                    {"Promotion Settings"}
                </Text>{" "}
                <TextBox
                    label="Title"
                    field={configuration.metadata.title}
                    notEmpty
                />
                <TextBox
                    label="Discount Message"
                    field={configuration.metadata.discountMessage}
                    notEmpty
                />
                {showPlacement && (
                    <ChoiceList
                        title="Placement"
                        choices={[
                            { label: "Product Page", value: "productPage" },
                            {
                                label: "Cart Page",
                                value: "cartPage",
                            },
                        ]}
                        selected={[configuration.metadata.placement.value]}
                        onChange={(val) => {
                            configuration.metadata.placement.onChange(val[0]);
                        }}
                    />
                )}{" "}
                <TextBox
                    field={configuration.metadata.priority}
                    label="Priority"
                    variant="number"
                    minimum={0}
                    maximum={100}
                />
            </BlockStack>
        </Card>
    );
}

export default PromotionMetadataCard;
