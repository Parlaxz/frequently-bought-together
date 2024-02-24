import {
    json,
    type ActionFunctionArgs,
    type LoaderFunctionArgs,
} from "@remix-run/node";
import { Page, Card, BlockStack, Link } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getPromotions } from "~/framework/lib/helpers/metafields";
import { useLoaderData } from "@remix-run/react";
export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin } = await authenticate.admin(request);
    const promotions: Promotion[] = await getPromotions(admin);
    return json({ promotions });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    return null;
};
interface Promotion {
    id: string;
    title: string;
    type: "frequentlyBoughtTogether";
    configuration: object;
    styling: object;
    priority: number;
}
export default function Index() {
    const { promotions }: { promotions: Promotion[] } = useLoaderData();
    console.log("promotions", promotions);
    return (
        <Page>
            <ui-title-bar title="Remix app template"></ui-title-bar>
            <BlockStack gap="500">
                <Card>
                    <div className="text-red-500">red text</div>
                    <div className="grid">
                        <Link url="/app/frequently-bought-together/new">
                            new Frequently Bought Together
                        </Link>
                        <Link url="/app/volume-discount/new">
                            new Volume Discount
                        </Link>
                    </div>
                </Card>
                <Card>
                    {promotions.map((promotion) => {
                        const promoType =
                            promotion.type === "frequentlyBoughtTogether"
                                ? "frequently-bought-together"
                                : promotion.type === "volumeDiscount"
                                  ? "volume-discount"
                                  : "frequently-bought-together";
                        const url = `/app/${promoType}/${promotion.id}`;
                        return (
                            <div key={promotion.id} className="flex">
                                <Link url={url}>
                                    {promotion?.title.length > 0
                                        ? promotion?.title
                                        : "Untitled"}
                                </Link>
                                <div>{promotion.type}</div>
                            </div>
                        );
                    })}
                </Card>
            </BlockStack>
        </Page>
    );
}
