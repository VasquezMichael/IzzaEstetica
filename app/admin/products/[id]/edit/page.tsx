"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form"

type ApiProduct = ProductFormValues & { _id: string }

export default function AdminEditProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const [item, setItem] = useState<ApiProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError("")

      try {
        const response = await fetch(`/api/admin/products/${id}`, {
          cache: "no-store"
        })
        const data = await response.json().catch(() => null)
        if (!response.ok) {
          setError(data?.error || "No se pudo cargar el producto.")
          return
        }
        if (!cancelled) {
          setItem(data.item)
        }
      } catch {
        if (!cancelled) {
          setError("Error de conexion.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleUpdate(values: ProductFormValues) {
    const response = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(data?.error || "No se pudo actualizar el producto.")
    }

    router.push("/admin/products")
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl">Editar producto</h1>

      {loading ? <p>Cargando...</p> : null}
      {error ? <p className="text-destructive">{error}</p> : null}

      {item ? (
        <div className="rounded-xl border bg-card p-4 sm:p-6">
          <ProductForm initialValues={item} submitLabel="Guardar cambios" onSubmit={handleUpdate} />
        </div>
      ) : null}
    </div>
  )
}
