/**
 * helper function for getting the styling objects used in form pages like FBT.
 *
 * @param loaderConfig the loader gives a config of previously saved styles, this is used to get the styling for the requested keys
 * @param type the type of styling object to return, either class or tag
 * @param requestedKeys the keys, usually class names or tag names, to return the styling for
 * @returns
 */
export const getStyling = (
    loaderConfig: any,
    type: "class" | "tag",
    requestedKeys: string[],
) => {
    if (type === "class") {
        const classObject = {};
        if (requestedKeys.includes("promo-add-to-cart")) {
            // @ts-ignore
            classObject["promo-add-to-cart"] = {
                "background-color":
                    loaderConfig?.styles?.classes["promo-add-to-cart"]?.[
                        "background-color"
                    ] ?? "#ffffff",
                color:
                    loaderConfig?.styles?.classes["promo-add-to-cart"]?.[
                        "color"
                    ] ?? "#000000",
                "border-radius":
                    loaderConfig?.styles?.classes["promo-add-to-cart"]?.[
                        "border-radius"
                    ] ?? "0px",
                "border-color":
                    loaderConfig?.styles?.classes["promo-add-to-cart"]?.[
                        "border-color"
                    ] ?? "#000000",
                "border-width":
                    loaderConfig?.styles?.classes["promo-add-to-cart"]?.[
                        "border-width"
                    ] ?? "0px",
                "border-style":
                    loaderConfig?.styles?.classes["promo-add-to-cart"]?.[
                        "border-style"
                    ] ?? "solid",
            };
        }
        if (requestedKeys.includes("triggerPlusSymbol")) {
            // @ts-ignore
            classObject["triggerPlusSymbol"] = {
                "font-size":
                    loaderConfig?.styles?.classes["triggerPlusSymbol"]?.[
                        "font-size"
                    ] ?? "12px",

                color:
                    loaderConfig?.styles?.classes["triggerPlusSymbol"]?.[
                        "color"
                    ] ?? "#000000",
                height:
                    loaderConfig?.styles?.classes["triggerPlusSymbol"]?.[
                        "height"
                    ] ?? "100px",
            };
            if (requestedKeys.includes("fbt-container")) {
                // @ts-ignore
                classObject["fbt-container"] = {
                    "background-color":
                        loaderConfig?.styles?.classes["fbt-container"]?.[
                            "background-color"
                        ] ?? "#ffffff",

                    "border-radius":
                        loaderConfig?.styles?.classes["fbt-container"]?.[
                            "border-radius"
                        ] ?? "0px",
                    "border-color":
                        loaderConfig?.styles?.classes["fbt-container"]?.[
                            "border-color"
                        ] ?? "#000000",
                    "border-width":
                        loaderConfig?.styles?.classes["fbt-container"]?.[
                            "border-width"
                        ] ?? "0px",
                    "border-style":
                        loaderConfig?.styles?.classes["fbt-container"]?.[
                            "border-style"
                        ] ?? "solid",
                    padding:
                        loaderConfig?.styles?.classes["fbt-container"]?.[
                            "padding"
                        ] ?? "8px",
                };
            }
        }
        if (requestedKeys.includes("old-price")) {
            // @ts-ignore
            classObject["old-price"] = {
                "font-size":
                    loaderConfig?.styles?.classes["old-price"]?.["font-size"] ??
                    "12px",
                "font-weight":
                    loaderConfig?.styles?.classes["old-price"]?.[
                        "font-weight"
                    ] ?? "normal",
                "font-family":
                    loaderConfig?.styles?.classes["old-price"]?.[
                        "font-family"
                    ] ?? "Arial",
                color:
                    loaderConfig?.styles?.classes["old-price"]?.["color"] ??
                    "#212121",
            };
        }
        if (requestedKeys.includes("new-price")) {
            // @ts-ignore
            classObject["new-price"] = {
                "font-size":
                    loaderConfig?.styles?.classes["new-price"]?.["font-size"] ??
                    "14px",
                "font-weight":
                    loaderConfig?.styles?.classes["new-price"]?.[
                        "font-weight"
                    ] ?? "semi-bold",
                "font-family":
                    loaderConfig?.styles?.classes["new-price"]?.[
                        "font-family"
                    ] ?? "Arial",
                color:
                    loaderConfig?.styles?.classes["new-price"]?.["color"] ??
                    "#f22222",
            };
        }
        return classObject;
    }
    if (type === "tag") {
        const tagObject = {};
        if (requestedKeys.includes("H2")) {
            // @ts-ignore
            tagObject["H2"] = {
                "font-size":
                    loaderConfig?.styles?.tags?.H2?.["font-size"] ?? "12px",
                "font-weight":
                    loaderConfig?.styles?.tags?.H2?.["font-weight"] ?? "normal",
                "font-family":
                    loaderConfig?.styles?.tags?.H2?.["font-family"] ?? "Arial",
                color: loaderConfig?.styles?.tags?.H2?.["color"] ?? "#000000",
            };
        }
        if (requestedKeys.includes("H3")) {
            // @ts-ignore
            tagObject["H3"] = {
                "font-size":
                    loaderConfig?.styles?.tags?.H3?.["font-size"] ?? "12px",
                "font-weight":
                    loaderConfig?.styles?.tags?.H3?.["font-weight"] ?? "normal",
                "font-family":
                    loaderConfig?.styles?.tags?.H3?.["font-family"] ?? "Arial",
                color: loaderConfig?.styles?.tags?.H3?.["color"] ?? "#000000",
            };
        }
        if (requestedKeys.includes("P")) {
            // @ts-ignore
            tagObject["P"] = {
                "font-size":
                    loaderConfig?.styles?.tags?.P?.["font-size"] ?? "12px",
                "font-weight":
                    loaderConfig?.styles?.tags?.P?.["font-weight"] ?? "normal",
                "font-family":
                    loaderConfig?.styles?.tags?.P?.["font-family"] ?? "Arial",
                color: loaderConfig?.styles?.tags?.P?.["color"] ?? "#000000",
            };
        }
        if (requestedKeys.includes("IMG")) {
            // @ts-ignore
            tagObject["IMG"] = {
                height: loaderConfig?.styles?.tags?.IMG?.["height"] ?? "100px",
                width: loaderConfig?.styles?.tags?.IMG?.["width"] ?? "100px",
                "border-radius":
                    loaderConfig?.styles?.tags?.IMG?.["border-radius"] ?? "0px",
            };
        }
        return tagObject;
    }
};
