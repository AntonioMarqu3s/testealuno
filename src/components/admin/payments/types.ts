
export interface Payment {
  id: string;
  userEmail: string;
  planName: string;
  amount: number;
  paymentDate: string;
  expirationDate: string;
  status: string;
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded"
}

export interface PaymentFormData {
  email: string;
  planId: number;
  amount: number;
  paymentDate: Date;
  expirationDate?: Date;
  promoCode?: string;
  status: PaymentStatus;
}
