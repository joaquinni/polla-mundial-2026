// src/app/predicciones/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect }     from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import Link  from 'next/link'
import { format } from 'date-fns'
import { es }     from 'date-fns/locale'
import { FASES_LABEL } from '@/constants/grupos'
import { estaBloqueo } from '@/lib/puntos/calcularPuntos'

export default async function PrediccionesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: usuario } = await supabase
    .from('usuarios').select('nombre,rol,puntos_totales,pagado').eq('id', user.id).single()

  // Todos los partidos con mi predicción
  const { data: partidos } = await supabase
    .from('partidos')
    .select(`
      id, fase, grupo, equipo_local, equipo_visita, bandera_local, bandera_visita,
      fecha_hora_inicio, fecha_bloqueo, estado, goles_local_90, goles_visita_90,
      predicciones!left(
        id, goles_local_pred, goles_visita_pred, ganador_predicho,
        puntos_obtenidos, tipo_acierto, bloqueado
      )
    `)
    .order('fecha_hora_inicio', { ascending: true })

  // Agrupar por fase
  const porFase = (partidos ?? []).reduce((acc: Record<string, any[]>, p: any) => {
    if (!acc[p.fase]) acc[p.fase] = []
    acc[p.fase].push(p)
    return acc
  }, {})

  const ORDEN_FASES = ['grupos','ronda_32','octavos','cuartos','semifinal','tercer_puesto','final']

  function estadoBadge(p: any) {
    if (p.estado === 'pendiente' && !estaBloqueo(p.fecha_bloqueo)) {
      return <span className="badge badge-abierto">Abierto</span>
    }
    if (p.estado === 'bloqueado' || (p.estado === 'pendiente' && estaBloqueo(p.fecha_bloqueo))) {
      return <span className="badge badge-bloqueado">Bloqueado</span>
    }
    return <span className="badge badge-finalizado">Finalizado</span>
  }

  function aciertoBadge(tipo?: string) {
    if (!tipo || tipo === 'pendiente') return null
    const map: Record<string, string> = {
      exacto:      '⭐ Exacto',
      simple:      '✓ Acierto',
      clasificado: '✓ Clasificado',
      error:       '✗ Error',
    }
    const cls: Record<string, string> = {
      exacto: 'text-brand-gold', simple: 'text-blue-400',
      clasificado: 'text-purple-400', error: 'text-red-400',
    }
    return <span className={`font-cond text-xs font-bold ${cls[tipo]}`}>{map[tipo]}</span>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar usuario={usuario} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-8">

        <h1 className="section-title">⚽ MIS PREDICCIONES</h1>

        {ORDEN_FASES.filter(f => porFase[f]?.length).map(fase => (
          <div key={fase}>
            <h2 className="font-display text-xl tracking-widest text-white mb-3">
              {FASES_LABEL[fase] ?? fase}
            </h2>
            <div className="space-y-2">
              {porFase[fase].map((p: any) => {
                const pred = p.predicciones?.[0]
                const bloqueado = estaBloqueo(p.fecha_bloqueo) || p.estado !== 'pendiente'
                const finalizado = ['finalizado_90','finalizado_extra','finalizado_penales'].includes(p.estado)

                return (
                  <Link key={p.id} href={`/predicciones/${p.id}`}
                    className="card flex items-center gap-4 px-5 py-4 hover:border-brand-gold/30 transition-all group">

                    {/* Equipos */}
                    <div className="flex-1 min-w-0">
                      <p className="font-cond tracking-wider text-sm text-white">
                        {p.bandera_local} <span className="font-bold">{p.equipo_local}</span>
                        <span className="text-brand-muted mx-2">vs</span>
                        <span className="font-bold">{p.equipo_visita}</span> {p.bandera_visita}
                      </p>
                      <p className="font-cond text-xs text-brand-muted mt-0.5">
                        {format(new Date(p.fecha_hora_inicio), "EEEE d MMM · HH:mm", { locale: es })}h
                        {p.grupo && <span className="ml-2 text-brand-gold/70">Grupo {p.grupo}</span>}
                      </p>
                    </div>

                    {/* Mi predicción */}
                    <div className="text-center shrink-0 min-w-[80px]">
                      {pred ? (
                        <>
                          <p className="font-display text-xl text-brand-gold">
                            {pred.goles_local_pred}–{pred.goles_visita_pred}
                          </p>
                          {finalizado && aciertoBadge(pred.tipo_acierto)}
                          {finalizado && pred.puntos_obtenidos !== null && (
                            <p className="font-cond text-xs text-brand-muted">
                              +{pred.puntos_obtenidos} pts
                            </p>
                          )}
                        </>
                      ) : !bloqueado ? (
                        <span className="font-cond text-xs text-green-400 tracking-wider group-hover:underline">
                          Predecir →
                        </span>
                      ) : (
                        <span className="font-cond text-xs text-brand-muted">Sin predicción</span>
                      )}
                    </div>

                    {/* Resultado real */}
                    {finalizado && p.goles_local_90 !== null && (
                      <div className="text-center shrink-0 min-w-[60px]">
                        <p className="font-cond text-xs text-brand-muted mb-1">Resultado</p>
                        <p className="font-display text-xl text-white">
                          {p.goles_local_90}–{p.goles_visita_90}
                        </p>
                      </div>
                    )}

                    {/* Estado */}
                    <div className="shrink-0">
                      {estadoBadge(p)}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

      </main>
    </div>
  )
}
