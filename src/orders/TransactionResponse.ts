import { Status } from "./Status";

export interface TransactionResponse {
    transactions: Array<{
        transactionId: string;
        payMethod: {
            type: string;
            value?: string;
        };
        amount: number;
        currencyCode: string;
        status: string;
        creationDateTime: string;
        statusDateTime: string;
    }>;
    status: Status;
}
