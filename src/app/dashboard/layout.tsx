// src/app/dashboard/layout.tsx  (shared layout for all app routes)
// NOTE: In Next.js App Router, create this at src/app/layout-app.tsx
// and reference in each section, OR use a nested layout group.
// For simplicity, place Navbar in each page or create a shared wrapper.

// Shared Navbar component used by all (app) pages
import { createClient } from '@/lib/supabase/server'
import { redirect }     from 'next/navigation'
import Navbar from '@/components/shared/Navbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('nombre, rol, puntos_totales, pagado')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar usuario={usuario} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-brand-dark4 py-6 text-center">
        <p className="font-cond text-xs tracking-widest text-brand-muted uppercase">
          🏆 Polla Mundial 2026 &nbsp;·&nbsp; FIFA World Cup &nbsp;·&nbsp; 11 Jun – 19 Jul
        </p>
      </footer>
    </div>
  )
}
