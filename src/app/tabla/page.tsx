// src/app/tabla/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect }     from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import TablaPosiciones from '@/components/tabla/TablaPosiciones'

export default async function TablaPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: usuario } = await supabase
    .from('usuarios').select('nombre,rol,puntos_totales,pagado').eq('id', user.id).single()

  const { data: tabla } = await supabase.rpc('get_tabla_posiciones')
  const { data: config } = await supabase.from('configuracion').select('*').single()

  // Pozo total
  const participantes = tabla?.length ?? 0
  const pozo = (config?.monto_entrada ?? 25000) * participantes
  const pagados = tabla?.filter((f: any) => f.pagado).length ?? 0

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar usuario={usuario} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-6">

        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="section-title">📊 TABLA DE POSICIONES</h1>
          <div className="flex gap-4">
            <div className="card px-4 py-2 text-center">
              <p className="font-cond text-xs text-brand-muted tracking-wider">Participantes</p>
              <p className="font-display text-xl text-brand-gold">{participantes}</p>
            </div>
            <div className="card px-4 py-2 text-center">
              <p className="font-cond text-xs text-brand-muted tracking-wider">Pozo confirmado</p>
              <p className="font-display text-xl text-brand-gold">
                ${(pozo * pagados / Math.max(participantes,1) / 1000).toFixed(0)}k CLP
              </p>
            </div>
          </div>
        </div>

        {/* Premios */}
        {config && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { pos: '🥇 1°', pct: config.porcentaje_primero, monto: Math.round(pozo * config.porcentaje_primero / 100) },
              { pos: '🥈 2°', pct: config.porcentaje_segundo, monto: Math.round(pozo * config.porcentaje_segundo / 100) },
              { pos: '🥉 3°', pct: config.porcentaje_tercero, monto: Math.round(pozo * config.porcentaje_tercero / 100) },
            ].map(p => (
              <div key={p.pos} className="card p-3 text-center">
                <p className="font-cond text-xs text-brand-muted mb-1">{p.pos} lugar</p>
                <p className="font-display text-lg text-brand-gold">{p.pct}%</p>
                <p className="font-cond text-xs text-brand-muted">
                  ~${(p.monto/1000).toFixed(0)}k CLP
                </p>
              </div>
            ))}
          </div>
        )}

        <TablaPosiciones tablaInicial={tabla ?? []} userId={user.id} />

      </main>
    </div>
  )
}
