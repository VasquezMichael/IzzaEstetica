"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ChevronLeft, Minus, Plus, ChevronDown, Leaf, Heart, Award, Recycle, Star, Check } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { type PublicProduct } from "@/lib/public-products"

type ProductDetail = PublicProduct

const benefits = [
  { icon: Leaf, label: "100% Natural" },
  { icon: Heart, label: "Cruelty-Free" },
  { icon: Recycle, label: "Ecoamigable" },
  { icon: Award, label: "Aprobado por expertos" }
]

type AccordionSection = "details" | "howToUse" | "ingredients" | "delivery"

export default function ProductPage() {
  const params = useParams()
  const productIdParam = params.id
  const productId = Array.isArray(productIdParam) ? productIdParam[0] : productIdParam

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [openAccordion, setOpenAccordion] = useState<AccordionSection | null>("details")
  const [isAdded, setIsAdded] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [productId])

  useEffect(() => {
    const slug = productId
    if (!slug) return
    const slugValue = slug

    let cancelled = false

    async function loadProduct() {
      setLoading(true)
      setNotFound(false)

      try {
        const response = await fetch(`/api/products/${encodeURIComponent(slugValue)}`, { cache: "no-store" })
        const data = await response.json()

        if (response.status === 404) {
          if (!cancelled) {
            setProduct(null)
            setNotFound(true)
          }
          return
        }

        if (!response.ok) {
          throw new Error(data.error || "No se pudo cargar el producto.")
        }

        if (!cancelled) {
          const item = data.item as ProductDetail
          setProduct(item)
          setSelectedSize(item.sizes?.[0] || "Unico")
        }
      } catch (error) {
        console.error("Product page load error:", error)
        if (!cancelled) {
          setProduct(null)
          setNotFound(true)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      cancelled = true
    }
  }, [productId])

  const toggleAccordion = (section: AccordionSection) => {
    setOpenAccordion(openAccordion === section ? null : section)
  }

  const handleAddToCart = () => {
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-28 pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-muted-foreground">Cargando producto...</div>
        </div>
        <Footer />
      </main>
    )
  }

  if (notFound || !product) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-28 pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <p className="text-foreground mb-4">Producto no encontrado o inactivo.</p>
            <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground boty-transition">
              <ChevronLeft className="w-4 h-4" />
              Volver a la tienda
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const sizes = product.sizes?.length ? product.sizes : ["Unico"]
  const accordionItems: { key: AccordionSection; title: string; content: string }[] = [
    { key: "details", title: "Detalles", content: product.details || "Sin detalles por ahora." },
    { key: "howToUse", title: "Como usar", content: product.howToUse || "Sin instrucciones por ahora." },
    { key: "ingredients", title: "Ingredientes", content: product.ingredients || "Sin ingredientes por ahora." },
    { key: "delivery", title: "Envio y devoluciones", content: product.delivery || "Sin informacion de envio por ahora." }
  ]

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground boty-transition mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver a la tienda
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Product Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-card boty-shadow">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" priority />
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Header */}
              <div className="mb-8">
                <span className="text-sm tracking-[0.3em] uppercase text-primary mb-2 block">Esenciales Izza</span>
                <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">{product.name}</h1>
                <p className="text-lg text-muted-foreground italic mb-4">{product.category}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">(128 resenas)</span>
                </div>

                <p className="text-foreground/80 leading-relaxed">{product.description}</p>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl font-medium text-foreground">${product.price}</span>
                {product.originalPrice ? <span className="text-xl text-muted-foreground line-through">${product.originalPrice}</span> : null}
              </div>

              {/* Size Selector */}
              <div className="mb-6">
                <label className="text-sm font-medium text-foreground mb-3 block">Tamano</label>
                <div className="flex gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded-full text-sm boty-transition boty-shadow ${
                        selectedSize === size ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-card/80"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="text-sm font-medium text-foreground mb-3 block">Cantidad</label>
                <div className="inline-flex items-center gap-4 bg-card rounded-full px-2 py-2 boty-shadow">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium text-foreground">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm tracking-wide boty-transition boty-shadow ${
                    isAdded ? "bg-primary/80 text-primary-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      Agregado al carrito
                    </>
                  ) : (
                    "Agregar al carrito"
                  )}
                </button>
                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-transparent border border-foreground/20 text-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-foreground/5"
                >
                  Comprar ahora
                </button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {benefits.map((benefit) => (
                  <div key={benefit.label} className="flex flex-col items-center gap-2 p-4 boty-shadow bg-transparent shadow-none rounded-md">
                    <benefit.icon className="w-5 h-5 text-primary" />
                    <span className="text-xs text-muted-foreground text-center">{benefit.label}</span>
                  </div>
                ))}
              </div>

              {/* Accordion */}
              <div className="border-t border-border/50">
                {accordionItems.map((item) => (
                  <div key={item.key} className="border-b border-border/50">
                    <button type="button" onClick={() => toggleAccordion(item.key)} className="w-full flex items-center justify-between py-5 text-left">
                      <span className="font-medium text-foreground">{item.title}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground boty-transition ${openAccordion === item.key ? "rotate-180" : ""}`}
                      />
                    </button>
                    <div className={`overflow-hidden boty-transition ${openAccordion === item.key ? "max-h-96 pb-5" : "max-h-0"}`}>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
