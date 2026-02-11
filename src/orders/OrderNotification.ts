import { Order } from "./Order";

export interface OrderNotification {
    order: Order & { status: string };
    localReceiptDateTime: string;
    properties: Array<{
        name: string;
        value: string;
    }>;
};