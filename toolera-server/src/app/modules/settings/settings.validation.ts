import { z } from "zod";

const upsert = z.object({
  body: z.object({
    key: z.string().min(1, "Key is required"),
    value: z.any(),
    description: z.string().optional(),
  }),
});

export const SettingsValidation = {
  upsert,
};
