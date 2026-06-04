// src/types/index.ts

export type Rol = 'admin' | 'participante'

export type FasePartido =
  | 'grupos'
  | 'ronda_32'
  | 'octavos'
  | 'cuartos'
  | 'semifinal'
  | 'tercer_puesto'
  | 'final'

export type EstadoPartido =
  | 'pendiente'
  | 'bloqueado'
  | 'en_juego'
  | 'finalizado_90'
  | 'finalizado_extra'
  | 'finalizado_penales'

export type TipoAcierto = 'exacto' | 'simple' | 'clasificado' | 'error' | 'pendiente'

// ── Tablas de base de datos ────────────────────────────────────

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: Rol
  pagado: boolean
  puntos_totales: number
  exactos_acertados: number
  aciertos_simples: number
  puntos_eliminacion: number
  errores: number
  partidos_jugados: number
  created_at: string
  updated_at: string
}

export interface Partido {
  id: string
  fase: FasePartido
  grupo?: string
  equipo_local: string
  equipo_visita: string
  bandera_local?: string
  bandera_visita?: string
  fecha_hora_inicio: string
  fecha_bloqueo: string
  sede?: string
  estado: EstadoPartido
  goles_local_90?: number
  goles_visita_90?: number
  goles_local_final?: number
  goles_visita_final?: number
  hubo_extra_tiempo: boolean
  hubo_penales: boolean
  clasificado_real?: string
  created_at: string
  updated_at: string
}

export interface Prediccion {
  id: string
  id_usuario: string
  id_partido: string
  goles_local_pred: number
  goles_visita_pred: number
  ganador_predicho?: string
  fecha_prediccion: string
  fecha_ultima_edicion: string
  bloqueado: boolean
  puntos_obtenidos?: number
  tipo_acierto?: TipoAcierto
}

export interface BonusPreMundial {
  id: string
  id_usuario: string
  campeon_predicho?: string
  subcampeon_predicho?: string
  goleador_predicho?: string
  puntos_campeon: number
  puntos_subcampeon: number
  puntos_goleador: number
  puntos_bonus_total: number
  bloqueado: boolean
  fecha_registro: string
}

export interface HistorialCambio {
  id: string
  id_usuario: string
  id_partido: string
  goles_local_anterior?: number
  goles_visita_anterior?: number
  goles_local_nuevo?: number
  goles_visita_nuevo?: number
  motivo: string
  fecha_cambio: string
}

export interface Configuracion {
  id: number
  nombre_polla: string
  monto_entrada: number
  porcentaje_primero: number
  porcentaje_segundo: number
  porcentaje_tercero: number
  mundial_iniciado: boolean
  fecha_inicio_mundial?: string
  pts_resultado_exacto: number
  pts_acierto_simple: number
  pts_clasificado: number
  pts_bonus_campeon: number
  pts_bonus_subcampeon: number
  pts_bonus_goleador: number
  sheets_spreadsheet_id?: string
}

// ── Vistas / joins ─────────────────────────────────────────────

export interface PartidoConPrediccion extends Partido {
  prediccion?: Prediccion
}

export interface FilaTabla extends Usuario {
  posicion: number
}

export interface ResultadoPuntos {
  puntos: number
  tipo: TipoAcierto
}
