'use client'
// src/components/predicciones/FormPrediccion.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { TODOS_LOS_EQUIPOS } from '@/constants/grupos'
import type { Partido, Prediccion } from '@/types'

interface Props {
  partido: Partido
  prediccionActual?: Prediccion | null
  userId: string
  bloqueado: boolean
}

export default function FormPrediccion({ partido, prediccionActual, userId, bloqueado }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [golesLocal,  setGolesLocal]  = useState(prediccionActual?.goles_local_pred  ?? 0)
  const [golesVisita, setGolesVisita] = useState(prediccionActual?.goles_visita_pred ?? 0)
  const [ganador, setGanador] = useState(prediccionActual?.ganador_predicho ?? '')

  const esEliminacion = partido.fase !== 'grupos'
  const empate = golesLocal === golesVisita && esEliminacion

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (bloqueado) return

    if (esEliminacion && !ganador) {
      toast.error('Debes seleccionar quién clasifica en caso de empate')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const payload = {
      id_usuario:        userId,
      id_partido:        partido.id,
      goles_local_pred:  golesLocal,
      goles_visita_pred: golesVisita,
      ganador_predicho:  esEliminacion ? ganador || null : null,
      fecha_ultima_edicion: new Date().toISOString(),
    }

    let error
    if (prediccionActual) {
      // Guardar historial
      await supabase.from('historial_cambios').insert({
        id_usuario: userId,
        id_partido: partido.id,
        goles_local_anterior:  prediccionActual.goles_local_pred,
        goles_visita_anterior: prediccionActual.goles_visita_pred,
        goles_local_nuevo:     golesLocal,
        goles_visita_nuevo:    golesVisita,
      })
      const res = await supabase.from('predicciones')
        .update(payload)
        .eq('id', prediccionActual.id)
      error = res.error
    } else {
      const res = await supabase.from('predicciones').insert(payload)
      error = res.error
    }

    setLoading(false)
    if (error) { toast.error('Error al guardar: ' + error.message); return }
    toast.success(prediccionActual ? '¡Predicción actualizada!' : '¡Predicción guardada!')
    router.refresh()
  }

  function Stepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
    return (
      <div className="text-center">
        <p className="font-cond text-xs tracking-widest text-brand-muted uppercase mb-2">{label}</p>
        <div className="flex items-center gap-3">
          <button type="button"
            onClick={() => onChange(Math.max(0, value - 1))}
            disabled={bloqueado || value === 0}
            className="w-10 h-10 rounded-lg bg-brand-dark3 border border-brand-dark4 text-white font-bold text-lg
                       hover:border-brand-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            −
          </button>
          <span className="font-display text-5xl text-brand-gold w-12 text-center">{value}</span>
          <button type="button"
            onClick={() => onChange(Math.min(20, value + 1))}
            disabled={bloqueado}
            className="w-10 h-10 rounded-lg bg-brand-dark3 border border-brand-dark4 text-white font-bold text-lg
                       hover:border-brand-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            +
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="font-display text-xl tracking-widest text-brand-gold">
          {prediccionActual ? 'EDITAR PREDICCIÓN' : 'MI PREDICCIÓN'}
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        {bloqueado && (
          <div className="mb-6 bg-yellow-900/20 border border-yellow-700/50 rounded-lg px-4 py-3">
            <p className="font-cond text-sm text-yellow-400 tracking-wider">
              🔒 Las predicciones están cerradas para este partido
            </p>
          </div>
        )}

        {/* Marcador */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <Stepper label={partido.equipo_local} value={golesLocal}  onChange={setGolesLocal}  />
          <span className="font-display text-3xl text-brand-muted mt-6">–</span>
          <Stepper label={partido.equipo_visita} value={golesVisita} onChange={setGolesVisita} />
        </div>

        {/* Selección de ganador en eliminación directa */}
        {esEliminacion && (
          <div className="mb-6">
            <p className="label text-center mb-3">¿Quién clasifica? (obligatorio)</p>
            <div className="grid grid-cols-2 gap-3">
              {[partido.equipo_local, partido.equipo_visita].map(equipo => {
                const bandera = equipo === partido.equipo_local ? partido.bandera_local : partido.bandera_visita
                return (
                  <button key={equipo} type="button"
                    disabled={bloqueado}
                    onClick={() => setGanador(equipo)}
                    className={`p-4 rounded-lg border-2 font-cond text-sm tracking-wider transition-all ${
                      ganador === equipo
                        ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                        : 'border-brand-dark4 text-brand-muted hover:border-brand-gold/50'
                    } disabled:cursor-not-allowed`}>
                    {bandera} {equipo}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Explicación de puntos */}
        <div className="bg-brand-dark3 rounded-lg p-4 mb-6">
          <p className="font-cond text-xs text-brand-muted tracking-wider leading-relaxed">
            {partido.fase === 'grupos' ? (
              <>
                <span className="text-brand-gold font-bold">3 pts</span> resultado exacto &nbsp;·&nbsp;
                <span className="text-blue-400 font-bold">1 pt</span> acierta ganador/empate &nbsp;·&nbsp;
                <span className="text-red-400 font-bold">0 pts</span> todo errado
              </>
            ) : (
              <>
                <span className="text-brand-gold font-bold">3 pts</span> exacto en 90&apos; &nbsp;·&nbsp;
                <span className="text-blue-400 font-bold">1 pt</span> acierta clasificado (prórroga/penales) &nbsp;·&nbsp;
                <span className="text-red-400 font-bold">0 pts</span> falla
              </>
            )}
          </p>
        </div>

        {!bloqueado && (
          <button type="submit" disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Guardando...' : prediccionActual ? 'Actualizar predicción' : 'Guardar predicción'}
          </button>
        )}
      </form>
    </div>
  )
}
