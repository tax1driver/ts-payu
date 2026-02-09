import crypto from "crypto";
import Axios, { AxiosError, AxiosInstance } from "axios";
import { OAuth } from "./auth/OAuth";
import { OrderCreateResponse } from "./orders/OrderCreateResponse";
import { Order } from "./orders/Order";
import { OrderEndpoint, PaymentMethodsEndpoint, ShopEndpoint, PayoutEndpoint, TokenEndpoint } from "./endpoints";
import { PayUError } from "./errors/PayUError";
import { OrderStatusResponse } from "./orders/OrderStatusResponse";
import { RefundResponse, RefundListResponse } from "./orders/RefundResponse";
import { TransactionResponse } from "./orders/TransactionResponse";
import { PaymentMethodsResponse } from "./paymentMethods/PaymentMethodsResponse";
import { ShopResponse } from "./shop/ShopResponse";
import { PayoutRequest } from "./payouts/PayoutRequest";
import { PayoutResponse } from "./payouts/PayoutResponse";
import { SandboxIPs, ProductionIPs } from "./ips";
import axios from "axios";

const SANDBOX_ENDPOINT = "https://secure.snd.payu.com";
const PRODUCTION_ENDPOINT = "https://secure.payu.com";

export interface PayUOptions {
  sandbox?: boolean;
}

export class PayU {
  private baseEndpoint: string;
  private client: AxiosInstance;
  private oAuth: OAuth;
  private ips: string[];

  /**
   * Creates an instance of PayU.
   * @param {number} clientId - client id for merchant
   * @param {string} clientSecret - client secret from panel
   * @param {number} merchantPosId - pos id from panel
   * @param {string} secondKey - second key from panel
   * @param {PayUOptions} [options={ sandbox: false }] - additional options
   * @memberof PayU
   */
  constructor(
    private readonly clientId: number,
    private readonly clientSecret: string,
    private readonly merchantPosId: number,
    private readonly secondKey: string,
    private readonly options: PayUOptions = { sandbox: false }
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.merchantPosId = merchantPosId;
    this.secondKey = secondKey;
    this.options = options;

    this.baseEndpoint = !this.options.sandbox
      ? PRODUCTION_ENDPOINT
      : SANDBOX_ENDPOINT;
    this.ips = !this.options.sandbox ? ProductionIPs : SandboxIPs;
    this.client = Axios.create({ baseURL: this.baseEndpoint });

    this.oAuth = new OAuth(this.client, this.clientId, this.clientSecret);
  }

  /**
   * Get access token
   *
   * @returns {Promise<string>}
   * @throws {AuthenticationError}
   * @memberof PayU
   */
  public async getAccessToken(): Promise<string> {
    return this.oAuth.getAccessToken();
  }

  /**
   * Create a new order
   *
   * @param {Order} order - order to be created
   * @returns {Promise<OrderCreateResponse>}
   * @throws {PayUError}
   * @memberof PayU
   */
  public async createOrder(order: Order): Promise<OrderCreateResponse> {
    const token = await this.oAuth.getAccessToken();
    const data = {
      ...order,
      merchantPosId: this.merchantPosId,
    };
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await this.client.post(OrderEndpoint, data, {
        headers: headers,
        maxRedirects: 0,
        validateStatus: (status) => {
          return status === 302;
        },
      });

      return <OrderCreateResponse>response.data;
    } catch (error) {
      const errors = error as Error | AxiosError;

      if (axios.isAxiosError(errors)) {
        const resp = <OrderStatusResponse>errors?.response?.data;
        throw new PayUError(
          resp.status.statusCode,
          resp.status.code || "",
          resp.status.codeLiteral,
          resp.status.statusDesc
        );
      }

      throw error;
    }
  }

  /**
   * Captures an order from payU making it approved
   *
   * @param {string} orderId
   * @returns {Promise<OrderStatusResponse>}
   * @throws {PayUError}
   * @memberof PayU
   */
  public async legacyCaptureOrder(orderId: string): Promise<OrderStatusResponse> {
    const token = await this.oAuth.getAccessToken();
    const data = {
      orderId: orderId,
      orderStatus: "COMPLETED",
    };
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await this.client.put(
        `${OrderEndpoint}/${orderId}/status`,
        data,
        {
          headers: headers,
        }
      );

      return <OrderStatusResponse>response.data;
    } catch (error) {
      const errors = error as Error | AxiosError;

      if (axios.isAxiosError(errors)) {
        const resp = <OrderStatusResponse>errors?.response?.data;
        throw new PayUError(
          resp.status.statusCode,
          resp.status.code || "",
          resp.status.codeLiteral,
          resp.status.statusDesc
        );
      }

      throw error;
    }
  }

  /**
   * Cancels a PayU order
   *
   * @param {string} orderId
   * @returns {Promise<OrderStatusResponse>}
   * @memberof PayU
   */
  public async cancelOrder(orderId: string): Promise<OrderStatusResponse> {
    const token = await this.oAuth.getAccessToken();
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await this.client.delete(`${OrderEndpoint}/${orderId}`, {
        headers: headers,
      });

      return <OrderStatusResponse>response.data;
    } catch (error) {
      const errors = error as Error | AxiosError;
      if (axios.isAxiosError(errors)) {
        const resp = <OrderStatusResponse>errors?.response?.data;
        throw new PayUError(
          resp.status.statusCode,
          resp.status.code || "",
          resp.status.codeLiteral,
          resp.status.statusDesc
        );
      }

      throw error;
    }
  }

  /**
   * Refunds a PayU order
   *
   * @param {string} orderId - payu order id
   * @param {string} description - description for refund
   * @returns {Promise<RefundResponse>}
   * @memberof PayU
   */
  public async refundOrder(
    orderId: string,
    description: string
  ): Promise<RefundResponse> {
    const token = await this.oAuth.getAccessToken();
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await this.client.post(
        `${OrderEndpoint}/${orderId}/refunds`,
        {
          refund: {
            description,
          },
        },
        {
          headers: headers,
        }
      );

      return <RefundResponse>response.data;
    } catch (error) {
      const errors = error as Error | AxiosError;

      if (axios.isAxiosError(errors)) {
        const resp = <RefundResponse>errors?.response?.data;
        throw new PayUError(
          resp.status.statusCode,
          resp.status.code || "",
          resp.status.codeLiteral,
          resp.status.statusDesc
        );
      }

      throw errors;
    }
  }

  /**
   * Get order details
   *
   * @param {string} orderId - PayU order id
   * @returns {Promise<OrderStatusResponse>}
   * @throws {PayUError}
   * @memberof PayU
   */
  public async getOrder(orderId: string): Promise<OrderStatusResponse> {
    const token = await this.oAuth.getAccessToken();
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await this.client.get(`${OrderEndpoint}/${orderId}`, {
        headers: headers,
      });

      return <OrderStatusResponse>response.data;
    } catch (error) {
      const errors = error as Error | AxiosError;

      if (axios.isAxiosError(errors)) {
        const resp = <OrderStatusResponse>errors?.response?.data;
        throw new PayUError(
          resp.status.statusCode,
          resp.status.code || "",
          resp.status.codeLiteral,
          resp.status.statusDesc
        );
      }

      throw error;
    }
  }

  /**
   * Get specific refund details
   *
   * @param {string} orderId - PayU order id
   * @param {string} refundId - Refund id
   * @returns {Promise<RefundResponse>}
   * @throws {PayUError}
   * @memberof PayU
   */
  public async getRefund(
    orderId: string,
    refundId: string
  ): Promise<RefundResponse> {
    const token = await this.oAuth.getAccessToken();
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await this.client.get(
        `${OrderEndpoint}/${orderId}/refunds/${refundId}`,
        {
          headers: headers,
        }
      );

      return <RefundResponse>response.data;
    } catch (error) {
      const errors = error as Error | AxiosError;

      if (axios.isAxiosError(errors)) {
        throw new PayUError(
          String(errors?.response?.status || 500),
          "",
          "",
          errors?.response?.statusText || "Unknown error"
        );
      }

      throw error;
    }
  }

  /**
   * Get all refunds for an order
   *
   * @param {string} orderId - PayU order id
   * @returns {Promise<RefundListResponse>}
   * @throws {PayUError}
   * @memberof PayU
   */
  public async getAllRefunds(orderId: string): Promise<RefundListResponse> {
    const token = await this.oAuth.getAccessToken();
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await this.client.get(
        `${OrderEndpoint}/${orderId}/refunds`,
        {
          headers: headers,
        }
      );

      return <RefundListResponse>response.data;
    } catch (error) {
      const errors = error as Error | AxiosError;

      if (axios.isAxiosError(errors)) {
        throw new PayUError(
          String(errors?.response?.status || 500),
          "",
          "",
          errors?.response?.statusText || "Unknown error"
        );
      }

      throw error;
    }
  }

  /**
   * Get transactions for an order
   *
   * @param {string} orderId - PayU order id
   * @returns {Promise<TransactionResponse>}
   * @throws {PayUError}
   * @memberof PayU
   */
  public async getTransactions(orderId: string): Promise<TransactionResponse> {
    const token = await this.oAuth.getAccessToken();
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await this.client.get(
        `${OrderEndpoint}/${orderId}/transactions`,
        {
          headers: headers,
        }
      );

      return <TransactionResponse>response.data;
    } catch (error) {
      const errors = error as Error | AxiosError;

      if (axios.isAxiosError(errors)) {
        throw new PayUError(
          String(errors?.response?.status || 500),
          "",
          "",
          errors?.response?.statusText || "Unknown error"
        );
      }

      throw error;
    }
  }

  /**
   * Retrieve all available payment methods
   *
   * @param {string} [lang] - Language code (e.g., 'pl', 'en')
   * @returns {Promise<PaymentMethodsResponse>}
   * @throws {PayUError}
   * @memberof PayU
   */
  public async getPaymentMethods(
    lang?: string
  ): Promise<PaymentMethodsResponse> {
    const token = await this.oAuth.getAccessToken();
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await this.client.get(PaymentMethodsEndpoint, {
        headers: headers,
        params: lang ? { lang } : undefined,
      });

      return <PaymentMethodsResponse>response.data;
    } catch (error) {
      const errors = error as Error | AxiosError;

      if (axios.isAxiosError(errors)) {
        throw new PayUError(
          String(errors?.response?.status || 500),
          "",
          "",
          errors?.response?.statusText || "Unknown error"
        );
      }

      throw error;
    }
  }

  /**
   * Retrieve shop data including balance
   *
   * @param {string} shopId - Shop identifier
   * @returns {Promise<ShopResponse>}
   * @throws {PayUError}
   * @memberof PayU
   */
  public async getShopData(shopId: string): Promise<ShopResponse> {
    const token = await this.oAuth.getAccessToken();
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await this.client.get(`${ShopEndpoint}/${shopId}`, {
        headers: headers,
      });

      return <ShopResponse>response.data;
    } catch (error) {
      const errors = error as Error | AxiosError;

      if (axios.isAxiosError(errors)) {
        throw new PayUError(
          String(errors?.response?.status || 500),
          "",
          "",
          errors?.response?.statusText || "Unknown error"
        );
      }

      throw error;
    }
  }

  /**
   * Create a payout
   *
   * @param {PayoutRequest} payout - Payout request data
   * @returns {Promise<PayoutResponse>}
   * @throws {PayUError}
   * @memberof PayU
   */
  public async createPayout(payout: PayoutRequest): Promise<PayoutResponse> {
    const token = await this.oAuth.getAccessToken();
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await this.client.post(PayoutEndpoint, payout, {
        headers: headers,
      });

      return <PayoutResponse>response.data;
    } catch (error) {
      const errors = error as Error | AxiosError;

      if (axios.isAxiosError(errors)) {
        throw new PayUError(
          String(errors?.response?.status || 500),
          "",
          "",
          errors?.response?.statusText || "Unknown error"
        );
      }

      throw error;
    }
  }

  /**
   * Retrieve payout details
   *
   * @param {string} payoutId - Payout identifier
   * @returns {Promise<PayoutResponse>}
   * @throws {PayUError}
   * @memberof PayU
   */
  public async getPayout(payoutId: string): Promise<PayoutResponse> {
    const token = await this.oAuth.getAccessToken();
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await this.client.get(
        `${PayoutEndpoint}/${payoutId}`,
        {
          headers: headers,
        }
      );

      return <PayoutResponse>response.data;
    } catch (error) {
      const errors = error as Error | AxiosError;

      if (axios.isAxiosError(errors)) {
        throw new PayUError(
          String(errors?.response?.status || 500),
          "",
          "",
          errors?.response?.statusText || "Unknown error"
        );
      }

      throw error;
    }
  }

  /**
   * Delete a saved payment token
   *
   * @param {string} token - Token value to delete
   * @returns {Promise<void>}
   * @throws {PayUError}
   * @memberof PayU
   */
  public async deleteToken(token: string): Promise<void> {
    const authToken = await this.oAuth.getAccessToken();
    const headers = {
      Authorization: `Bearer ${authToken}`,
    };

    try {
      await this.client.delete(`${TokenEndpoint}/${token}`, {
        headers: headers,
      });
    } catch (error) {
      const errors = error as Error | AxiosError;

      if (axios.isAxiosError(errors)) {
        throw new PayUError(
          String(errors?.response?.status || 500),
          "",
          "",
          errors?.response?.statusText || "Unknown error"
        );
      }

      throw error;
    }
  }

  /**
   * Capture an authorized order (new endpoint)
   *
   * @param {string} orderId - Order identifier
   * @returns {Promise<OrderStatusResponse>}
   * @throws {PayUError}
   * @memberof PayU
   */
  public async captureOrder(orderId: string): Promise<OrderStatusResponse> {
    const token = await this.oAuth.getAccessToken();
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await this.client.post(
        `${OrderEndpoint}/${orderId}/captures`,
        {},
        {
          headers: headers,
        }
      );

      return <OrderStatusResponse>response.data;
    } catch (error) {
      const errors = error as Error | AxiosError;

      if (axios.isAxiosError(errors)) {
        const resp = <OrderStatusResponse>errors?.response?.data;
        throw new PayUError(
          resp.status.statusCode,
          resp.status.code || "",
          resp.status.codeLiteral,
          resp.status.statusDesc
        );
      }

      throw error;
    }
  }

  /**
   * Convert a key=value; list to json
   *
   * @private
   * @param {string} data - key value string
   * @returns {Record<string, string>}
   * @memberof PayU
   */
  private parseHeaderToJson(data: string): Record<string, string> {
    return data.split(";").reduce((acc, curr) => {
      if (curr) {
        const [key, val] = curr.split("=");
        acc[key] = val;
      }
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Verify notification result with signature
   *
   * @param {string} payuHeader - header string from **OpenPayu-Signature**
   * @param {string} jsonNotification - notification body as a string
   * @returns {boolean}
   * @memberof PayU
   */
  public verifyNotification(
    payuHeader: string,
    jsonNotification: string
  ): boolean {
    const tokens = this.parseHeaderToJson(payuHeader);
    if (
      !tokens["signature"] ||
      tokens["signature"] === "" ||
      !tokens["algorithm"] ||
      tokens["algorithm"] === ""
    ) {
      return false;
    }

    const concatnated = jsonNotification + this.secondKey;
    const exceptedSignature = crypto
      .createHash("md5")
      .update(concatnated)
      .digest("hex");
    const incomingSignature = tokens["signature"];

    return exceptedSignature === incomingSignature;
  }

  /**
   * Validates the IP address with PayU servers
   *
   * @param {string} ip - ip address
   * @returns {boolean}
   * @memberof PayU
   */
  public isIpValid(ip: string): boolean {
    return this.ips.includes(ip);
  }
}
