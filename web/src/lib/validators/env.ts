import { z } from "zod";

const privateEnvSchema = z.object({
  OPENAI_API_KEY: z.string(),
});

type PrivateEnv = z.infer<typeof privateEnvSchema>;

export const privateEnv: PrivateEnv = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
};

privateEnvSchema.parse(privateEnv);
