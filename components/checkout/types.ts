export type StepId = "destination" | "plan" | "account" | "payment" | "done";

export interface CheckoutCountry {
  code: string;
  name: string;
  flagEmoji?: string;
}

export interface CheckoutPackagePrice {
  amount: number;
  currency: string;
}

export interface CheckoutPackage {
  id: string;
  planCode: string;
  name: string;
  dataLabel: string;
  days: number;
  unlimited: boolean;
  price: CheckoutPackagePrice;
}

export interface AccountState {
  email: string;
  existingAccount: boolean;
}

export interface PaymentState {
  paymentIntentId: string;
  clientSecret: string;
}
