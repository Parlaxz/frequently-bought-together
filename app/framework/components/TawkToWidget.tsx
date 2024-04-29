import { useEffect } from "react";

function TawkToScript() {
    useEffect(() => {
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://embed.tawk.to/662ff510a0c6737bd1325d33/1hsllaif3";
        script.charset = "UTF-8";
        script.setAttribute("crossorigin", "*");
        document.body.appendChild(script);
    }, []);

    return null;
}

export default TawkToScript;
