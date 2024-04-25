import type { LoaderFunction } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import type { Session } from "@shopify/shopify-api";
// Action function
// export const action: ActionFunction = async ({ request }) => {
// 	//get body
// 	const body = await request.json();
// 	//get app id via shopify gql
// 	const { admin } = await authenticate.admin(request);
// 	const response = await admin.graphql(getAppIdQuery);
// 	const data = await response.json();
// 	const appId = data?.data?.currentAppInstallation?.id;
// 	//create metafield
// 	// iterate(body);

// 	return {
// 		json: { message: "Action completed successfully" },
// 		data: metafieldData,
// 	};
// };

// Loader function
export const loader: LoaderFunction = async ({ request }) => {
    //get the metafields via appInstallation metafields connection
    const { admin, session } = await authenticate.admin(request);
    const extensionId = process?.env?.SHOPIFY_UPSELLAPPTHEME_ID;
    const appIdResponse = await admin.graphql(getAppIdQuery);
    const appId = await appIdResponse.json();
    const themesResponse = await admin.rest.resources.Theme.all({
        session: session as Session,
    });

    const mainTheme = await themesResponse.data.find(
        (theme) => theme.role === "main",
    );
    const mainId = mainTheme?.id;
    const settingsData = await admin.rest.resources.Asset.all({
        session: session as Session,
        theme_id: mainId,
        asset: { key: "config/settings_data.json" },
    });
    const valueData = JSON.parse(settingsData?.data?.[0]?.value ?? "");
    console.log("valueData", valueData?.current);
    console.log("valueData", valueData?.current?.blocks);
    console.log("id", appId?.data?.currentAppInstallation?.id);
    console.log("extensionId", extensionId);
    // find app block where type contains the substring "shopify://apps/testing/blocks"
    //valueData?.current?.blocks is an object with keys that are the block ids and values that are the block objects with keys "type" and "settings"
    const appBlock = Object.values(valueData?.current?.blocks)?.find((block) =>
        //@ts-ignore
        block?.type?.includes(extensionId),
    );
    let enabled = false;
    if (appBlock) {
        //@ts-ignore
        enabled = !appBlock?.disabled;
    }

    return {
        json: { message: "Loader completed successfully" },
        enabled: enabled,
    };
};
const getAppIdQuery = `#graphql
query {
    currentAppInstallation {
      id
    }
  }`;
