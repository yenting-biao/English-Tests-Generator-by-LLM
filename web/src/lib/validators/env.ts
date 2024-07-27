import { z } from "zod";

const privateEnvSchema = z.object({
  OPENAI_API_KEY: z.string(),
  POSTGRES_URL: z.string(),
});

type PrivateEnv = z.infer<typeof privateEnvSchema>;

export const privateEnv: PrivateEnv = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  POSTGRES_URL: process.env.POSTGRES_URL!,
};

privateEnvSchema.parse(privateEnv);
