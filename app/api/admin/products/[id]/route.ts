import { NextRequest, NextResponse } from "next/server"
import { Types } from "mongoose"
import { z } from "zod"
import { connectToDatabase } from "@/lib/mongodb"
import { getAdminFromRequest } from "@/lib/admin-auth"
import { Product } from "@/models/Product"

const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  originalPrice: z.number().min(0).nullable().optional(),
  image: z.string().min(1).optional(),
  badge: z.string().nullable().optional(),
  category: z.string().min(1).optional(),
  sizes: z.array(z.string()).optional(),
  details: z.string().optional(),
  howToUse: z.string().optional(),
  ingredients: z.string().optional(),
  delivery: z.string().optional(),
  active: z.boolean().optional()
})

function validateId(id: string) {
  return Types.ObjectId.isValid(id)
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const { id } = await context.params
  if (!validateId(id)) {
    return NextResponse.json({ error: "ID invalido." }, { status: 400 })
  }

  await connectToDatabase()
  const item = await Product.findById(id).lean()

  if (!item) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 })
  }

  return NextResponse.json({ ok: true, item })
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const { id } = await context.params
  if (!validateId(id)) {
    return NextResponse.json({ error: "ID invalido." }, { status: 400 })
  }

  try {
    const body = await request.json()
    const parsed = productUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos del producto invalidos." }, { status: 400 })
    }

    await connectToDatabase()

    const updates: Record<string, unknown> = {
      ...parsed.data,
      updatedBy: admin.email
    }

    if (typeof updates.slug === "string") {
      updates.slug = updates.slug.toLowerCase().trim()
    }
    if (typeof updates.category === "string") {
      updates.category = updates.category.toLowerCase().trim()
    }

    const item = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).lean()

    if (!item) {
      return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 })
    }

    return NextResponse.json({ ok: true, item })
  } catch (error) {
    console.error("PATCH /api/admin/products/[id] error:", error)
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const { id } = await context.params
  if (!validateId(id)) {
    return NextResponse.json({ error: "ID invalido." }, { status: 400 })
  }

  await connectToDatabase()
  const deleted = await Product.findByIdAndDelete(id).lean()
  if (!deleted) {
    return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
