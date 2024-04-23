import { ChoiceList, RangeSlider, TextField } from "@shopify/polaris";
import { buildStyles } from "../Styling/SnippetPreview";
import { ColorPickerWrapper } from "./ColorPickerWrapper";

function StylingField({
    field,
    configuration,
    label,
    type,
}: {
    field: any;
    label: string;
    configuration: any;
    type: string;
}) {
    if (type === "border-radius") {
        return (
            <RangeSlider
                label={label}
                min={0}
                max={100}
                value={field.value.replace("px", "")}
                onChange={(value) => {
                    field.onChange(`${value}px`);
                    buildStyles(configuration.styles, ".fbt-form");
                }}
            />
        );
    }
    if (type === "height-%" || type === "width-%") {
        return (
            <RangeSlider
                label={label}
                min={0}
                max={100}
                value={field.value.replace("%", "")}
                onChange={(value) => {
                    field.onChange(`${value}%`);
                    buildStyles(configuration.styles, ".fbt-form");
                }}
            />
        );
    }
    if (type === "height-px" || type === "width-px") {
        return (
            <TextField
                label={label}
                type="number"
                suffix="px"
                autoComplete="off"
                min={0}
                max={1024}
                value={field.value.replace("px", "")}
                onChange={(value) => {
                    field.onChange(`${value}px`);
                    buildStyles(configuration.styles, ".fbt-form");
                }}
            />
        );
    }
    if (type === "padding") {
        return (
            <TextField
                label={label}
                type="number"
                suffix="px"
                autoComplete="off"
                min={0}
                max={100}
                value={field.value.replace("px", "")}
                onChange={(value) => {
                    field.onChange(`${value}px`);
                    buildStyles(configuration.styles, ".fbt-form");
                }}
            />
        );
    }
    if (type === "background-color") {
        return (
            <ColorPickerWrapper
                label={label}
                colorHex={field.value}
                setColorHex={(value) => {
                    field.onChange(value);
                }}
            />
        );
    }
    if (type === "border-color") {
        return (
            <ColorPickerWrapper
                label={label}
                colorHex={field.value}
                setColorHex={(value) => {
                    field.onChange(value);
                }}
            />
        );
    }
    if (type === "border-width") {
        return (
            <TextField
                label={label}
                type="number"
                suffix="px"
                autoComplete="off"
                min={0}
                max={100}
                value={field.value.replace("px", "")}
                onChange={(value) => {
                    field.onChange(`${value}px`);
                    buildStyles(configuration.styles, ".fbt-form");
                }}
            />
        );
    }
    if (type === "border-style") {
        return (
            <ChoiceList
                title={label}
                choices={[
                    { label: "None", value: "none" },
                    { label: "Dotted", value: "dotted" },
                    { label: "Dashed", value: "dashed" },
                    { label: "Solid", value: "solid" },
                    { label: "Double", value: "double" },
                    { label: "Groove", value: "groove" },
                    { label: "Ridge", value: "ridge" },
                    { label: "Inset", value: "inset" },
                    { label: "Outset", value: "outset" },
                ]}
                selected={[field.value]}
                onChange={(value) => {
                    field.onChange(value[0]);
                    buildStyles(configuration.styles, ".fbt-form");
                }}
            ></ChoiceList>
        );
    }
    if (type === "font-size") {
        return (
            <TextField
                label={label}
                type="number"
                suffix="px"
                autoComplete="off"
                min={0}
                max={100}
                value={field.value.replace("px", "")}
                onChange={(value) => {
                    field.onChange(`${value}px`);
                    buildStyles(configuration.styles, ".fbt-form");
                }}
            />
        );
    }
    if (type === "color") {
        return (
            <ColorPickerWrapper
                label={label}
                colorHex={field.value}
                setColorHex={(value) => {
                    field.onChange(value);
                }}
            />
        );
    }
    if (type === "margin-bottom") {
        return (
            <RangeSlider
                label={label}
                min={0}
                max={120}
                value={field.value.replace("px", "")}
                onChange={(value) => {
                    field.onChange(`${value}px`);
                    buildStyles(configuration.styles, ".fbt-form");
                }}
            />
        );
    }
    if (type === "font-family") {
        return (
            <ChoiceList
                title={label}
                choices={[
                    { label: "Arial", value: "Arial" },
                    { label: "Helvetica", value: "Helvetica" },
                    { label: "Times New Roman", value: "Times New Roman" },
                    { label: "Courier New", value: "Courier New" },
                    { label: "Verdana", value: "Verdana" },
                ]}
                selected={[field.value]}
                onChange={(value) => {
                    field.onChange(value[0]);
                    buildStyles(configuration.styles, ".fbt-form");
                }}
            ></ChoiceList>
        );
    }
    if (type === "font-weight") {
        return (
            <ChoiceList
                title={label}
                choices={[
                    { label: "Light", value: "light" },
                    { label: "Regular", value: "normal" },
                    { label: "Bold", value: "bold" },
                    { label: "Bolder", value: "bolder" },
                ]}
                selected={[field.value]}
                onChange={(value) => {
                    field.onChange(value[0]);
                    buildStyles(configuration.styles, ".fbt-form");
                }}
            ></ChoiceList>
        );
    }
}

export default StylingField;
