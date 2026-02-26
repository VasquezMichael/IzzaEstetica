"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

type ProductRow = {
  _id: string
  name: string
  slug: string
  category: string
  price: number
  active: boolean
  updatedAt: string
}

export default function AdminProductsPage() {
  const [items, setItems] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadProducts() {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/admin/products?includeInactive=true", {
        cache: "no-store"
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "No se pudo cargar productos.")
        return
      }
      setItems(data.items || [])
    } catch {
      setError("Error de conexion.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("¿Eliminar este producto?")
    if (!confirmed) return

    const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
    if (!response.ok) {
      const data = await response.json().catch(() => null)
      alert(data?.error || "No se pudo eliminar.")
      return
    }
    await loadProducts()
  }

  useEffect(() => {
    loadProducts()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Productos</h1>
        <Link
          href="/admin/products/new"
          prefetch={false}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Nuevo producto
        </Link>
      </div>

      {loading ? <p>Cargando...</p> : null}
      {error ? <p className="text-destructive">{error}</p> : null}

      {!loading && !error ? (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Activo</th>
                <th className="px-4 py-3">Actualizado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-b last:border-0">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.slug}</td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3">${item.price}</td>
                  <td className="px-4 py-3">{item.active ? "Si" : "No"}</td>
                  <td className="px-4 py-3">{new Date(item.updatedAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${item._id}/edit`}
                        className="rounded-md border px-3 py-1.5 hover:bg-muted"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="rounded-md border border-destructive/40 px-3 py-1.5 text-destructive hover:bg-destructive/10"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
