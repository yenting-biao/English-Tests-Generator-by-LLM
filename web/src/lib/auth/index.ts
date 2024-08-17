import NextAuth from "next-auth";
import {
  studentCreditialsProvider,
  adminCredentialsProvider,
} from "./CredentialsProvider";

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  providers: [studentCreditialsProvider, adminCredentialsProvider],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.classNumber = user.classNumber;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.username = token.username as string;
      session.user.classNumber = token.classNumber as number;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});
