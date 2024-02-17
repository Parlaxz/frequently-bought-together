import { getPromotions } from "./helpers";

describe("getPromotions", () => {
    it("should return the promotions metafield", async () => {
        // Mock the getAppMetafields function
        const getAppMetafields = jest.fn().mockResolvedValue({
            edges: [
                {
                    node: {
                        namespace: "storage",
                        key: "promotions",
                        value: "Some promotions data",
                    },
                },
            ],
        });

        // Call the getPromotions function
        const promotions = await getPromotions({ getAppMetafields });

        // Assert that the promotions metafield is returned correctly
        expect(promotions).toEqual({
            node: {
                namespace: "storage",
                key: "promotions",
                value: "Some promotions data",
            },
        });

        // Assert that the getAppMetafields function is called with the correct arguments
        expect(getAppMetafields).toHaveBeenCalledWith(admin);
    });

    it("should return undefined if promotions metafield is not found", async () => {
        // Mock the getAppMetafields function
        const getAppMetafields = jest.fn().mockResolvedValue({
            edges: [
                {
                    node: {
                        namespace: "storage",
                        key: "other",
                        value: "Some other data",
                    },
                },
            ],
        });

        // Call the getPromotions function
        const promotions = await getPromotions({ getAppMetafields });

        // Assert that the promotions metafield is undefined
        expect(promotions).toBeUndefined();

        // Assert that the getAppMetafields function is called with the correct arguments
        expect(getAppMetafields).toHaveBeenCalledWith(admin);
    });
});
