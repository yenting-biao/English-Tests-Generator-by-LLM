import { z } from "zod";

const privateEnvSchema = z.object({
  OPENAI_API_KEY: z.string(),
  POSTGRES_URL: z.string(),
  MYSQL_HOST: z.string(),
  MYSQL_USER: z.string(),
  MYSQL_PASSWORD: z.string(),
  MYSQL_DB: z.string(),
});

type PrivateEnv = z.infer<typeof privateEnvSchema>;

export const privateEnv: PrivateEnv = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  POSTGRES_URL: process.env.POSTGRES_URL!,
  MYSQL_HOST: process.env.MYSQL_HOST!,
  MYSQL_USER: process.env.MYSQL_USER!,
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD!,
  MYSQL_DB: process.env.MYSQL_DB!,
};

privateEnvSchema.parse(privateEnv);
