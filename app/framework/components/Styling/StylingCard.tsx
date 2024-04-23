import { Card, Text } from "@shopify/polaris";
import { generateMasterCard } from "./SnippetPreview";

function StylingCard({ configuration }: { configuration: any }) {
    const classCards = Object.entries(configuration.styles.classes).map(
        ([key, value]) => {
            return <>{generateMasterCard(value, configuration, key, false)}</>;
        },
    );
    const tagCards = Object.entries(configuration.styles.tags).map(
        ([key, value]) => {
            return <>{generateMasterCard(value, configuration, key, false)}</>;
        },
    );
    const stylingCards = [...classCards, ...tagCards];
    return (
        <Card>
            <Text variant="headingLg" as="h2">
                Styling
            </Text>
            {stylingCards}
        </Card>
    );
}

export default StylingCard;
