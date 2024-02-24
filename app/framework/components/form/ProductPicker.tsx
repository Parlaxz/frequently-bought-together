import { BlockStack, Card, ChoiceList, Text } from "@shopify/polaris";
import TagPicker from "./TagPicker";
import { ResourcePicker } from "./ResourcePicker";

function ProductPicker({
    type,
    value,
    tags,
    label = "",
    isCard = true,
}: {
    type: Field;
    value: Field;
    tags: string[];
    label?: string;
    isCard?: boolean;
}) {
    const content = (
        <BlockStack gap={"200"}>
            <Text variant="headingMd" as="h2">
                {label ?? "Pick your Products"}
            </Text>
            <ChoiceList
                title="Trigger Type"
                choices={[
                    {
                        label: "Product",
                        value: "product",
                    },
                    {
                        label: "Collection",
                        value: "collection",
                    },
                    {
                        label: "Tag",
                        value: "tag",
                    },
                ]}
                {...type}
                selected={type.value}
                onChange={(val) => {
                    type.onChange(val[0]);
                    value.defaultValue = [];
                    value.value = [];
                }}
            />
            {type.value === "tag" ? (
                <TagPicker tags={tags} {...value} selectedTags={value.value} />
            ) : type.value === "collection" ? (
                <ResourcePicker
                    key={type.value}
                    label="Pick your Trigger Collections"
                    {...value}
                    isCollection
                />
            ) : type.value === "product" ? (
                <ResourcePicker label="Pick your Trigger Products" {...value} />
            ) : (
                <></>
            )}
        </BlockStack>
    );
    return <>{isCard ? <Card>{content}</Card> : content}</>;
}

export default ProductPicker;
