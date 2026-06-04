'use client'
// src/components/admin/FormResultado.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { TODOS_LOS_EQUIPOS } from '@/constants/grupos'
import type { Partido } from '@/types'

interface Props { partido: Partido }

export default function FormResultado({ partido }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    goles_local_90:    partido.goles_local_90    ?? 0,
    goles_visita_90:   partido.goles_visita_90   ?? 0,
    goles_local_final: partido.goles_local_final ?? 0,
    goles_visita_final:partido.goles_visita_final ?? 0,
    hubo_extra_tiempo: partido.hubo_extra_tiempo,
    hubo_penales:      partido.hubo_penales,
    clasificado_real:  partido.clasificado_real ?? '',
    estado:            partido.estado,
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  async function guardarResultado() {
    setLoading(true)
    const supabase = createClient()

    // 1. Actualizar partido
    const { error: errPartido } = await supabase
      .from('partidos')
      .update({
        goles_local_90:     form.goles_local_90,
        goles_visita_90:    form.goles_visita_90,
        goles_local_final:  form.goles_local_final,
        goles_visita_final: form.goles_visita_final,
        hubo_extra_tiempo:  form.hubo_extra_tiempo,
        hubo_penales:       form.hubo_penales,
        clasificado_real:   form.clasificado_real || null,
        estado:             form.estado,
      })
      .eq('id', partido.id)

    if (errPartido) { toast.error('Error al guardar partido: ' + errPartido.message); setLoading(false); return }

    // 2. Calcular puntos via RPC
    const { error: errPuntos } = await supabase.rpc('calcular_puntos_partido', { p_id_partido: partido.id })
    if (errPuntos) toast.error('Error al calcular puntos: ' + errPuntos.message)
    else toast.success('✅ Resultado guardado y puntos calculados')

    setLoading(false)
    router.refresh()
  }

  async function bloquearManual() {
    setLoading(true)
    const supabase = createClient()
    await supabase.rpc('bloquear_predicciones_partido', { p_id_partido: partido.id })
    toast.success('Partido bloqueado manualmente')
    setLoading(false)
    router.refresh()
  }

  const esEliminacion = partido.fase !== 'grupos'
  const empateEn90 = form.goles_local_90 === form.goles_visita_90

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h2 className="font-display text-xl tracking-widest text-brand-gold">RESULTADO OFICIAL</h2>
        <span className={`badge ${
          partido.estado === 'pendiente'    ? 'badge-abierto' :
          partido.estado === 'bloqueado'    ? 'badge-bloqueado' :
          partido.estado === 'en_juego'     ? 'badge-en-juego' :
          'badge-finalizado'
        }`}>
          {partido.estado}
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Estado */}
        <div>
          <label className="label">Estado del partido</label>
          <select className="input" value={form.estado} onChange={e => set('estado', e.target.value)}>
            <option value="pendiente">Pendiente</option>
            <option value="bloqueado">Bloqueado</option>
            <option value="en_juego">En juego</option>
            <option value="finalizado_90">Finalizado (90&apos;)</option>
            <option value="finalizado_extra">Finalizado (Prórroga)</option>
            <option value="finalizado_penales">Finalizado (Penales)</option>
          </select>
        </div>

        {/* Resultado al 90' */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="label">{partido.equipo_local} (goles al 90&apos;)</label>
            <input type="number" min={0} max={30} className="input text-center text-2xl"
              value={form.goles_local_90}
              onChange={e => set('goles_local_90', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label className="label">{partido.equipo_visita} (goles al 90&apos;)</label>
            <input type="number" min={0} max={30} className="input text-center text-2xl"
              value={form.goles_visita_90}
              onChange={e => set('goles_visita_90', parseInt(e.target.value) || 0)} />
          </div>
        </div>

        {/* Extra/Penales */}
        {esEliminacion && (
          <>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-brand-gold"
                  checked={form.hubo_extra_tiempo}
                  onChange={e => set('hubo_extra_tiempo', e.target.checked)} />
                <span className="font-cond text-sm text-white">Hubo prórroga (extra time)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-brand-gold"
                  checked={form.hubo_penales}
                  onChange={e => set('hubo_penales', e.target.checked)} />
                <span className="font-cond text-sm text-white">Hubo penales</span>
              </label>
            </div>

            {(form.hubo_extra_tiempo || form.hubo_penales) && (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="label">{partido.equipo_local} (goles final)</label>
                    <input type="number" min={0} max={30} className="input text-center"
                      value={form.goles_local_final}
                      onChange={e => set('goles_local_final', parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="label">{partido.equipo_visita} (goles final)</label>
                    <input type="number" min={0} max={30} className="input text-center"
                      value={form.goles_visita_final}
                      onChange={e => set('goles_visita_final', parseInt(e.target.value) || 0)} />
                  </div>
                </div>

                <div>
                  <label className="label">Equipo clasificado</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[partido.equipo_local, partido.equipo_visita].map(eq => (
                      <button key={eq} type="button"
                        onClick={() => set('clasificado_real', eq)}
                        className={`p-3 rounded-lg border-2 font-cond text-sm tracking-wider transition-all ${
                          form.clasificado_real === eq
                            ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                            : 'border-brand-dark4 text-brand-muted hover:border-brand-gold/50'
                        }`}>
                        {eq}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Botones */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={guardarResultado}
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-50">
            {loading ? 'Guardando y calculando...' : '💾 Guardar resultado y calcular puntos'}
          </button>
          {partido.estado === 'pendiente' && (
            <button onClick={bloquearManual} disabled={loading}
              className="btn-ghost disabled:opacity-50">
              🔒 Bloquear manualmente
            </button>
          )}
        </div>

        <p className="font-cond text-xs text-brand-muted tracking-wider">
          ⚠️ Al guardar se calcularán automáticamente los puntos de todos los participantes y
          se actualizará la tabla de posiciones en tiempo real.
        </p>
      </div>
    </div>
  )
}
