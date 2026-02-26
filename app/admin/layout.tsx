import Link from "next/link"
import { LogoutButton } from "@/components/admin/logout-button"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function AdminLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/products" className="font-serif text-2xl">
              Izza Admin
            </Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/admin/products" className="text-foreground/80 hover:text-foreground">
                Productos
              </Link>
              <Link
                href="/admin/products/new"
                prefetch={false}
                className="text-foreground/80 hover:text-foreground"
              >
                Nuevo
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </section>
    </main>
  )
}
