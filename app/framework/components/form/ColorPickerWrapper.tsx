import { Card, ColorPicker, Label, Popover, TextField } from "@shopify/polaris";
import type { HSBAColor } from "@shopify/polaris";
import { useState } from "react";

import { hexToHsb, hsbToHex } from "~/framework/lib/helpers/wrapperHelpers";

export function ColorPickerWrapper({
    label,
    colorHex,
    setColorHex,
}: {
    label: string;
    colorHex: string;
    setColorHex: (newValue: string) => void;
}) {
    const [visible, setIsVisible] = useState(false);
    console.log("ColorPickerWrapper", colorHex);

    const color = hexToHsb(colorHex);
    const setColor = (newValue: HSBAColor) => {
        setColorHex(
            hsbToHex(newValue.hue, newValue.saturation, newValue.brightness),
        );
    };

    const handleColorChange = (newValue: HSBAColor) => {
        setColor(newValue);
    };

    return (
        <>
            <Label id={"ColorPicker " + label}>{label}</Label>
            <div className="grid grid-flow-col gap-4 w-fit">
                <Popover
                    active={visible}
                    preferredPosition="below"
                    preferredAlignment="left"
                    preventCloseOnChildOverlayClick
                    onClose={() => setIsVisible(false)}
                    activator={
                        <button
                            onClick={(event) => {
                                setIsVisible(!visible);
                                event.preventDefault();
                            }}
                            className="rounded-lg w-12 h-8 border border-neutral-500"
                            style={{ backgroundColor: colorHex }}
                        ></button>
                    }
                >
                    <Card>
                        <ColorPicker
                            onChange={handleColorChange}
                            color={color}
                        />
                    </Card>
                </Popover>
                <TextField
                    label=""
                    id={"TextField " + label}
                    value={colorHex}
                    onChange={setColorHex}
                    autoComplete="off"
                    error={
                        colorHex.length !== 7 && colorHex.length !== 4
                            ? "Invalid hex code"
                            : ""
                    }
                />
            </div>
        </>
    );
}
