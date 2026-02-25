import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectToDatabase } from "@/lib/mongodb"
import { getAdminFromRequest } from "@/lib/admin-auth"
import { Product } from "@/models/Product"

const productInputSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  originalPrice: z.number().min(0).nullable().optional(),
  image: z.string().min(1),
  badge: z.string().nullable().optional(),
  category: z.string().min(1),
  sizes: z.array(z.string()).optional().default([]),
  details: z.string().optional().default(""),
  howToUse: z.string().optional().default(""),
  ingredients: z.string().optional().default(""),
  delivery: z.string().optional().default(""),
  active: z.boolean().optional().default(true)
})

function parsePagination(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const page = Number(searchParams.get("page") || "1")
  const limit = Number(searchParams.get("limit") || "20")
  const q = searchParams.get("q") || ""
  const includeInactive = searchParams.get("includeInactive") === "true"

  return {
    page: Number.isNaN(page) || page < 1 ? 1 : page,
    limit: Number.isNaN(limit) || limit < 1 ? 20 : Math.min(limit, 100),
    q,
    includeInactive
  }
}

export async function GET(request: NextRequest) {
  const admin = await getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  await connectToDatabase()

  const { page, limit, q, includeInactive } = parsePagination(request)
  const filter: Record<string, unknown> = {}

  if (!includeInactive) {
    filter.active = true
  }

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { slug: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } }
    ]
  }

  const [total, items] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
  ])

  return NextResponse.json({
    ok: true,
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
}

export async function POST(request: NextRequest) {
  const admin = await getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = productInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos del producto invalidos." }, { status: 400 })
    }

    await connectToDatabase()

    const normalized = {
      ...parsed.data,
      slug: parsed.data.slug.toLowerCase().trim(),
      category: parsed.data.category.toLowerCase().trim(),
      badge: parsed.data.badge || null,
      originalPrice: parsed.data.originalPrice ?? null,
      createdBy: admin.email,
      updatedBy: admin.email
    }

    const existing = await Product.findOne({ slug: normalized.slug }).lean()
    if (existing) {
      return NextResponse.json({ error: "Ya existe un producto con ese slug." }, { status: 409 })
    }

    const created = await Product.create(normalized)
    return NextResponse.json({ ok: true, item: created }, { status: 201 })
  } catch (error) {
    console.error("POST /api/admin/products error:", error)
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 })
  }
}
