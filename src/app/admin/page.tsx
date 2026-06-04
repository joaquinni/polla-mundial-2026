// src/app/admin/page.tsx
import { createClient }  from '@/lib/supabase/server'
import { redirect }      from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import Link   from 'next/link'
import { Users, Calendar, Trophy, BarChart3, Download, RefreshCw } from 'lucide-react'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: usuario } = await supabase
    .from('usuarios').select('nombre,rol,puntos_totales,pagado').eq('id', user.id).single()

  if (usuario?.rol !== 'admin') redirect('/dashboard')

  // Stats globales
  const [{ count: totalUsers }, { count: totalPartidos }, { count: pendientesPago }] = await Promise.all([
    supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('rol','participante'),
    supabase.from('partidos').select('*', { count: 'exact', head: true }),
    supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('pagado', false).eq('rol','participante'),
  ])

  const { data: proximoSinResultado } = await supabase
    .from('partidos')
    .select('id, equipo_local, equipo_visita, fecha_hora_inicio')
    .in('estado', ['bloqueado', 'en_juego'])
    .is('goles_local_90', null)
    .order('fecha_hora_inicio', { ascending: true })
    .limit(3)

  const adminCards = [
    { href: '/admin/partidos',  icon: Calendar,   label: 'Partidos',  desc: `${totalPartidos ?? 0} registrados`, color: 'text-blue-400' },
    { href: '/admin/usuarios',  icon: Users,       label: 'Usuarios',  desc: `${totalUsers ?? 0} participantes · ${pendientesPago ?? 0} sin pago`, color: 'text-green-400' },
    { href: '/admin/exportar',  icon: Download,    label: 'Exportar',  desc: 'Google Sheets sync', color: 'text-purple-400' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar usuario={usuario} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-8">

        <div>
          <h1 className="section-title">🔧 PANEL ADMINISTRADOR</h1>
          <p className="font-cond text-brand-muted mt-1 tracking-wider">
            Gestión completa de la Polla Mundial 2026
          </p>
        </div>

        {/* Accesos rápidos */}
        <div className="grid sm:grid-cols-3 gap-4">
          {adminCards.map(c => (
            <Link key={c.href} href={c.href}
              className="card p-6 hover:border-brand-gold/30 transition-all group">
              <c.icon size={24} className={`${c.color} mb-3 group-hover:scale-110 transition-transform`} />
              <h2 className="font-display text-xl tracking-widest text-white">{c.label}</h2>
              <p className="font-cond text-xs text-brand-muted mt-1 tracking-wider">{c.desc}</p>
            </Link>
          ))}
        </div>

        {/* Partidos pendientes de resultado */}
        {proximoSinResultado && proximoSinResultado.length > 0 && (
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="font-display text-xl tracking-widest text-brand-gold">
                ⏳ PENDIENTES DE RESULTADO
              </h2>
              <Link href="/admin/partidos"
                className="font-cond text-xs text-brand-muted hover:text-brand-gold tracking-wider">
                Ver todos →
              </Link>
            </div>
            <div className="divide-y divide-brand-dark4">
              {proximoSinResultado.map((p: any) => (
                <Link key={p.id} href={`/admin/partidos/${p.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-brand-dark3 transition-colors">
                  <div className="flex-1">
                    <p className="font-cond font-bold text-sm text-white tracking-wider">
                      {p.equipo_local} vs {p.equipo_visita}
                    </p>
                  </div>
                  <span className="btn-primary text-xs py-1.5 px-3">Ingresar resultado</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="card p-6 space-y-4">
          <h2 className="font-display text-xl tracking-widest text-white">ACCIONES RÁPIDAS</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/partidos/nuevo" className="btn-primary flex items-center gap-2">
              <Calendar size={14} /> Crear partido
            </Link>
            <Link href="/admin/exportar" className="btn-ghost flex items-center gap-2">
              <Download size={14} /> Exportar Sheets
            </Link>
          </div>
        </div>

      </main>
    </div>
  )
}
