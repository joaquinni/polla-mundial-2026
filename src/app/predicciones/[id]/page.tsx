// src/app/predicciones/[id]/page.tsx
import { createClient }  from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import FormPrediccion from '@/components/predicciones/FormPrediccion'
import { format } from 'date-fns'
import { es }     from 'date-fns/locale'
import { estaBloqueo, minutosParaBloqueo } from '@/lib/puntos/calcularPuntos'

interface Props { params: { id: string } }

export default async function PrediccionDetallePage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: usuario } = await supabase
    .from('usuarios').select('nombre,rol,puntos_totales,pagado').eq('id', user.id).single()

  const { data: partido } = await supabase
    .from('partidos').select('*').eq('id', params.id).single()

  if (!partido) notFound()

  // Mi predicción
  const { data: pred } = await supabase
    .from('predicciones')
    .select('*')
    .eq('id_partido', params.id)
    .eq('id_usuario', user.id)
    .single()

  // Predicciones de otros (solo si está bloqueado)
  const bloqueado = estaBloqueo(partido.fecha_bloqueo)
  let otrasPredicciones: any[] = []
  if (bloqueado) {
    const { data } = await supabase
      .from('predicciones')
      .select('*, usuarios(nombre)')
      .eq('id_partido', params.id)
      .neq('id_usuario', user.id)
    otrasPredicciones = data ?? []
  }

  const finalizado = ['finalizado_90','finalizado_extra','finalizado_penales'].includes(partido.estado)
  const minutos = minutosParaBloqueo(partido.fecha_bloqueo)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar usuario={usuario} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">

        {/* Cabecera del partido */}
        <div className="card p-6 text-center">
          {partido.grupo && (
            <p className="font-cond text-xs tracking-[0.3em] text-brand-gold mb-2 uppercase">
              Grupo {partido.grupo}
            </p>
          )}
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-4xl mb-1">{partido.bandera_local}</p>
              <p className="font-cond font-bold text-sm tracking-wider">{partido.equipo_local}</p>
            </div>
            <div className="text-center">
              {finalizado ? (
                <p className="font-display text-4xl text-white">
                  {partido.goles_local_90} – {partido.goles_visita_90}
                </p>
              ) : (
                <p className="font-display text-3xl text-brand-muted">VS</p>
              )}
              {(partido.hubo_extra_tiempo || partido.hubo_penales) && (
                <p className="font-cond text-xs text-purple-400 mt-1">
                  {partido.hubo_penales ? 'Penales' : 'Prórroga'}
                </p>
              )}
            </div>
            <div className="text-center">
              <p className="text-4xl mb-1">{partido.bandera_visita}</p>
              <p className="font-cond font-bold text-sm tracking-wider">{partido.equipo_visita}</p>
            </div>
          </div>
          <p className="font-cond text-sm text-brand-muted mt-4">
            📅 {format(new Date(partido.fecha_hora_inicio), "EEEE d 'de' MMMM · HH:mm", { locale: es })}h
            {partido.sede && <span className="ml-2">📍 {partido.sede}</span>}
          </p>

          {/* Estado */}
          {!bloqueado && !finalizado && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-900/30 border border-green-700 rounded-full px-4 py-1.5 font-cond text-xs text-green-400 tracking-wider">
              ✅ Abierto · Cierra en {minutos < 60 ? `${minutos} min` : `${Math.round(minutos/60)}h`}
            </div>
          )}
          {bloqueado && !finalizado && (
            <div className="mt-4 inline-flex items-center gap-2 bg-yellow-900/30 border border-yellow-700 rounded-full px-4 py-1.5 font-cond text-xs text-yellow-400 tracking-wider">
              🔒 Bloqueado — no se aceptan más predicciones
            </div>
          )}
        </div>

        {/* Formulario de predicción */}
        <FormPrediccion
          partido={partido}
          prediccionActual={pred}
          userId={user.id}
          bloqueado={bloqueado || finalizado}
        />

        {/* Otras predicciones (post-bloqueo) */}
        {bloqueado && otrasPredicciones.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="font-display text-xl tracking-widest text-brand-gold">
                PREDICCIONES DEL GRUPO
              </h2>
            </div>
            <div className="divide-y divide-brand-dark4">
              {otrasPredicciones.map((op: any) => (
                <div key={op.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex-1">
                    <p className="font-cond text-sm tracking-wider text-white">{op.usuarios?.nombre}</p>
                  </div>
                  <p className="font-display text-xl text-brand-gold">
                    {op.goles_local_pred}–{op.goles_visita_pred}
                  </p>
                  {finalizado && op.tipo_acierto && (
                    <span className={`font-cond text-xs font-bold ${
                      op.tipo_acierto === 'exacto' ? 'text-brand-gold' :
                      op.tipo_acierto === 'error'  ? 'text-red-400' : 'text-blue-400'
                    }`}>
                      {op.tipo_acierto === 'exacto' ? '⭐' : op.tipo_acierto === 'error' ? '✗' : '✓'}
                      {' '}{op.puntos_obtenidos !== null ? `+${op.puntos_obtenidos} pts` : ''}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
