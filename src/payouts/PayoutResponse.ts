import { Status } from "../orders/Status";

export interface PayoutResponse {
    payoutId: string;
    extPayoutId?: string;
    shopId: string;
    amount: number;
    currencyCode: string;
    description?: string;
    status: string;
    creationDateTime: string;
    statusDateTime: string;
    payoutStatus?: Status;
}
