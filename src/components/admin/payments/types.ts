
export interface Payment {
  id: string;
  userEmail: string;
  planName: string;
  amount: number;
  paymentDate: string;
  expirationDate: string;
  status: string;
}
