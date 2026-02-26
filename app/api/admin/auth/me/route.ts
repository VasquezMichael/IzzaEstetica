import { NextRequest, NextResponse } from "next/server"
import { getAdminFromRequest } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  const admin = await getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: admin.sub,
      email: admin.email,
      role: admin.role
    }
  })
}
