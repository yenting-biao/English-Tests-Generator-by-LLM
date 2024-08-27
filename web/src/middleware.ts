import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";
import { privateEnv } from "./lib/validators/env";

export async function middleware(request: NextRequest) {
  const session = await auth();

  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    (!session || session?.user.username !== privateEnv.ADMIN_USERNAME)
  ) {
    return NextResponse.rewrite(new URL("/admin/login", request.url));
  } else if (
    request.nextUrl.pathname.startsWith("/student") &&
    (!session || !session.user)
  ) {
    return NextResponse.rewrite(new URL("/student/login", request.url));
  } else if (!session || !session.user) {
    return NextResponse.rewrite(new URL("/student/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"],
};
