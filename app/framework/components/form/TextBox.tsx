import { TextField } from "@shopify/polaris";

type Variant = "text" | "money" | "percentage" | "number";
function TextBox({
    field,
    variant = "text",
    minimum = -Math.pow(10, 1000),
    maximum = Math.pow(10, 1000),
    notEmpty = false,
    label,
}: {
    field: Field;
    variant?: Variant;
    minimum?: number;
    maximum?: number;
    notEmpty?: boolean;
    label: string;
}) {
    if (variant === "money") {
        return (
            <TextField
                label={label}
                autoComplete="on"
                selectTextOnFocus
                prefix="$"
                {...field}
                value={field.value}
                onChange={(val) => {
                    field.onChange(val);
                }}
                error={field.value < 0 ? "Value cannot be negative" : undefined}
            />
        );
    } else if (variant === "percentage") {
        return (
            <TextField
                label={label}
                autoComplete="on"
                suffix="%"
                selectTextOnFocus
                {...field}
                onChange={(val) => {
                    field.onChange(
                        Math.min(100, Math.max(0, parseInt(val))) || 0,
                    );
                }}
            />
        );
    } else if (variant === "number") {
        return (
            <TextField
                label={label}
                autoComplete="on"
                type="number"
                selectTextOnFocus
                {...field}
                onChange={(val) => {
                    field.onChange(parseInt(val) || 1);
                }}
                error={
                    field.value < minimum
                        ? `Value cannot be less than ${minimum}`
                        : field.value > maximum
                          ? `Value cannot be greater than ${maximum}`
                          : undefined
                }
            />
        );
    } else {
        return (
            <TextField
                label={label}
                autoComplete="on"
                selectTextOnFocus
                {...field}
                onChange={(val) => {
                    field.onChange(val);
                }}
                error={
                    notEmpty && field.value === "" && field.touched
                        ? "Field cannot be empty"
                        : undefined
                }
            />
        );
    }
}

export default TextBox;
