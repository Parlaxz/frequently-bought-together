import { Banner, Card } from "@shopify/polaris";
import { useEffect, useState } from "react";
declare global {
    interface Window {
        ENV: {
            EXTENSION_ID: string;
            DOMAIN: string;
        };
    }
}
function ActivationBox() {
    if (typeof window !== "undefined") {
        var myshopDomain = window.ENV?.DOMAIN;
        var uuid = window.ENV.EXTENSION_ID;
    }

    const handle = "app-embed";
    const [enabled, setEnabled] = useState(true);
    const [changed, setChanged] = useState(false);
    const [link, setLink] = useState("");
    const checkEnabled = async (initial = false) => {
        const response = await fetch("/api/installData");
        const data = await response.json();
        console.log("data", data);
        console.log("data.enabled", data.enabled);
        console.log("initial", initial);
        if (initial && data.enabled) setEnabled(true);
        else if (data.enabled) setChanged(true);
        else setEnabled(false);
    };
    useEffect(() => {
        setLink(
            `https://${myshopDomain}/admin/themes/current/editor?context=apps&activateAppId=${uuid}/${handle}`,
        );
        checkEnabled(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Card>
            {!enabled ? (
                <Banner
                    title={
                        changed
                            ? "Your app is now enabled"
                            : "To use app, activate the app embed in your theme:"
                    }
                    action={{
                        content: "Activate Embed",
                        onAction: () => {
                            setInterval(() => {
                                checkEnabled();
                            }, 3000);
                        },
                        url: link,
                        target: "_blank",
                    }}
                    tone={changed ? "success" : "warning"}
                ></Banner>
            ) : null}
        </Card>
    );
}

export default ActivationBox;
