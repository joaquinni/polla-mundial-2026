// src/app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect }     from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { FASES_LABEL, ESTADO_LABEL } from '@/constants/grupos'
import Link from 'next/link'
import { Trophy, Target, TrendingUp, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Datos del usuario
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single()

  // Próximos partidos con predicción del usuario
  const { data: partidos } = await supabase
    .from('partidos')
    .select(`
      *,
      predicciones!left(id, goles_local_pred, goles_visita_pred, puntos_obtenidos, tipo_acierto)
    `)
    .in('estado', ['pendiente', 'bloqueado'])
    .order('fecha_hora_inicio', { ascending: true })
    .limit(5)

  // Top 3 general
  const { data: top3 } = await supabase
    .rpc('get_tabla_posiciones')
    .limit(3)

  // Posición del usuario
  const { data: tablaCompleta } = await supabase.rpc('get_tabla_posiciones')
  const miPosicion = tablaCompleta?.find((f: any) => f.id === user.id)?.posicion ?? '—'

  const stats = [
    { icon: Trophy,     label: 'Puntos totales', value: usuario?.puntos_totales ?? 0, gold: true },
    { icon: Target,     label: 'Exactos',         value: usuario?.exactos_acertados ?? 0 },
    { icon: TrendingUp, label: 'Posición',         value: `#${miPosicion}` },
    { icon: Clock,      label: 'Partidos jugados', value: usuario?.partidos_jugados ?? 0 },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar usuario={usuario} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-8">

        {/* Bienvenida */}
        <div>
          <h1 className="font-display text-4xl tracking-widest text-brand-gold">
            HOLA, {(usuario?.nombre ?? '').split(' ')[0].toUpperCase()} 👋
          </h1>
          <p className="font-cond text-brand-muted mt-1 tracking-wider">
            🏆 FIFA World Cup 2026 &nbsp;·&nbsp; 11 Jun – 19 Jul
          </p>
          {!usuario?.pagado && (
            <div className="mt-3 inline-flex items-center gap-2 bg-yellow-900/30 border border-yellow-700 rounded-lg px-4 py-2 text-yellow-400 font-cond text-sm tracking-wider">
              ⚠️ Pago pendiente — coordina con el administrador
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, label, value, gold }) => (
            <div key={label} className="card p-5 text-center">
              <Icon size={20} className={`mx-auto mb-2 ${gold ? 'text-brand-gold' : 'text-brand-muted'}`} />
              <p className={`font-display text-3xl tracking-widest ${gold ? 'text-brand-gold' : 'text-white'}`}>
                {value}
              </p>
              <p className="font-cond text-xs tracking-widest text-brand-muted uppercase mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Próximos partidos */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="font-display text-xl tracking-widest text-brand-gold">PRÓXIMOS PARTIDOS</h2>
              <Link href="/predicciones" className="font-cond text-xs text-brand-muted hover:text-brand-gold tracking-wider">
                Ver todos →
              </Link>
            </div>
            <div className="divide-y divide-brand-dark4">
              {partidos?.length === 0 && (
                <p className="px-5 py-4 font-cond text-sm text-brand-muted">No hay partidos próximos</p>
              )}
              {partidos?.map((p: any) => {
                const pred = p.predicciones?.[0]
                const bloqueado = p.estado === 'bloqueado'
                return (
                  <Link key={p.id} href={`/predicciones/${p.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-brand-dark3 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="font-cond text-sm tracking-wider text-white truncate">
                        {p.bandera_local} {p.equipo_local} <span className="text-brand-muted">vs</span> {p.equipo_visita} {p.bandera_visita}
                      </p>
                      <p className="font-cond text-xs text-brand-muted mt-0.5">
                        {format(new Date(p.fecha_hora_inicio), "dd MMM · HH:mm", { locale: es })}h
                        {p.grupo && <span className="ml-2 text-brand-gold">Grupo {p.grupo}</span>}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {pred ? (
                        <span className="font-display text-sm text-brand-gold">
                          {pred.goles_local_pred}–{pred.goles_visita_pred}
                        </span>
                      ) : !bloqueado ? (
                        <span className="font-cond text-xs text-green-400 tracking-wider">Predecir →</span>
                      ) : (
                        <span className="font-cond text-xs text-yellow-500 tracking-wider">Sin pick</span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Top 3 */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="font-display text-xl tracking-widest text-brand-gold">TOP 3 GENERAL</h2>
              <Link href="/tabla" className="font-cond text-xs text-brand-muted hover:text-brand-gold tracking-wider">
                Ver tabla →
              </Link>
            </div>
            <div className="p-5 space-y-3">
              {top3?.length === 0 && (
                <p className="font-cond text-sm text-brand-muted">El torneo aún no ha comenzado</p>
              )}
              {top3?.map((f: any) => {
                const medals = ['🥇','🥈','🥉']
                const isMe = f.id === user.id
                return (
                  <div key={f.id}
                    className={`flex items-center gap-4 p-3 rounded-lg ${isMe ? 'bg-brand-gold/10 border border-brand-gold/30' : 'bg-brand-dark3'}`}>
                    <span className="text-2xl">{medals[f.posicion - 1]}</span>
                    <div className="flex-1">
                      <p className={`font-cond font-bold tracking-wider text-sm ${isMe ? 'text-brand-gold' : 'text-white'}`}>
                        {f.nombre} {isMe && '(tú)'}
                      </p>
                      <p className="font-cond text-xs text-brand-muted">
                        {f.exactos_acertados} exactos · {f.aciertos_simples} simples
                      </p>
                    </div>
                    <span className="font-display text-2xl text-brand-gold">{f.puntos_totales}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </main>

      <footer className="border-t border-brand-dark4 py-6 text-center">
        <p className="font-cond text-xs tracking-widest text-brand-muted uppercase">
          🏆 Polla Mundial 2026 &nbsp;·&nbsp; Todos los derechos reservados
        </p>
      </footer>
    </div>
  )
}
