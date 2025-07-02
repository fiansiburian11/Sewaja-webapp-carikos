import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/", "/login", "/register"];

// Fungsi decode dan verify JWT di Edge Runtime
async function verifyJWT(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  return await jwtVerify(token, secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  if (publicPaths.includes(pathname)) {
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      await verifyJWT(token); // ✅ validasi JWT di Edge
      return NextResponse.next();
    } catch (error) {
      console.warn("Token JWT tidak valid:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/"],
};
