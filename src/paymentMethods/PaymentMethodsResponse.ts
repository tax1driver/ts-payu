import { Status } from "../orders/Status";

export interface PaymentMethod {
    value: string;
    name: string;
    brandImageUrl?: string;
    status: string;
    minAmount?: number;
    maxAmount?: number;
}

export interface PaymentMethodsResponse {
    payByLinks?: PaymentMethod[];
    cardTokens?: Array<{
        value: string;
        status: string;
        mask: string;
        brandImageUrl: string;
        cardExpirationYear: number;
        cardExpirationMonth: number;
        cardNumberFiltered: string;
        cardScheme: string;
    }>;
    blikTokens?: Array<{
        value: string;
        status: string;
        type: string;
        brandImageUrl: string;
    }>;
    status: Status;
}
