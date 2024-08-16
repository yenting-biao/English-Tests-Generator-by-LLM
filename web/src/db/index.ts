import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { privateEnv } from "@/lib/validators/env";
import * as schema from "./schema";

const connection = await mysql.createConnection({
  host: privateEnv.MYSQL_HOST,
  user: privateEnv.MYSQL_USER,
  password: privateEnv.MYSQL_PASSWORD,
  database: privateEnv.MYSQL_DB,
});

export const db = drizzle(connection, { schema, mode: "default" });

export const studentdb = await mysql.createConnection({
  host: privateEnv.MYSQL_HOST,
  user: privateEnv.MYSQL_USER,
  password: privateEnv.MYSQL_PASSWORD,
  database: privateEnv.MYSQL_STUDENT_DB,
});

// const client = new Client({
//   connectionString: privateEnv.POSTGRES_URL,
//   connectionTimeoutMillis: 5000,
// });

// await client.connect();
// export const db = drizzle(client, { schema });
