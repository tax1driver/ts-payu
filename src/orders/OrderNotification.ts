import { Order } from "./Order";

export interface PayUNotification {
    order: Order;
    localReceiptDateTime: string;
    properties: Array<{
        name: string;
        value: string;
    }>;
};