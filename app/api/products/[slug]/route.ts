import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Product } from "@/models/Product"

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    await connectToDatabase()

    const item = await Product.findOne({
      slug: slug.toLowerCase().trim(),
      active: true
    }).lean()

    if (!item) {
      return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 })
    }

    return NextResponse.json({ ok: true, item })
  } catch (error) {
    console.error("GET /api/products/[slug] error:", error)
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 })
  }
}
