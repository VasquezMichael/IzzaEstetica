"use client"

import { FormEvent, useMemo, useState } from "react"

export type ProductFormValues = {
  name: string
  slug: string
  description: string
  price: number
  originalPrice: number | null
  image: string
  badge: string | null
  category: string
  sizes: string[]
  details: string
  howToUse: string
  ingredients: string
  delivery: string
  active: boolean
}

const defaultValues: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  originalPrice: null,
  image: "",
  badge: null,
  category: "",
  sizes: [],
  details: "",
  howToUse: "",
  ingredients: "",
  delivery: "",
  active: true
}

const INPUT_CLASS =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"

type ProductFormProps = {
  initialValues?: ProductFormValues
  submitLabel: string
  onSubmit: (values: ProductFormValues) => Promise<void>
}

export function ProductForm({ initialValues, submitLabel, onSubmit }: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(initialValues ?? defaultValues)
  const [sizesInput, setSizesInput] = useState((initialValues?.sizes || []).join(", "))
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState("")

  const canSubmit = useMemo(() => {
    return !!values.name && !!values.slug && !!values.description && !!values.image && !!values.category
  }, [values])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) {
      setError("Completa los campos obligatorios.")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      await onSubmit({
        ...values,
        sizes: sizesInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo guardar."
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleImageFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/uploads/product-image", {
        method: "POST",
        body: formData
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo subir la imagen.")
      }

      setValues((prev) => ({ ...prev, image: data.url }))
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo subir la imagen."
      setError(message)
    } finally {
      setUploadingImage(false)
      event.target.value = ""
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Nombre *">
          <input
            value={values.name}
            onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Slug *">
          <input
            value={values.slug}
            onChange={(e) => setValues((prev) => ({ ...prev, slug: e.target.value }))}
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <Field label="Descripcion corta *">
        <textarea
          value={values.description}
          onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
          className={`${INPUT_CLASS} min-h-20`}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Precio *">
          <input
            type="number"
            min={0}
            step="0.01"
            value={values.price}
            onChange={(e) => setValues((prev) => ({ ...prev, price: Number(e.target.value || 0) }))}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Precio original">
          <input
            type="number"
            min={0}
            step="0.01"
            value={values.originalPrice ?? ""}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                originalPrice: e.target.value === "" ? null : Number(e.target.value)
              }))
            }
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Badge">
          <input
            value={values.badge ?? ""}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                badge: e.target.value.trim() ? e.target.value : null
              }))
            }
            placeholder="Nuevo / Oferta / Mas vendido"
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Categoria *">
          <input
            value={values.category}
            onChange={(e) => setValues((prev) => ({ ...prev, category: e.target.value }))}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Tamanos (coma separados)">
          <input
            value={sizesInput}
            onChange={(e) => setSizesInput(e.target.value)}
            placeholder="30ml, 50ml"
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <Field label="Imagen *">
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            disabled={uploadingImage}
            className={INPUT_CLASS}
          />
          <input
            value={values.image}
            onChange={(e) => setValues((prev) => ({ ...prev, image: e.target.value }))}
            placeholder="URL o ruta guardada (ej: /uploads/products/archivo.jpg)"
            className={INPUT_CLASS}
          />
          {uploadingImage ? <p className="text-xs text-muted-foreground">Subiendo imagen...</p> : null}
          {values.image ? (
            <p className="text-xs text-muted-foreground">Imagen actual: {values.image}</p>
          ) : null}
        </div>
      </Field>

      <Field label="Detalles">
        <textarea
          value={values.details}
          onChange={(e) => setValues((prev) => ({ ...prev, details: e.target.value }))}
          className={`${INPUT_CLASS} min-h-24`}
        />
      </Field>
      <Field label="Como usar">
        <textarea
          value={values.howToUse}
          onChange={(e) => setValues((prev) => ({ ...prev, howToUse: e.target.value }))}
          className={`${INPUT_CLASS} min-h-24`}
        />
      </Field>
      <Field label="Ingredientes">
        <textarea
          value={values.ingredients}
          onChange={(e) => setValues((prev) => ({ ...prev, ingredients: e.target.value }))}
          className={`${INPUT_CLASS} min-h-24`}
        />
      </Field>
      <Field label="Envio y devoluciones">
        <textarea
          value={values.delivery}
          onChange={(e) => setValues((prev) => ({ ...prev, delivery: e.target.value }))}
          className={`${INPUT_CLASS} min-h-24`}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.active}
          onChange={(e) => setValues((prev) => ({ ...prev, active: e.target.checked }))}
        />
        Producto activo
      </label>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
      >
        {submitting ? "Guardando..." : submitLabel}
      </button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}
