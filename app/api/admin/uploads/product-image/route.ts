import { randomUUID } from "crypto"
import { promises as fs } from "fs"
import path from "path"
import { NextRequest, NextResponse } from "next/server"
import { getAdminFromRequest } from "@/lib/admin-auth"

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif"
])

function extensionFromFile(file: File) {
  const fromName = path.extname(file.name || "").toLowerCase()
  if (fromName) return fromName

  switch (file.type) {
    case "image/jpeg":
      return ".jpg"
    case "image/png":
      return ".png"
    case "image/webp":
      return ".webp"
    case "image/gif":
      return ".gif"
    case "image/avif":
      return ".avif"
    default:
      return ""
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminFromRequest(request)
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo requerido." }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Formato de imagen no permitido." }, { status: 400 })
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "La imagen debe pesar entre 1 byte y 5MB." },
        { status: 400 }
      )
    }

    const ext = extensionFromFile(file)
    if (!ext) {
      return NextResponse.json({ error: "No se pudo determinar la extension del archivo." }, { status: 400 })
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "products")
    await fs.mkdir(uploadsDir, { recursive: true })

    const filename = `${randomUUID()}${ext}`
    const absolutePath = path.join(uploadsDir, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(absolutePath, buffer)

    const url = `/uploads/products/${filename}`
    return NextResponse.json({ ok: true, url })
  } catch (error) {
    console.error("POST /api/admin/uploads/product-image error:", error)
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 })
  }
}
