export interface PayoutRequest {
    shopId: string;
    payout: {
        extPayoutId: string;
        amount: number;
        currencyCode: string;
        description?: string;
    };
    account?: {
        accountNumber: string;
        swift?: string;
    };
    customerAddress?: {
        name: string;
        street?: string;
        postalCode?: string;
        city?: string;
        countryCode?: string;
    };
}
