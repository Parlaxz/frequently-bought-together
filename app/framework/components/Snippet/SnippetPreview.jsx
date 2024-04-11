import { Card, Text } from "@shopify/polaris";
import { useEffect, useState } from "react";
import StylingField from "../form/StylingField";
import {
    fbtSnippetConfig,
    ugSnippetConfig,
    vdSnippetConfig,
} from "./snippetConfigurations";
/**
 * There are 3 configurations on this page
 * 1. The identifier configuration is used so that the Snippet knows which element was clicked
 * 2. The insertion configuration is used to insert the section into the page
 * 3. The display configuration is used to determine which settings to display
 */

function SnippetPreview({ type, configuration }) {
    console.log("Configuration!", configuration);
    const [styleController, setStyleController] = useState("");
    // Identifiers for the frequently bought together section
    // These identifiers are used to determine which element was clicked
    let snippetSettings = {};
    console.log("type: ", type);
    if (type === "frequently-bought-together") {
        snippetSettings = fbtSnippetConfig;
    } else if (type === "volume-discount") {
        snippetSettings = vdSnippetConfig;
    } else if (type === "upgrade-discount") {
        snippetSettings = ugSnippetConfig;
    }
    const identifers = snippetSettings.identifiers;
    const offerProducts = snippetSettings.offerProducts;
    const insertFunction = snippetSettings.insertFunction;
    const formId = snippetSettings.formId;

    useEffect(() => {
        //clear contents of product-form
        let appComponentContainer = document.querySelector(
            "#appComponentContainer",
        );
        if (appComponentContainer) appComponentContainer.remove();
        insertFunction(offerProducts, configuration.id, configuration);
        appComponentContainer = document.querySelector(
            "#appComponentContainer",
        );
        if (appComponentContainer)
            appComponentContainer.onclick = (e) => handleClick(e, identifers);
        buildStyles(configuration.styles, formId);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [configuration, type]);

    function handleClick(e, identifiers) {
        e.preventDefault();

        const target = e.target;
        const indicateSelected = (node) => {
            node.style.boxShadow = "0 0 10px 0 red";
            setTimeout(() => {
                node.style.boxShadow = "none";
            }, 1000);
        };
        const setSelected = (node, indicator) => {
            setStyleController(indicator.value);
            indicateSelected(node);
            return indicator.ret;
        };
        function recursive(node) {
            console.log("node: ", node);

            for (let identifier of identifiers) {
                if (identifier.type === "tag") {
                    if (node.tagName === identifier.value) {
                        return setSelected(node, identifier);
                    }
                }
                if (identifier.type === "id") {
                    if (node.id === identifier.value) {
                        return setSelected(node, identifier);
                    }
                }
                if (identifier.type === "class") {
                    if (node.classList.contains(identifier.value)) {
                        return setSelected(node, identifier);
                    }
                }
            }

            return recursive(node.parentNode);
        }

        console.log(recursive(target));
    }

    let masterCard = <></>;

    console.log("identifers: ", identifers);
    console.log("styleController: ", styleController);
    const classOrTag = identifers.find(
        (identifier) => identifier.value === styleController,
    )?.type;
    console.log("classOrTag: ", classOrTag);
    if (styleController) {
        console.log("configuration.styles: ", configuration.styles);
        const pluralType = {
            tag: "tags",
            class: "classes",
        };

        const style =
            configuration.styles[pluralType[classOrTag]]?.[styleController];
        console.log("style: ", style);
        masterCard = generateMasterCard(style, configuration, styleController);
    }
    return (
        <>
            currently Selected: {styleController}
            <Card>
                <div className="product-form"></div>
            </Card>
            {masterCard}
        </>
    );
}

const generateMasterCard = (styles, configuration, titleStyle) => {
    if (!styles) {
        return <>TODO</>;
    }
    const header = {
        H3: "Product Title Settings",
        P: "Price Settings",
        H2: "Container Title Settings",
        "fbt-container": "Container Settings",
        "product-card": "Container Settings",
        triggerPlusSymbol: "Plus Symbol Settings",
        IMG: "Image Settings",
    }[titleStyle];
    const styleSheets = [];
    for (const [style, value] of Object.entries(styles)) {
        const val = value.value;
        console.log("style: ", style);
        console.log("val: ", val);
        const typeDict = {
            "font-size": { type: "font-size", label: "Font Size" },
            height: { type: "height-px", label: "Height" },
            width: { type: "width-px", label: "Width" },
            "font-weight": {
                type: "font-weight",
                label: "Font Weight",
            },
            "font-family": {
                type: "font-family",
                label: "Font Family",
            },
            color: { type: "color", label: "Color" },
            "border-radius": {
                type: "border-radius",
                label: "Border Curvature",
            },
            "border-color": {
                type: "border-color",
                label: "Border Color",
            },
            "border-width": {
                type: "border-width",
                label: "Border Width",
            },
            "border-style": {
                type: "border-style",
                label: "Border Style",
            },
            padding: { type: "padding", label: "Padding" },
            "background-color": {
                type: "background-color",
                label: "Background Color",
            },
            "margin-bottom": {
                type: "margin-bottom",
                label: "Margin Bottom",
            },
            size: { type: "size", label: "Size" },
        };
        console.log("type:" + typeDict[style].type);

        console.log("label:" + typeDict[style].label);
        styleSheets.push(
            <StylingField
                type={typeDict[style].type}
                field={value}
                configuration={configuration}
                label={typeDict[style].label}
            />,
        );
    }

    return (
        <Card>
            <Text variant="headingMd" as="h2">
                {header}
            </Text>
            {styleSheets}
        </Card>
    );
};

export default SnippetPreview;

export const buildStyles = (styles, containerClass) => {
    const styleClasses = styles.classes;
    const styleTags = styles.tags;
    const styleIds = styles.ids;

    const currentStyle = document.getElementById("customACStyles");
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.id = "customACStyles";
    console.log("styleSheet: ", styleSheet);
    console.log("currentStyle: ", currentStyle);

    let styleString = "";
    if (styleClasses) {
        for (const [key, value] of Object.entries(styleClasses)) {
            styleString += `${containerClass} .${key} {`;
            for (const [prop, propValue] of Object.entries(value)) {
                styleString += `${prop}: ${propValue.value};`;
            }
            styleString += "}";
        }

        if (styleTags) {
            for (const [key, value] of Object.entries(styleTags)) {
                styleString += `${containerClass} ${key.toLowerCase()} {`;
                for (const [prop, propValue] of Object.entries(value)) {
                    styleString += `${prop}: ${propValue.value};`;
                }
                styleString += "}";
            }
        }

        if (styleIds) {
            for (const [key, value] of Object.entries(styleIds)) {
                styleString += `${containerClass} #${key} {`;
                for (const [prop, propValue] of Object.entries(value)) {
                    styleString += `${prop}: ${propValue.value};`;
                }
                styleString += "}";
            }
        }

        styleSheet.innerHTML = styleString;
        console.log("styleSheet: ", styleSheet);
    }

    if (currentStyle) {
        currentStyle.innerHTML = styleSheet.innerHTML;
    } else {
        document.head.appendChild(styleSheet);
    }
};
