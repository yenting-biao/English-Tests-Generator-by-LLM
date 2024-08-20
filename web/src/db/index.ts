import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { privateEnv } from "@/lib/validators/env";
import * as schema from "./schema";

// https://github.com/drizzle-team/drizzle-orm/issues/1988
declare global {
  // eslint-disable-next-line no-var
  var _db: ReturnType<typeof drizzle> | undefined;
  // eslint-disable-next-line no-var
  var _studentdb: mysql.Pool | undefined;
}

const connection = mysql.createPool({
  host: privateEnv.MYSQL_HOST,
  user: privateEnv.MYSQL_USER,
  password: privateEnv.MYSQL_PASSWORD,
  database: privateEnv.MYSQL_DB,
  connectionLimit: 10,
});
const db = globalThis._db || drizzle(connection, { schema, mode: "default" });

const studentdbConnection = mysql.createPool({
  host: privateEnv.MYSQL_HOST,
  user: privateEnv.MYSQL_USER,
  password: privateEnv.MYSQL_PASSWORD,
  database: privateEnv.MYSQL_STUDENT_DB,
});
const studentdb = globalThis._studentdb || studentdbConnection;

if (process.env.NODE_ENV !== "production") {
  globalThis._db = db;
  globalThis._studentdb = studentdb;
}

export { db, studentdb };
