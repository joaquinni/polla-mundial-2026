// src/app/bonus/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect }     from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import FormBonus from '@/components/bonus/FormBonus'

export default async function BonusPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: usuario } = await supabase
    .from('usuarios').select('nombre,rol,puntos_totales,pagado').eq('id', user.id).single()

  const { data: bonus } = await supabase
    .from('bonus_premundial').select('*').eq('id_usuario', user.id).single()

  const { data: config } = await supabase
    .from('configuracion').select('mundial_iniciado, pts_bonus_campeon, pts_bonus_subcampeon, pts_bonus_goleador').single()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar usuario={usuario} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">

        <div>
          <h1 className="section-title">🎯 BONUS PRE-MUNDIAL</h1>
          <p className="font-cond text-brand-muted mt-1 tracking-wider text-sm">
            Predicciones especiales que se bloquean al inicio del torneo
          </p>
        </div>

        {/* Puntos bonus */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '🏆 Campeón',     pts: config?.pts_bonus_campeon    ?? 5 },
            { label: '🥈 Subcampeón',  pts: config?.pts_bonus_subcampeon ?? 3 },
            { label: '⚽ Goleador',    pts: config?.pts_bonus_goleador   ?? 1 },
          ].map(b => (
            <div key={b.label} className="card p-4 text-center">
              <p className="font-cond text-xs text-brand-muted mb-1">{b.label}</p>
              <p className="font-display text-2xl text-brand-gold">+{b.pts} pts</p>
            </div>
          ))}
        </div>

        <FormBonus
          bonusActual={bonus}
          userId={user.id}
          bloqueado={bonus?.bloqueado || config?.mundial_iniciado || false}
        />

        {/* Mis bonus puntuados */}
        {bonus && (bonus.puntos_bonus_total > 0 || bonus.bloqueado) && (
          <div className="card p-5 space-y-3">
            <h2 className="font-display text-xl tracking-widest text-brand-gold">MIS RESULTADOS BONUS</h2>
            {[
              { label: 'Campeón',    pred: bonus.campeon_predicho,    pts: bonus.puntos_campeon },
              { label: 'Subcampeón', pred: bonus.subcampeon_predicho, pts: bonus.puntos_subcampeon },
              { label: 'Goleador',   pred: bonus.goleador_predicho,   pts: bonus.puntos_goleador },
            ].map(b => b.pred && (
              <div key={b.label} className="flex items-center justify-between">
                <div>
                  <p className="font-cond text-xs text-brand-muted tracking-wider uppercase">{b.label}</p>
                  <p className="font-cond text-sm text-white">{b.pred}</p>
                </div>
                <span className={`font-display text-xl ${b.pts > 0 ? 'text-brand-gold' : 'text-brand-muted'}`}>
                  {b.pts > 0 ? `+${b.pts}` : '0'} pts
                </span>
              </div>
            ))}
            <div className="border-t border-brand-dark4 pt-3 flex justify-between">
              <p className="font-cond font-bold text-sm text-white">TOTAL BONUS</p>
              <p className="font-display text-2xl text-brand-gold">+{bonus.puntos_bonus_total} pts</p>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
