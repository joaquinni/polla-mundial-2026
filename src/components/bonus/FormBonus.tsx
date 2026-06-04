'use client'
// src/components/bonus/FormBonus.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { NOMBRES_EQUIPOS } from '@/constants/grupos'
import toast from 'react-hot-toast'

interface Props {
  bonusActual?: any
  userId: string
  bloqueado: boolean
}

export default function FormBonus({ bonusActual, userId, bloqueado }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    campeon_predicho:    bonusActual?.campeon_predicho    ?? '',
    subcampeon_predicho: bonusActual?.subcampeon_predicho ?? '',
    goleador_predicho:   bonusActual?.goleador_predicho   ?? '',
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (bloqueado) return
    if (!form.campeon_predicho || !form.subcampeon_predicho || !form.goleador_predicho.trim()) {
      toast.error('Completa todos los campos del bonus')
      return
    }
    if (form.campeon_predicho === form.subcampeon_predicho) {
      toast.error('El campeón y subcampeón deben ser equipos distintos')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const payload = {
      id_usuario:          userId,
      campeon_predicho:    form.campeon_predicho,
      subcampeon_predicho: form.subcampeon_predicho,
      goleador_predicho:   form.goleador_predicho.trim(),
    }

    const { error } = bonusActual
      ? await supabase.from('bonus_premundial').update(payload).eq('id_usuario', userId)
      : await supabase.from('bonus_premundial').insert(payload)

    setLoading(false)
    if (error) { toast.error('Error: ' + error.message); return }
    toast.success('¡Bonus guardado!')
    router.refresh()
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="font-display text-xl tracking-widest text-brand-gold">
          {bonusActual ? 'EDITAR BONUS' : 'REGISTRAR BONUS'}
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">

        {bloqueado && (
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg px-4 py-3">
            <p className="font-cond text-sm text-yellow-400 tracking-wider">
              🔒 Las predicciones bonus están bloqueadas — el Mundial ya comenzó
            </p>
          </div>
        )}

        <div>
          <label className="label">🏆 Campeón del mundo</label>
          <select className="input" value={form.campeon_predicho} onChange={set('campeon_predicho')} disabled={bloqueado} required>
            <option value="">Selecciona un equipo...</option>
            {NOMBRES_EQUIPOS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div>
          <label className="label">🥈 Subcampeón</label>
          <select className="input" value={form.subcampeon_predicho} onChange={set('subcampeon_predicho')} disabled={bloqueado} required>
            <option value="">Selecciona un equipo...</option>
            {NOMBRES_EQUIPOS.filter(n => n !== form.campeon_predicho).map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">⚽ Goleador del torneo</label>
          <input type="text" className="input" placeholder="Nombre del jugador (ej: Mbappe)"
            value={form.goleador_predicho} onChange={set('goleador_predicho')}
            disabled={bloqueado} required />
          <p className="font-cond text-xs text-brand-muted mt-1.5">Escribe el nombre tal como aparece oficialmente</p>
        </div>

        {!bloqueado && (
          <button type="submit" disabled={loading}
            className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Guardando...' : bonusActual ? 'Actualizar bonus' : 'Guardar bonus'}
          </button>
        )}
      </form>
    </div>
  )
}
