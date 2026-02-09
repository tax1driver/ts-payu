import { Status } from "./Status";
import { Buyer } from "./Buyer";
import { Product } from "./Product";
import { Currency } from "../enums/Currency";

export interface PayMethod {
    type: string;
    value?: string;
    authorizationCode?: string;
    card?: {
        number?: string;
        expirationMonth?: string;
        expirationYear?: string;
    };
}

export interface OrderProperty {
    name: string;
    value: string;
}

export interface OrderStatusResponse {
    orders?: Array<{
        orderId: string;
        extOrderId?: string;
        orderCreateDate: string;
        notifyUrl?: string;
        customerIp: string;
        merchantPosId: string;
        description: string;
        currencyCode: Currency;
        totalAmount: number;
        buyer?: Buyer;
        products?: Product[];
        status: string;
        payMethod?: PayMethod;
        properties?: OrderProperty[];
        validityTime?: number;
        continueUrl?: string;
    }>;
    status: Status;
    properties?: OrderProperty[];
}
