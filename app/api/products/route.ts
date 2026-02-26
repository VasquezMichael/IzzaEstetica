import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Product } from "@/models/Product"

export async function GET() {
  try {
    await connectToDatabase()

    const items = await Product.find({ active: true })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ ok: true, items })
  } catch (error) {
    console.error("GET /api/products error:", error)
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 })
  }
}
