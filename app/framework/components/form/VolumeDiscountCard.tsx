import {
    BlockStack,
    Card,
    ChoiceList,
    Text,
    TextField,
} from "@shopify/polaris";

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
function VolumeDiscountCard({
    volumes,
    label,
}: {
    volumes: Field;
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
    //how do I deal with arrays of objects. I need to map through the array and render a textbox for each object
    interface VolumeDiscount {
        type: "percentage" | "fixedAmount";
        value: number;
    }
    const textBoxes = volumes.value.map(
        (volumeDiscount: VolumeDiscount, index: number) => {
            return (
                <div key={"volume" + index}>
                    <div>
                        <Text variant="headingSm" as="h3">
                            {"Teir " + (index + 1)}
                        </Text>
                    </div>
                    <div className="grid grid-flow-col w-full gap-4 grid-cols-4">
                        {" "}
                        <ChoiceList
                            title="Discount Type"
                            choices={choices}
                            selected={[volumeDiscount.type]}
                            onChange={(val) => {
                                fieldFuncs.update(volumes, index, {
                                    ...volumeDiscount,
                                    type: val[0],
                                });
                            }}
                        />
                        <div className="col-span-3">
                            {/*@ts-ignore */}
                            <TextField
                                label={`Value ${index + 1}`}
                                prefix={
                                    volumeDiscount.type === "percentage"
                                        ? ""
                                        : "$"
                                }
                                suffix={
                                    volumeDiscount.type === "percentage"
                                        ? "%"
                                        : ""
                                }
                                value={volumeDiscount.value.toString()}
                                onChange={(val) => {
                                    fieldFuncs.update(volumes, index, {
                                        ...volumeDiscount,
                                        value: val,
                                    });
                                }}
                                type="number"
                            />
                        </div>
                    </div>
                </div>
            );
        },
    );

    return (
        <Card>
            {/*@ts-ignore */}
            <TextField
                label="Number of Teirs"
                value={volumes.value.length.toString()}
                onChange={(val) => {
                    if (val > volumes.value.length) {
                        fieldFuncs.add(volumes, {
                            type: "percentage",
                            value: 0,
                        });
                    } else {
                        fieldFuncs.remove(volumes, volumes.value.length - 1);
                    }
                }}
                type="number"
            />
            <BlockStack gap={"200"}>
                <Text variant="headingMd" as="h2">
                    {label ?? "LaBeL MiSsInG"}
                </Text>
                {/* <ChoiceList
                    title="Discount Type"
                    choices={choices}
                    {...type}
                    selected={type.value}
                    onChange={(val) => {
                        type.onChange(val[0]);
                    }}
                /> */}
                <>TODO Pick number of choices</>
                {textBoxes}
            </BlockStack>
        </Card>
    );
}

export default VolumeDiscountCard;

//How do I deal with arrays of objects as the value of a field?
// I need an array handler function that takes in a field with an array value and returns 3 functions: add, remove, and update.
/**
 * How do I want to edit the value? I want to be able to add a new object to the array, remove an object from the array, and update the value of an object in the array.
 * How do I want to update the value? I want to be able to update the value of an object in the array by
 * 1. passing in the index of the object to update
 * 2. passing in the new value for the object
 *
 * How do I want to remove an object from the array? I want to be able to remove an object from the array by
 * 1. passing in the index of the object to remove
 *
 * How do I want to add an object to the array? I want to be able to add an object to the array by
 * 1. passing in the new object to add
 *
 */
const add = (field: Field, newObject: object) => {
    field.onChange([...field.value, newObject]);
};
const remove = (field: Field, index: number) => {
    field.onChange(field.value.filter((_: any, i: number) => i !== index));
};
const update = (field: Field, index: number, newValue: object) => {
    field.onChange(
        field.value.map((v: any, i: number) => (i === index ? newValue : v)),
    );
};
const fieldFuncs = {
    add,
    remove,
    update,
};
