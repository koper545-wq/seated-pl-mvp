import { api } from "./client";

interface MockPaymentResponse {
  success: boolean;
  transaction: {
    id: string;
    type: string;
    amount: number;
    status: string;
  };
  booking: {
    id: string;
    status: string;
    totalPrice: number;
  };
}

export async function mockPayment(bookingId: string): Promise<MockPaymentResponse> {
  return api.post<MockPaymentResponse>("/payments/mock", { bookingId });
}
