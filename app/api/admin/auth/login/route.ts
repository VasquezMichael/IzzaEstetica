import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models/User"
import { ADMIN_TOKEN_COOKIE, signAdminToken } from "@/lib/admin-auth"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Datos de acceso invalidos." }, { status: 400 })
    }

    const { email, password } = parsed.data

    await connectToDatabase()
    const user = await User.findOne({
      email: email.toLowerCase(),
      active: true,
      role: "admin"
    }).lean<{
      _id: string
      email: string
      role: "admin"
      passwordHash: string
    } | null>()

    if (!user) {
      return NextResponse.json({ error: "Credenciales invalidas." }, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Credenciales invalidas." }, { status: 401 })
    }

    const token = await signAdminToken({
      sub: String(user._id),
      email: user.email,
      role: "admin"
    })

    const response = NextResponse.json({
      ok: true,
      user: { id: String(user._id), email: user.email, role: user.role }
    })

    response.cookies.set({
      name: ADMIN_TOKEN_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    })

    return response
  } catch (error) {
    console.error("POST /api/admin/auth/login error:", error)
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 })
  }
}
