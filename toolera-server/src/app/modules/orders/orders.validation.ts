import { z } from "zod";

const updateStatus = z.object({
  body: z.object({
    status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  }),
});

const updatePaymentStatus = z.object({
  body: z.object({
    paymentStatus: z.enum(["PAID", "PARTIAL", "UNPAID", "REFUNDED"]),
  }),
});

export const OrdersValidation = {
  updateStatus,
  updatePaymentStatus,
};
