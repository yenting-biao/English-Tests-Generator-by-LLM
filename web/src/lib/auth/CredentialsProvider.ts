import CredentialsProvider from "next-auth/providers/credentials";
import md5 from "md5";

import { studentdb } from "@/db";
import z from "zod";
import { StudentUser } from "@/lib/types/db";

const authSchema = z.object({
  username: z.string(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export default CredentialsProvider({
  name: "credentials",
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
