// import type { DefaultSession } from "next-auth";

import type { User as MyUser } from "@/lib/types/user";

// We can add to the default session object by extending the
// built-in Session type from next-auth. This will allow us to
// use the properties we added to the user object in the
// database when accessing the session object in our app.

declare module "next-auth" {
  interface Session {
    user: MyUser;
  }

  interface User {
    id: string;
    username: string;
    classNumber: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    classNumber: number;
  }
}
