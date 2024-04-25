import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import stylesheet from "~/styles.css";
import discountStyles from "extensions/upsell-app-theme/assets/styles.css";

import { authenticate } from "./shopify.server";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: stylesheet },
    { rel: "stylesheet", href: discountStyles },
];
export const loader: LoaderFunction = async ({ request }) => {
    const extensionId = process?.env?.SHOPIFY_UPSELLAPPTHEME_ID;
    const { session } = await authenticate.admin(request);
    const domain = session?.shop;
    return {
        ENV: { EXTENSION_ID: extensionId, DOMAIN: domain },
    };
};
export default function App() {
    const data = useLoaderData<typeof loader>();

    return (
        <html>
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width,initial-scale=1"
                />
                <link rel="preconnect" href="https://cdn.shopify.com/" />
                <link
                    rel="stylesheet"
                    href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
                />

                <Meta />
                <Links />
            </head>
            <body>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
                    }}
                />
                <Outlet />
                <ScrollRestoration />
                <LiveReload />
                <Scripts />
            </body>
        </html>
    );
}
