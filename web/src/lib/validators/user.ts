import z from "zod";

export const adminSchema = z.object({
  username: z.string(),
  password: z.string(),
});
