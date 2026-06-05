import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(2).max(120).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(100),
});
