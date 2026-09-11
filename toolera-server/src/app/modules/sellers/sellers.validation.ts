import { z } from "zod";

const updateStatus = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "DELETED"]),
  }),
});

export const SellersValidation = {
  updateStatus,
};
