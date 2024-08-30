import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";
import { privateEnv } from "./lib/validators/env";

export async function middleware(request: NextRequest) {
  const session = await auth();

  // frontend admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.rewrite(new URL("/admin/login", request.url));
    } else if (session?.user.username !== privateEnv.ADMIN_USERNAME) {
      return NextResponse.rewrite(new URL("/student", request.url));
    }
  }
  // frontend student routes
  else if (
    request.nextUrl.pathname.startsWith("/student") &&
    (!session || !session.user)
  ) {
    return NextResponse.rewrite(new URL("/student/login", request.url));
  }
  // api routes
  else if (request.nextUrl.pathname.startsWith("/api")) {
    // student api routes
    if (request.nextUrl.pathname.startsWith("/api/student")) {
      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    // admin api routes
    // /api/auth should not be protected, or else we will have a redirect loop
    else if (!request.nextUrl.pathname.startsWith("/api/auth")) {
      if (!session || session?.user.username !== privateEnv.ADMIN_USERNAME) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
  }
  // other cases
  else if (!session || !session.user) {
    return NextResponse.rewrite(new URL("/student/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/api/:path*"],
};
