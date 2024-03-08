import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getAppMetafields } from "~/framework/lib/helpers/metafields";
export async function loader({ request }: LoaderFunctionArgs) {
    const { admin } = await authenticate.admin(request);
    const appMetafields = await getAppMetafields(admin);

    return json({ appMetafields });
}
