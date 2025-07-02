declare module "midtrans-client" {
  export interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  export interface ItemDetails {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }

  export interface CustomerDetails {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  }

  export interface CreditCardOptions {
    secure: boolean;
  }

  export interface CreateTransactionParams {
    transaction_details: TransactionDetails;
    customer_details?: CustomerDetails;
    item_details?: ItemDetails[];
    credit_card?: CreditCardOptions;
  }

  export interface CreateTransactionResponse {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(config: { isProduction: boolean; serverKey: string; clientKey?: string });

    createTransaction(params: CreateTransactionParams): Promise<CreateTransactionResponse>;
  }

  export class CoreApi {
    constructor(config: { isProduction: boolean; serverKey: string; clientKey?: string });

    charge(params: unknown): Promise<unknown>;
  }

  export class Transaction {
    constructor(config: { isProduction: boolean; serverKey: string });

    status(order_id: string): Promise<unknown>;
    approve(order_id: string): Promise<unknown>;
    cancel(order_id: string): Promise<unknown>;
    expire(order_id: string): Promise<unknown>;
  }
}
