interface Metafield {
    namespace: string;
    key: string;
    value: string;
    ownerId?: string;
    type: string;
}
interface DiscountValues {
    title: string;
    method: string;
    code: string;
    combinesWith: any;
    usageLimit: string | null;
    appliesOncePerCustomer: boolean;
    startsAt: string;
    endsAt: string;
    configuration: any;
    id: any;
    type: any;
}

interface Promotion {
    id: string;
    title: string;
    type: "frequentlyBoughtTogether";
    configuration: object;
    styling: object;
    priority: number;
}

interface Field {
    value: any;
    onChange: Function;
    defaultValue: any;
    dirty: boolean;
    touched: boolean;
}
