// src/lib/puntos/calcularPuntos.ts
import type { Partido, Prediccion, ResultadoPuntos } from '@/types'

export function calcularPuntos(partido: Partido, pred: Prediccion): ResultadoPuntos {
  const { goles_local_90, goles_visita_90, hubo_extra_tiempo, hubo_penales, fase } = partido

  if (goles_local_90 === undefined || goles_visita_90 === undefined) {
    return { puntos: 0, tipo: 'pendiente' }
  }

  // ── FASE DE GRUPOS ────────────────────────────────────────────
  if (fase === 'grupos') {
    const esExacto =
      pred.goles_local_pred  === goles_local_90 &&
      pred.goles_visita_pred === goles_visita_90

    if (esExacto) return { puntos: 3, tipo: 'exacto' }

    const signoReal = Math.sign(goles_local_90 - goles_visita_90)
    const signoPred = Math.sign(pred.goles_local_pred - pred.goles_visita_pred)

    if (signoReal === signoPred) return { puntos: 1, tipo: 'simple' }

    return { puntos: 0, tipo: 'error' }
  }

  // ── ELIMINACIÓN DIRECTA ───────────────────────────────────────
  if (!hubo_extra_tiempo && !hubo_penales) {
    // Sin prórroga → aplica resultado exacto a los 90'
    const esExacto =
      pred.goles_local_pred  === goles_local_90 &&
      pred.goles_visita_pred === goles_visita_90

    if (esExacto) return { puntos: 3, tipo: 'exacto' }
    return { puntos: 0, tipo: 'error' }
  }

  // Con prórroga o penales → solo importa quién clasificó
  if (pred.ganador_predicho && pred.ganador_predicho === partido.clasificado_real) {
    return { puntos: 1, tipo: 'clasificado' }
  }

  return { puntos: 0, tipo: 'error' }
}

export function calcularBonus(
  real: { campeon: string; subcampeon: string; goleador: string },
  pred: { campeon_predicho?: string; subcampeon_predicho?: string; goleador_predicho?: string },
  pts  = { campeon: 5, subcampeon: 3, goleador: 1 }
) {
  const ptsCampeon    = pred.campeon_predicho    === real.campeon    ? pts.campeon    : 0
  const ptsSubcampeon = pred.subcampeon_predicho === real.subcampeon ? pts.subcampeon : 0
  const ptsGoleador   = pred.goleador_predicho   === real.goleador   ? pts.goleador   : 0

  return {
    pts_campeon:    ptsCampeon,
    pts_subcampeon: ptsSubcampeon,
    pts_goleador:   ptsGoleador,
    total:          ptsCampeon + ptsSubcampeon + ptsGoleador,
  }
}

export function estaBloqueo(fechaBloqueo: string): boolean {
  return new Date(fechaBloqueo) <= new Date()
}

export function minutosParaBloqueo(fechaBloqueo: string): number {
  const diff = new Date(fechaBloqueo).getTime() - Date.now()
  return Math.max(0, Math.floor(diff / 60_000))
}
