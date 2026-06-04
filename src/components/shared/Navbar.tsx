'use client'
// src/components/shared/Navbar.tsx
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Menu, X, Trophy, LogOut } from 'lucide-react'

interface Props {
  usuario?: { nombre: string; rol: string; puntos_totales: number; pagado: boolean } | null
}

const NAV_LINKS = [
  { href: '/dashboard',      label: 'Dashboard',   emoji: '🏠' },
  { href: '/predicciones',   label: 'Mis Picks',   emoji: '⚽' },
  { href: '/tabla',          label: 'Tabla',        emoji: '📊' },
  { href: '/bonus',          label: 'Bonus',        emoji: '🎯' },
  { href: '/historial',      label: 'Historial',    emoji: '📋' },
  { href: '/reglamento',     label: 'Reglas',       emoji: '📖' },
]

export default function Navbar({ usuario }: Props) {
  const pathname  = usePathname()
  const router    = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header className="sticky top-0 z-50 bg-brand-dark2/95 backdrop-blur border-b border-brand-dark4">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <Trophy size={20} className="text-brand-gold group-hover:scale-110 transition-transform" />
          <span className="font-display text-xl tracking-widest text-brand-gold hidden sm:block">
            MUNDIAL 2026
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href}
              className={`font-cond text-xs tracking-widest uppercase px-3 py-1.5 rounded-md transition-all ${
                isActive(link.href)
                  ? 'text-brand-dark bg-brand-gold'
                  : 'text-brand-muted hover:text-brand-gold'
              }`}>
              {link.label}
            </Link>
          ))}
          {usuario?.rol === 'admin' && (
            <Link href="/admin"
              className={`font-cond text-xs tracking-widest uppercase px-3 py-1.5 rounded-md transition-all ml-1 ${
                isActive('/admin')
                  ? 'text-white bg-brand-red'
                  : 'text-brand-red hover:bg-brand-red/10'
              }`}>
              Admin
            </Link>
          )}
        </nav>

        {/* Usuario + logout desktop */}
        <div className="hidden md:flex items-center gap-3">
          {usuario && (
            <div className="text-right">
              <p className="font-cond text-xs tracking-wider text-white">{usuario.nombre}</p>
              <p className="font-cond text-xs text-brand-gold">
                {usuario.puntos_totales} pts
                {!usuario.pagado && <span className="text-yellow-400 ml-1">(sin pago)</span>}
              </p>
            </div>
          )}
          <button onClick={handleLogout}
            className="p-2 rounded-md text-brand-muted hover:text-brand-red hover:bg-brand-dark3 transition-colors"
            title="Cerrar sesión">
            <LogOut size={16} />
          </button>
        </div>

        {/* Hamburger mobile */}
        <button className="md:hidden p-2 text-brand-muted" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-brand-dark2 border-t border-brand-dark4 px-4 py-4 space-y-1">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 font-cond text-sm tracking-widest uppercase px-3 py-2.5 rounded-md transition-all ${
                isActive(link.href)
                  ? 'text-brand-dark bg-brand-gold'
                  : 'text-brand-muted hover:text-brand-gold'
              }`}>
              <span>{link.emoji}</span>{link.label}
            </Link>
          ))}
          {usuario?.rol === 'admin' && (
            <Link href="/admin" onClick={() => setOpen(false)}
              className="flex items-center gap-3 font-cond text-sm tracking-widest uppercase px-3 py-2.5 rounded-md text-brand-red hover:bg-brand-red/10 transition-colors">
              🔧 Admin
            </Link>
          )}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 font-cond text-sm tracking-widest uppercase px-3 py-2.5 rounded-md text-brand-muted hover:text-brand-red transition-colors mt-2">
            <LogOut size={14} />Cerrar sesión
          </button>
        </div>
      )}
    </header>
  )
}
