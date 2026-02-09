import { Status } from "../orders/Status";

export interface ShopResponse {
    shopId: string;
    name: string;
    currencyCode: string;
    balance: {
        currencyCode: string;
        total: number;
        available: number;
    };
    status: Status;
}
