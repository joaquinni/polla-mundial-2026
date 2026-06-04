// src/app/admin/partidos/[id]/page.tsx
import { createClient }  from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import FormResultado from '@/components/admin/FormResultado'
import { format } from 'date-fns'
import { es }     from 'date-fns/locale'

interface Props { params: { id: string } }

export default async function AdminPartidoPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: usuario } = await supabase
    .from('usuarios').select('nombre,rol,puntos_totales,pagado').eq('id', user.id).single()
  if (usuario?.rol !== 'admin') redirect('/dashboard')

  const { data: partido } = await supabase
    .from('partidos').select('*').eq('id', params.id).single()
  if (!partido) notFound()

  // Predicciones del partido
  const { data: predicciones } = await supabase
    .from('predicciones')
    .select('*, usuarios(nombre)')
    .eq('id_partido', params.id)
    .order('fecha_prediccion', { ascending: true })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar usuario={usuario} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-6">

        <div>
          <p className="font-cond text-xs text-brand-muted tracking-widest uppercase mb-1">
            Admin → Partidos
          </p>
          <h1 className="section-title">
            {partido.bandera_local} {partido.equipo_local} vs {partido.equipo_visita} {partido.bandera_visita}
          </h1>
          <p className="font-cond text-sm text-brand-muted mt-1">
            {format(new Date(partido.fecha_hora_inicio), "EEEE d 'de' MMMM · HH:mm", { locale: es })}h
            {partido.sede && ` · ${partido.sede}`}
            {partido.grupo && ` · Grupo ${partido.grupo}`}
          </p>
        </div>

        {/* Form resultado */}
        <FormResultado partido={partido} />

        {/* Tabla de predicciones */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-display text-xl tracking-widest text-brand-gold">
              PREDICCIONES ({predicciones?.length ?? 0})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-brand-dark3">
                  <th className="px-4 py-3 text-left font-cond text-xs tracking-widest text-brand-muted uppercase">Jugador</th>
                  <th className="px-4 py-3 text-center font-cond text-xs tracking-widest text-brand-muted uppercase">Pred.</th>
                  <th className="px-4 py-3 text-center font-cond text-xs tracking-widest text-brand-muted uppercase">Clasifica</th>
                  <th className="px-4 py-3 text-center font-cond text-xs tracking-widest text-brand-muted uppercase">Pts</th>
                  <th className="px-4 py-3 text-center font-cond text-xs tracking-widest text-brand-muted uppercase">Acierto</th>
                  <th className="px-4 py-3 text-right font-cond text-xs tracking-widest text-brand-muted uppercase hidden md:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark4">
                {predicciones?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-brand-dark3 transition-colors">
                    <td className="px-4 py-3 font-cond text-sm text-white">{p.usuarios?.nombre}</td>
                    <td className="px-4 py-3 text-center font-display text-xl text-brand-gold">
                      {p.goles_local_pred}–{p.goles_visita_pred}
                    </td>
                    <td className="px-4 py-3 text-center font-cond text-xs text-brand-muted">
                      {p.ganador_predicho ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.puntos_obtenidos !== null ? (
                        <span className="font-display text-xl text-brand-gold">+{p.puntos_obtenidos}</span>
                      ) : (
                        <span className="font-cond text-xs text-brand-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.tipo_acierto && (
                        <span className={`font-cond text-xs font-bold ${
                          p.tipo_acierto === 'exacto'      ? 'text-brand-gold' :
                          p.tipo_acierto === 'error'       ? 'text-red-400'   :
                          p.tipo_acierto === 'pendiente'   ? 'text-brand-muted' :
                          'text-blue-400'
                        }`}>
                          {p.tipo_acierto}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-cond text-xs text-brand-muted hidden md:table-cell">
                      {format(new Date(p.fecha_prediccion), 'dd/MM HH:mm')}
                    </td>
                  </tr>
                ))}
                {!predicciones?.length && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center font-cond text-brand-muted">
                    Sin predicciones aún
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  )
}
