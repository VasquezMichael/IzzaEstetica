import { NextRequest, NextResponse } from "next/server"
import { ADMIN_TOKEN_COOKIE, verifyAdminToken } from "@/lib/admin-auth"

function isPublicAdminPath(pathname: string) {
  return pathname === "/admin/login" || pathname === "/api/admin/auth/login"
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next()
  }

  if (isPublicAdminPath(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value
  const admin = token ? await verifyAdminToken(token) : null

  if (admin) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const loginUrl = new URL("/admin/login", request.url)
  loginUrl.searchParams.set("next", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
}
