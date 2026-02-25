"use client"

import { useRouter } from "next/navigation"
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form"

export default function AdminNewProductPage() {
  const router = useRouter()

  async function handleCreate(values: ProductFormValues) {
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    })
    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(data?.error || "No se pudo crear el producto.")
    }

    router.push("/admin/products")
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl">Nuevo producto</h1>
      <div className="rounded-xl border bg-card p-4 sm:p-6">
        <ProductForm submitLabel="Crear producto" onSubmit={handleCreate} />
      </div>
    </div>
  )
}
