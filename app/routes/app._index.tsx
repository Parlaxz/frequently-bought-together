import {
    json,
    type ActionFunctionArgs,
    type LoaderFunctionArgs,
} from "@remix-run/node";
import {
    Page,
    Card,
    BlockStack,
    Link,
    IndexTable,
    Text,
} from "@shopify/polaris";
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
                    <PromotionsTable promotions={promotions} />
                </Card>
            </BlockStack>
        </Page>
    );
}

function PromotionsTable({ promotions }: { promotions: Promotion[] }) {
    const resourceName = {
        singular: "promotion",
        plural: "promotions",
    };
    //!--------------------Config Here--------------------
    const typeDict = {
        frequentlyBoughtTogether: "Frequently Bought Together",
        volumeDiscount: "Volume Discount",
    };
    const typeToUrl = {
        frequentlyBoughtTogether: "/app/frequently-bought-together",
        volumeDiscount: "/app/volume-discount",
    };
    //!------------------End Config Here------------------
    const rowMarkup = promotions.map(({ id, title, type, priority }, index) => (
        <IndexTable.Row id={id} key={id} position={index}>
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="bold" as="span">
                    <Link url={typeToUrl[type] + "/" + id}>{title}</Link>
                </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>{id}</IndexTable.Cell>
            <IndexTable.Cell>{typeDict[type]}</IndexTable.Cell>
            <IndexTable.Cell>{priority}</IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
        <IndexTable
            resourceName={resourceName}
            itemCount={promotions.length}
            headings={[
                { title: "Title" },
                { title: "Id" },
                { title: "Type" },
                { title: "Priority" },
                //TODO: created at
                //stats like selleasy
            ]}
        >
            {rowMarkup}
        </IndexTable>
    );
}
