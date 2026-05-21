import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  // Auth is handled client-side via AuthProvider redirect
  // Middleware is kept minimal — no server-side session check needed
  // since the API validates the token on every request
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
