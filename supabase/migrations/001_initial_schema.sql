-- ============================================================
-- MIGRACIÓN 001 — Schema completo Polla Mundial 2026
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: usuarios (extiende auth.users de Supabase)
-- ============================================================
CREATE TABLE public.usuarios (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre               TEXT NOT NULL,
  email                TEXT NOT NULL UNIQUE,
  rol                  TEXT NOT NULL DEFAULT 'participante'
                         CHECK (rol IN ('admin', 'participante')),
  pagado               BOOLEAN NOT NULL DEFAULT FALSE,
  puntos_totales       INTEGER NOT NULL DEFAULT 0,
  exactos_acertados    INTEGER NOT NULL DEFAULT 0,
  aciertos_simples     INTEGER NOT NULL DEFAULT 0,
  puntos_eliminacion   INTEGER NOT NULL DEFAULT 0,
  errores              INTEGER NOT NULL DEFAULT 0,
  partidos_jugados     INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: partidos
-- ============================================================
CREATE TABLE public.partidos (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fase                 TEXT NOT NULL
                         CHECK (fase IN ('grupos','ronda_32','octavos','cuartos',
                                         'semifinal','tercer_puesto','final')),
  grupo                CHAR(1),
  equipo_local         TEXT NOT NULL,
  equipo_visita        TEXT NOT NULL,
  bandera_local        TEXT,
  bandera_visita       TEXT,
  fecha_hora_inicio    TIMESTAMPTZ NOT NULL,
  fecha_bloqueo        TIMESTAMPTZ GENERATED ALWAYS AS
                         (fecha_hora_inicio - INTERVAL '1 hour') STORED,
  sede                 TEXT,
  estado               TEXT NOT NULL DEFAULT 'pendiente'
                         CHECK (estado IN ('pendiente','bloqueado','en_juego',
                                           'finalizado_90','finalizado_extra',
                                           'finalizado_penales')),
  -- Resultado al minuto 90
  goles_local_90       INTEGER CHECK (goles_local_90 >= 0),
  goles_visita_90      INTEGER CHECK (goles_visita_90 >= 0),
  -- Resultado final (puede diferir si hay ET/penales)
  goles_local_final    INTEGER CHECK (goles_local_final >= 0),
  goles_visita_final   INTEGER CHECK (goles_visita_final >= 0),
  -- Eliminación directa
  hubo_extra_tiempo    BOOLEAN NOT NULL DEFAULT FALSE,
  hubo_penales         BOOLEAN NOT NULL DEFAULT FALSE,
  clasificado_real     TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: predicciones
-- ============================================================
CREATE TABLE public.predicciones (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario           UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  id_partido           UUID NOT NULL REFERENCES public.partidos(id) ON DELETE CASCADE,
  goles_local_pred     INTEGER NOT NULL CHECK (goles_local_pred >= 0),
  goles_visita_pred    INTEGER NOT NULL CHECK (goles_visita_pred >= 0),
  ganador_predicho     TEXT,
  fecha_prediccion     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_ultima_edicion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  bloqueado            BOOLEAN NOT NULL DEFAULT FALSE,
  puntos_obtenidos     INTEGER,
  tipo_acierto         TEXT CHECK (tipo_acierto IN
                         ('exacto','simple','clasificado','error','pendiente')),
  UNIQUE (id_usuario, id_partido)
);

-- ============================================================
-- TABLA: bonus_premundial
-- ============================================================
CREATE TABLE public.bonus_premundial (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario           UUID NOT NULL REFERENCES public.usuarios(id)
                         ON DELETE CASCADE UNIQUE,
  campeon_predicho     TEXT,
  subcampeon_predicho  TEXT,
  goleador_predicho    TEXT,
  puntos_campeon       INTEGER NOT NULL DEFAULT 0,
  puntos_subcampeon    INTEGER NOT NULL DEFAULT 0,
  puntos_goleador      INTEGER NOT NULL DEFAULT 0,
  puntos_bonus_total   INTEGER NOT NULL DEFAULT 0,
  bloqueado            BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_registro       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: historial_cambios
-- ============================================================
CREATE TABLE public.historial_cambios (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario            UUID NOT NULL REFERENCES public.usuarios(id),
  id_partido            UUID NOT NULL REFERENCES public.partidos(id),
  goles_local_anterior  INTEGER,
  goles_visita_anterior INTEGER,
  goles_local_nuevo     INTEGER,
  goles_visita_nuevo    INTEGER,
  motivo                TEXT NOT NULL DEFAULT 'edicion_usuario',
  fecha_cambio          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: premios_especiales
-- ============================================================
CREATE TABLE public.premios_especiales (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo        TEXT NOT NULL
                CHECK (tipo IN ('mas_exactos','mejor_fecha','remontada','ultimo','eliminacion')),
  activo      BOOLEAN NOT NULL DEFAULT FALSE,
  descripcion TEXT,
  monto       INTEGER
);

-- ============================================================
-- TABLA: configuracion (singleton — solo 1 fila)
-- ============================================================
CREATE TABLE public.configuracion (
  id                    INTEGER PRIMARY KEY DEFAULT 1,
  nombre_polla          TEXT NOT NULL DEFAULT 'Polla Mundial 2026',
  monto_entrada         INTEGER NOT NULL DEFAULT 25000,
  porcentaje_primero    INTEGER NOT NULL DEFAULT 75,
  porcentaje_segundo    INTEGER NOT NULL DEFAULT 15,
  porcentaje_tercero    INTEGER NOT NULL DEFAULT 10,
  mundial_iniciado      BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_inicio_mundial  TIMESTAMPTZ,
  pts_resultado_exacto  INTEGER NOT NULL DEFAULT 3,
  pts_acierto_simple    INTEGER NOT NULL DEFAULT 1,
  pts_clasificado       INTEGER NOT NULL DEFAULT 1,
  pts_bonus_campeon     INTEGER NOT NULL DEFAULT 5,
  pts_bonus_subcampeon  INTEGER NOT NULL DEFAULT 3,
  pts_bonus_goleador    INTEGER NOT NULL DEFAULT 1,
  sheets_spreadsheet_id TEXT,
  CONSTRAINT solo_una_fila CHECK (id = 1)
);

-- Insertar configuración inicial
INSERT INTO public.configuracion (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ============================================================
-- ÍNDICES para mejorar rendimiento
-- ============================================================
CREATE INDEX idx_predicciones_usuario  ON public.predicciones(id_usuario);
CREATE INDEX idx_predicciones_partido  ON public.predicciones(id_partido);
CREATE INDEX idx_partidos_fecha        ON public.partidos(fecha_hora_inicio);
CREATE INDEX idx_partidos_estado       ON public.partidos(estado);
CREATE INDEX idx_partidos_fase         ON public.partidos(fase);
CREATE INDEX idx_historial_usuario     ON public.historial_cambios(id_usuario);
CREATE INDEX idx_historial_partido     ON public.historial_cambios(id_partido);

-- ============================================================
-- TRIGGER: auto-actualizar updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_partidos_updated_at
  BEFORE UPDATE ON public.partidos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TRIGGER: crear perfil de usuario al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
