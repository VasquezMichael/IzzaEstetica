import { jwtVerify, SignJWT } from "jose"
import { NextRequest } from "next/server"

export const ADMIN_TOKEN_COOKIE = "admin_token"

export type AdminTokenPayload = {
  sub: string
  email: string
  role: "admin"
}

function getSecretKey() {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error("Missing AUTH_SECRET in environment variables.")
  }
  return new TextEncoder().encode(secret)
}

export async function signAdminToken(payload: AdminTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey())
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    if (payload.role !== "admin" || !payload.sub || !payload.email) {
      return null
    }

    return {
      sub: String(payload.sub),
      email: String(payload.email),
      role: "admin" as const
    }
  } catch {
    return null
  }
}

export async function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value
  if (!token) {
    return null
  }
  return verifyAdminToken(token)
}
