# PayU for NodeJS

![Build](https://github.com/tax1driver/payu/workflows/Build/badge.svg) ![](https://img.shields.io/npm/v/@tax1driver/payu) ![](https://img.shields.io/github/last-commit/tax1driver/payu)

A type safe PayU client for NodeJS written in Typescript. 

Originally authored by [kasvith](https://github.com/kasvith), updated by me to extend API coverage.

## Installation

```bash
npm install --save @tax1driver/payu
```

## Reference

[Full API & Types Reference](https://tax1driver.github.io/node-payu/)

## Basic Usage

### Importing
                                                               
```typescript
import { PayU, Order, Buyer, Product, Currency, ... } from "@tax1driver/payu";
```

### Initialization

- **clientId** : Client ID from PayU
- **clientSecret** : client secret from panel
- **merchantPosId** : pos id from panel
- **secondKey** : second key from panel

```typescript
const payU = new PayU(clientId, clientSecret, merchantPosId, secondKey, {
  sandbox: false,
});
```

### Create an order

```typescript
const result = await payU.createOrder({
  notifyUrl: "https://my.shop.notify.com/notify",
  customerIp: "127.0.0.1",
  continueUrl: "https://myshop.com/order?id=abc",
  description: "My order",
  currencyCode: Currency.PLN,
  totalAmount: 2000,
  buyer: {
    email: "buyer@email.com",
  },
  products: [
    { name: "mobile phone #1", quantity: 1, unitPrice: 1000 },
    { name: "mobile phone #2", quantity: 1, unitPrice: 1000 },
  ],
});
```

### Capture order

If your shop does not approve payments automatically, you need to capture them and confirm.

```typescript
const result = await payU.captureOrder("payU order Id");
```

Or using the legacy endpoint (status update method):

```typescript
const result = await payU.legacyCaptureOrder("payU order Id from notification");
```

### Cancel order

To cancel an order before completed call this method.

```typescript
const result = await payU.cancelOrder("payU order Id from notification");
```

### Refund order

To refund an order after completed call this method.

```typescript
const result = await payU.refundOrder("payU order Id from notification", "reason");
```

### Get access token

Retrieve the OAuth access token. This is usually handled internally, but you can get it explicitly if needed.

```typescript
const token = await payU.getAccessToken();
```

### Get order details

Retrieve detailed information about an existing order.

```typescript
const orderDetails = await payU.getOrder("payU order Id");
```

### Get specific refund

Retrieve details of a specific refund.

```typescript
const refund = await payU.getRefund("payU order Id", "refund Id");
```

### Get all refunds

Retrieve all refunds for a specific order.

```typescript
const refunds = await payU.getAllRefunds("payU order Id");
```

### Get transactions

Retrieve all transactions for a specific order.

```typescript
const transactions = await payU.getTransactions("payU order Id");
```

### Get payment methods

Retrieve all available payment methods. Optionally specify a language code.

```typescript
const paymentMethods = await payU.getPaymentMethods("pl"); // or "en"
```

### Get shop data

Retrieve shop data including balance information.

```typescript
const shopData = await payU.getShopData("shop Id");
```

### Create payout

Create a new payout request.

```typescript
const payout = await payU.createPayout({
  payout: {
    payoutId: "unique-payout-id",
    shopId: "shop Id",
    currencyCode: Currency.PLN,
    amount: 1000,
    description: "Payout description",
    bankAccount: {
      number: "PL61109010140000071219812874"
    }
  }
});
```

### Get payout

Retrieve details of a specific payout.

```typescript
const payoutDetails = await payU.getPayout("payout Id");
```

### Delete payment token

Delete a saved payment token.

```typescript
await payU.deleteToken("token value");
```

### Verify notification

To verify notification are valid cryptogrpically this method can be used.

```typescript
const headers = req.headers;

const isValid = payU.verifyNotification(
  headers["OpenPayu-Signature"],
  JSON.stringify(req.body)
);

console.log(isValid);
```

### Validate IPs

To validate IPs are correct, use following method. It will automatically adjust to match
your environment(production or sandbox)

```typescript
const isIpValid = payU.isIpValid("127.0.0.1");
```
