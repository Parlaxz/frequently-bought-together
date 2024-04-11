import { RangeSlider, Select } from "@shopify/polaris";
import { ColorPickerWrapper } from "./ColorPickerWrapper";

function TextStylingSettings({
    fontSizeField,
    fontWeightField,
    fontFamilyField,
    colorField,
    buildStyles,
}: {
    fontSizeField: { value: any; onChange: any };
    fontWeightField: { value: any; onChange: any };
    fontFamilyField: { value: any; onChange: any };
    colorField: { value: any; onChange: any };
    buildStyles: () => void;
}) {
    return (
        <>
            <RangeSlider
                output
                label="Font Size"
                min={4}
                max={96}
                value={fontSizeField.value.replace("px", "")}
                onChange={(value) => {
                    fontSizeField.onChange(value + "px");
                    buildStyles();
                }}
            />
            <Select
                label="Font Weight"
                options={[
                    { label: "Light", value: "light" },
                    { label: "Regular", value: "normal" },
                    { label: "Bold", value: "bold" },
                    { label: "Bolder", value: "bolder" },
                ]}
                value={fontWeightField.value}
                onChange={(value) => {
                    fontWeightField.onChange(value);
                    buildStyles();
                }}
            />
            <Select
                label="Font Family"
                options={[
                    { label: "Arial", value: "Arial" },
                    { label: "Helvetica", value: "Helvetica" },
                    {
                        label: "Times New Roman",
                        value: "Times New Roman",
                    },
                    { label: "Courier New", value: "Courier New" },
                    { label: "Verdana", value: "Verdana" },
                ]}
                value={fontFamilyField.value}
                onChange={(value) => {
                    fontFamilyField.onChange(value);
                    buildStyles();
                }}
            />
            <ColorPickerWrapper
                label="Color"
                colorHex={colorField.value}
                setColorHex={(value) => {
                    colorField.onChange(value);
                    buildStyles();
                }}
            />
        </>
    );
}

export default TextStylingSettings;
