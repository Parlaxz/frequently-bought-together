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
    Button,
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import {
    deletePromotion,
    getPromotions,
} from "~/framework/lib/helpers/metafields";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin } = await authenticate.admin(request);

    const promotions: Promotion[] = await getPromotions(admin);
    return json({ promotions });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);
    const formData = await request.formData();
    console.log("formData", formData);
    const parsedId = await String(formData.get("id"));
    console.log("parsedId", parsedId);
    const response = await deletePromotion(admin, session, parsedId);
    return json({ response });
};
interface Promotion {
    id: string;
    title: string;
    type: "frequentlyBoughtTogether";
    configuration: object;
    styling: object;
    priority: number;
}
const promotionTypes = [
    {
        type: "frequentlyBoughtTogether",
        title: "Frequently Bought Together",
        url: "/app/frequently-bought-together",
    },
    {
        type: "volumeDiscount",
        title: "Volume Discount",
        url: "/app/volume-discount",
    },
    {
        type: "productAddons",
        title: "Product Add-ons",
        url: "/app/product-addons",
    },
    {
        type: "bxgyDiscount",
        title: "BXGY Discount",
        url: "/app/bxgy-discount",
    },
    {
        type: "announcementPromotion",
        title: "Announcement Discount",
        url: "/app/announcement-discount",
    },
    { type: "freeGift", title: "Free Gift", url: "/app/free-gift" },
    { type: "upsurge", title: "Upsurge", url: "/app/upsurge" },
    {
        type: "countdownTimer",
        title: "Countdown Timer",
        url: "/app/countdown-timer",
    },
];

export default function Index() {
    const { promotions }: { promotions: Promotion[] } = useLoaderData();
    console.log("promotions", promotions);

    return (
        <Page>
            <ui-title-bar title="Remix app template"></ui-title-bar>

            <BlockStack gap="500">
                <Card>
                    <div className="grid">
                        {promotionTypes.map((promotionType) => (
                            <Link
                                url={promotionType.url + "/new"}
                                key={promotionType.url}
                            >
                                new {promotionType.title}
                            </Link>
                        ))}
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
    const [deletionId, setDeletionId] = useState<string>("");
    const [deleteMessage, setDeleteMessage] = useState<string>("");

    const rowMarkup = promotions.map(({ id, title, type, priority }, index) => (
        <IndexTable.Row id={id} key={id} position={index}>
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="bold" as="span">
                    <Link
                        url={
                            promotionTypes.find(
                                (promotion) => promotion.type === type,
                            )?.url +
                            "/" +
                            id
                        }
                    >
                        {title}
                    </Link>
                </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>{id}</IndexTable.Cell>
            <IndexTable.Cell>
                {promotionTypes.find((promotion) => {
                    return promotion.type === type;
                })?.title ?? "Unknown"}
            </IndexTable.Cell>
            <IndexTable.Cell>{priority}</IndexTable.Cell>
            <IndexTable.Cell>
                <Button
                    onClick={() => {
                        // @ts-ignore
                        document?.getElementById("my-modal")?.show();
                        // @ts-ignore
                        setDeletionId(id);
                        setDeleteMessage(
                            `Are you sure you want to delete the ${
                                promotionTypes.find((promotion) => {
                                    return promotion.type === type;
                                })?.title ?? "Unknown"
                            }} promotion ${title}?`,
                        );
                    }}
                    icon={DeleteIcon}
                ></Button>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));
    const fetcher = useFetcher();
    return (
        <fetcher.Form method={"post"}>
            <input type="hidden" name="id" value={deletionId} />
            <ui-modal id="my-modal">
                <p>{deleteMessage}</p>
                <ui-title-bar title="Title">
                    <button
                        variant="primary"
                        onClick={(event) => {
                            fetcher.submit(event.currentTarget.form, {
                                method: "POST",
                            });
                        }}
                    >
                        Delete
                    </button>
                    <button
                        // @ts-ignore
                        onclick={() => {
                            // @ts-ignore
                            document.getElementById("my-modal").hide();
                        }}
                    >
                        Close
                    </button>
                </ui-title-bar>
            </ui-modal>
            <IndexTable
                resourceName={resourceName}
                itemCount={promotions.length}
                headings={[
                    { title: "Title" },
                    { title: "Id" },
                    { title: "Type" },
                    { title: "Priority" },
                    //stats like selleasy
                ]}
            >
                {rowMarkup}
            </IndexTable>
        </fetcher.Form>
    );
}
