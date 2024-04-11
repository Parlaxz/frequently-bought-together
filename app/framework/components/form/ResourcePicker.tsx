import { Button } from "@shopify/polaris";
import { useState } from "react";

export function ResourcePicker({
    label,
    isCollection = false,
    value,
    defaultValue = [],
    onChange,
}: {
    label: string;
    isCollection?: boolean;
    value: any;
    defaultValue?: any;
    onChange: any;
}) {
    const [product, setProduct] = useState<any>(defaultValue);
    const handleClick = async () => {
        try {
            const selected = await shopify.resourcePicker({
                multiple: true,
                type: isCollection ? "collection" : "product",
                selectionIds: product?.map(
                    (product: { id: string; title: string }) => {
                        return { id: product.id };
                    },
                ),
                filter: {
                    hidden: true,
                    variants: false,
                    draft: false,
                    archived: false,
                },
            });
            if (selected) {
                onChange(
                    selected.map((product) => {
                        return {
                            id: product.id,
                            title: product.title,
                            handle: product.handle ?? product.title,
                        };
                    }),
                );

                setProduct(
                    selected.map((product) => {
                        return {
                            id: product.id,
                            title: product.title,
                            handle: product.handle ?? product.title,
                        };
                    }),
                );
            }
        } catch (e) {
            console.error(e);
        }
    };

    const productTitles = product?.map(
        (product: { id: string; title: string }) => (
            <li key={product.id}>• {product.title}</li>
        ),
    );
    return (
        <>
            <Button onClick={handleClick}>{label}</Button>
            {productTitles && <ul> {productTitles}</ul>}
        </>
    );
}
