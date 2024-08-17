import CredentialsProvider from "next-auth/providers/credentials";
import md5 from "md5";

import { studentdb, db } from "@/db";
import z from "zod";
import { StudentUser } from "@/lib/types/db";
import { adminUserTable } from "@/db/schema";
import { eq } from "drizzle-orm";

const authSchema = z.object({
  username: z.string(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export const studentCreditialsProvider = CredentialsProvider({
  id: "credentials",
  credentials: {
    username: { label: "Userame", type: "text" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    let validatedCredentials: {
      username: string;
      password: string;
    };

    try {
      validatedCredentials = authSchema.parse(credentials);
    } catch (error) {
      console.log("Wrong credentials. Try again.");
      return null;
    }
    const { username, password } = validatedCredentials;

    const [result] = await studentdb.query(
      "SELECT `id`, `gid`, `username`, `password` FROM `FreshmanEnglish_user` WHERE `username` = ?",
      [username]
    );
    const existedUser = (result as StudentUser[])[0];

    // only allow sign in
    if (!existedUser) {
      console.log("User not found. Try again.");
      return null;
    }
    const isValid = md5(password) === existedUser.password;
    if (!isValid) {
      console.log("Wrong password. Try again.");
      return null;
    }

    return {
      id: existedUser.id.toString(),
      username: existedUser.username,
      classNumber: existedUser.gid,
    };
  },
});

export const adminCredentialsProvider = CredentialsProvider({
  id: "admin-credentials",
  credentials: {
    username: { label: "Userame", type: "text" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    let validatedCredentials: {
      username: string;
      password: string;
    };

    try {
      validatedCredentials = authSchema.parse(credentials);
    } catch (error) {
      console.log("Wrong credentials. Try again.");
      return null;
    }
    const { username, password } = validatedCredentials;

    const [existedUser] = await db
      .select({
        id: adminUserTable.id,
        username: adminUserTable.username,
        password: adminUserTable.password,
      })
      .from(adminUserTable)
      .where(eq(adminUserTable.username, username))
      .execute();

    // only allow sign in
    if (!existedUser) {
      console.log("Admin user not found. Try again.");
      return null;
    }
    const isValid = md5(password) === existedUser.password;
    if (!isValid) {
      console.log("Wrong admin password. Try again.");
      return null;
    }

    return {
      id: existedUser.id.toString(),
      username: existedUser.username,
      classNumber: 0,
    };
  },
});
