import { Status } from "./Status";

export interface RefundResponse {
    orderId: string;
    refund: {
        refundId: string;
        extRefundId?: string;
        amount: number;
        currencyCode: string;
        description?: string;
        creationDateTime: string;
        status: string;
        statusDateTime: string;
    };
    status: Status;
}

export interface RefundListResponse {
    refunds: Array<{
        refundId: string;
        extRefundId?: string;
        amount: number;
        currencyCode: string;
        description?: string;
        creationDateTime: string;
        status: string;
        statusDateTime: string;
    }>;
    status: Status;
}
