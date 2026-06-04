import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function HistorialPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: usuario } = await supabase
    .from('usuarios').select('nombre,rol,puntos_totales,pagado').eq('id', user.id).single()

  const { data: predicciones } = await supabase
    .from('predicciones')
    .select(`id, goles_local_pred, goles_visita_pred, puntos_obtenidos, tipo_acierto, fecha_prediccion,
      partidos(id, fase, grupo, equipo_local, equipo_visita, bandera_local, bandera_visita, fecha_hora_inicio, goles_local_90, goles_visita_90, estado)`)
    .eq('id_usuario', user.id)
    .order('fecha_prediccion', { ascending: false })

  const totalPuntos = predicciones?.reduce((acc, p) => acc + (p.puntos_obtenidos ?? 0), 0) ?? 0
  const exactos = predicciones?.filter(p => p.tipo_acierto === 'exacto').length ?? 0
  const simples = predicciones?.filter(p => p.tipo_acierto === 'simple' || p.tipo_acierto === 'clasificado').length ?? 0
  const errores = predicciones?.filter(p => p.tipo_acierto === 'error').length ?? 0

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar usuario={usuario} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        <h1 className="section-title">📋 MI HISTORIAL</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Puntos totales', value: totalPuntos, gold: true },
            { label: '⭐ Exactos', value: exactos },
            { label: '✓ Aciertos', value: simples },
            { label: '✗ Errores', value: errores },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className={`font-display text-3xl ${s.gold ? 'text-brand-gold' : 'text-white'}`}>{s.value}</p>
              <p className="font-cond text-xs text-brand-muted tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="font-display text-xl tracking-widest text-brand-gold">
              TODAS MIS PREDICCIONES ({predicciones?.length ?? 0})
            </h2>
          </div>
          {predicciones?.length === 0 && (
            <p className="px-5 py-8 text-center font-cond text-brand-muted">Aún no tienes predicciones registradas</p>
          )}
          <div className="divide-y divide-brand-dark4">
            {predicciones?.map((pred: any) => {
              const p = pred.partidos
              if (!p) return null
              const finalizado = ['finalizado_90','finalizado_extra','finalizado_penales'].includes(p.estado)
              return (
                <div key={pred.id} className="flex items-center gap-4 px-5 py-4 hover:bg-brand-dark3 transition-colors flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-cond font-bold text-sm text-white tracking-wider">
                      {p.bandera_local} {p.equipo_local} <span className="text-brand-muted mx-2">vs</span> {p.equipo_visita} {p.bandera_visita}
                    </p>
                    <p className="font-cond text-xs text-brand-muted mt-0.5">
                      {format(new Date(p.fecha_hora_inicio), "d MMM · HH:mm", { locale: es })}h
                      {p.grupo && <span className="text-brand-gold ml-2">Grupo {p.grupo}</span>}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-cond text-xs text-brand-muted mb-1">Mi pick</p>
                    <p className="font-display text-xl text-brand-gold">{pred.goles_local_pred} – {pred.goles_visita_pred}</p>
                  </div>
                  {finalizado && p.goles_local_90 !== null && (
                    <div className="text-center">
                      <p className="font-cond text-xs text-brand-muted mb-1">Resultado</p>
                      <p className="font-display text-xl text-white">{p.goles_local_90} – {p.goles_visita_90}</p>
                    </div>
                  )}
                  <div className="text-center min-w-[70px]">
                    {pred.tipo_acierto && pred.tipo_acierto !== 'pendiente' && (
                      <span className={`font-cond text-xs font-bold ${pred.tipo_acierto === 'exacto' ? 'text-brand-gold' : pred.tipo_acierto === 'error' ? 'text-red-400' : 'text-blue-400'}`}>
                        {pred.tipo_acierto === 'exacto' ? '⭐ Exacto' : pred.tipo_acierto === 'error' ? '✗ Error' : '✓ Acierto'}
                      </span>
                    )}
                    {pred.puntos_obtenidos !== null && (
                      <p className="font-display text-2xl text-brand-gold mt-1">+{pred.puntos_obtenidos}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}