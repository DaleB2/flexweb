export type StepId = "destination" | "email" | "payment" | "provision" | "receipt";

export interface PlanOption {
  id: string;
  name: string;
  dataLabel: string;
  periodDays: number;
  priceCents: number;
  currency: string;
  description?: string;
  badge?: string;
}

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  featured?: boolean;
  plans: PlanOption[];
  spotlight?: string;
}

export interface DestinationSelection {
  country: CountryOption;
  plan: PlanOption;
}

export interface EmailState {
  email: string;
  existingUser: boolean;
  magicLinkRequested?: boolean;
  authenticated?: boolean;
}

export interface PaymentState {
  orderId: string;
  amountCents: number;
  currency: string;
  planName: string;
  countryName: string;
}

export interface EsimInfo {
  iccid: string;
  qrSvg: string;
  activationCode: string;
  status: "provisioning" | "active";
}

export interface JourneyState {
  selection?: DestinationSelection;
  email?: EmailState;
  payment?: PaymentState;
  esim?: EsimInfo;
}
