import { Button } from "@shopify/polaris";
import { useState } from "react";

export function ResourcePicker({
    label,
    isCollection = false,
}: {
    label: string;
    isCollection?: boolean;
}) {
    const [product, setProduct] = useState<any>([]);
    const handleClick = async () => {
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
