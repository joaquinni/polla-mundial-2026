-- ============================================================
-- MIGRACIÓN 003 — Funciones SQL de negocio
-- ============================================================

-- ============================================================
-- calcular_puntos_partido
-- Calcula y asigna puntos a todas las predicciones de un partido
-- ============================================================
CREATE OR REPLACE FUNCTION calcular_puntos_partido(p_id_partido UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_partido     public.partidos%ROWTYPE;
  v_pred        RECORD;
  v_puntos      INTEGER;
  v_tipo        TEXT;
  v_procesados  INTEGER := 0;
BEGIN
  -- Obtener datos del partido
  SELECT * INTO v_partido FROM public.partidos WHERE id = p_id_partido;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Partido no encontrado');
  END IF;

  IF v_partido.goles_local_90 IS NULL OR v_partido.goles_visita_90 IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'El partido no tiene resultado al minuto 90');
  END IF;

  -- Recorrer todas las predicciones del partido
  FOR v_pred IN
    SELECT * FROM public.predicciones WHERE id_partido = p_id_partido
  LOOP
    v_puntos := 0;
    v_tipo   := 'error';

    -- ── FASE DE GRUPOS ────────────────────────────────────────
    IF v_partido.fase = 'grupos' THEN

      IF v_pred.goles_local_pred  = v_partido.goles_local_90
         AND v_pred.goles_visita_pred = v_partido.goles_visita_90 THEN
        -- Resultado exacto
        v_puntos := 3;
        v_tipo   := 'exacto';

      ELSIF SIGN(v_pred.goles_local_pred - v_pred.goles_visita_pred) =
            SIGN(v_partido.goles_local_90 - v_partido.goles_visita_90) THEN
        -- Acertó ganador o empate pero no el marcador
        v_puntos := 1;
        v_tipo   := 'simple';
      END IF;

    -- ── ELIMINACIÓN DIRECTA ───────────────────────────────────
    ELSE

      IF NOT v_partido.hubo_extra_tiempo AND NOT v_partido.hubo_penales THEN
        -- Sin prórroga → aplica resultado exacto a los 90'
        IF v_pred.goles_local_pred  = v_partido.goles_local_90
           AND v_pred.goles_visita_pred = v_partido.goles_visita_90 THEN
          v_puntos := 3;
          v_tipo   := 'exacto';
        END IF;

      ELSE
        -- Con prórroga o penales → solo importa el clasificado
        IF v_pred.ganador_predicho IS NOT NULL
           AND v_pred.ganador_predicho = v_partido.clasificado_real THEN
          v_puntos := 1;
          v_tipo   := 'clasificado';
        END IF;
      END IF;

    END IF;

    -- Actualizar predicción con puntos calculados
    UPDATE public.predicciones
    SET
      puntos_obtenidos = v_puntos,
      tipo_acierto     = v_tipo
    WHERE id = v_pred.id;

    v_procesados := v_procesados + 1;
  END LOOP;

  -- Actualizar totales de todos los usuarios afectados
  PERFORM recalcular_totales_usuarios();

  RETURN jsonb_build_object(
    'ok', true,
    'partido', p_id_partido,
    'predicciones_procesadas', v_procesados
  );
END;
$$;

-- ============================================================
-- recalcular_totales_usuarios
-- Recalcula puntos_totales y estadísticas de TODOS los usuarios
-- ============================================================
CREATE OR REPLACE FUNCTION recalcular_totales_usuarios()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.usuarios u SET
    puntos_totales = COALESCE((
      SELECT SUM(p.puntos_obtenidos)
      FROM public.predicciones p
      WHERE p.id_usuario = u.id
        AND p.puntos_obtenidos IS NOT NULL
    ), 0) + COALESCE((
      SELECT b.puntos_bonus_total
      FROM public.bonus_premundial b
      WHERE b.id_usuario = u.id
    ), 0),

    exactos_acertados = COALESCE((
      SELECT COUNT(*)
      FROM public.predicciones p
      WHERE p.id_usuario = u.id
        AND p.tipo_acierto = 'exacto'
    ), 0),

    aciertos_simples = COALESCE((
      SELECT COUNT(*)
      FROM public.predicciones p
      WHERE p.id_usuario = u.id
        AND p.tipo_acierto IN ('simple', 'clasificado')
    ), 0),

    puntos_eliminacion = COALESCE((
      SELECT SUM(p.puntos_obtenidos)
      FROM public.predicciones p
      JOIN public.partidos pt ON pt.id = p.id_partido
      WHERE p.id_usuario = u.id
        AND pt.fase != 'grupos'
        AND p.puntos_obtenidos IS NOT NULL
    ), 0),

    errores = COALESCE((
      SELECT COUNT(*)
      FROM public.predicciones p
      WHERE p.id_usuario = u.id
        AND p.tipo_acierto = 'error'
    ), 0),

    partidos_jugados = COALESCE((
      SELECT COUNT(*)
      FROM public.predicciones p
      WHERE p.id_usuario = u.id
        AND p.puntos_obtenidos IS NOT NULL
    ), 0),

    updated_at = NOW();
END;
$$;

-- ============================================================
-- bloquear_predicciones_partido
-- Bloquea predicciones y cambia estado del partido
-- (también lo llama el cron job automático)
-- ============================================================
CREATE OR REPLACE FUNCTION bloquear_predicciones_partido(p_id_partido UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.predicciones
  SET bloqueado = TRUE
  WHERE id_partido = p_id_partido AND bloqueado = FALSE;

  UPDATE public.partidos
  SET estado = 'bloqueado'
  WHERE id = p_id_partido AND estado = 'pendiente';
END;
$$;

-- ============================================================
-- calcular_bonus_premundial
-- Admin la llama cuando finaliza el mundial
-- ============================================================
CREATE OR REPLACE FUNCTION calcular_bonus_premundial(
  p_campeon     TEXT,
  p_subcampeon  TEXT,
  p_goleador    TEXT
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_config      public.configuracion%ROWTYPE;
  v_procesados  INTEGER := 0;
BEGIN
  SELECT * INTO v_config FROM public.configuracion WHERE id = 1;

  UPDATE public.bonus_premundial SET
    puntos_campeon    = CASE WHEN campeon_predicho    = p_campeon    THEN v_config.pts_bonus_campeon    ELSE 0 END,
    puntos_subcampeon = CASE WHEN subcampeon_predicho = p_subcampeon THEN v_config.pts_bonus_subcampeon ELSE 0 END,
    puntos_goleador   = CASE WHEN goleador_predicho   = p_goleador   THEN v_config.pts_bonus_goleador   ELSE 0 END,
    puntos_bonus_total = (
      CASE WHEN campeon_predicho    = p_campeon    THEN v_config.pts_bonus_campeon    ELSE 0 END +
      CASE WHEN subcampeon_predicho = p_subcampeon THEN v_config.pts_bonus_subcampeon ELSE 0 END +
      CASE WHEN goleador_predicho   = p_goleador   THEN v_config.pts_bonus_goleador   ELSE 0 END
    );

  GET DIAGNOSTICS v_procesados = ROW_COUNT;

  -- Recalcular totales para que incluyan bonus
  PERFORM recalcular_totales_usuarios();

  RETURN jsonb_build_object('ok', true, 'procesados', v_procesados);
END;
$$;

-- ============================================================
-- get_tabla_posiciones
-- Devuelve la tabla ordenada con criterios de desempate
-- ============================================================
CREATE OR REPLACE FUNCTION get_tabla_posiciones()
RETURNS TABLE (
  posicion           INTEGER,
  id                 UUID,
  nombre             TEXT,
  puntos_totales     INTEGER,
  exactos_acertados  INTEGER,
  aciertos_simples   INTEGER,
  puntos_eliminacion INTEGER,
  errores            INTEGER,
  partidos_jugados   INTEGER,
  pagado             BOOLEAN
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    ROW_NUMBER() OVER (
      ORDER BY
        u.puntos_totales     DESC,
        u.exactos_acertados  DESC,
        u.aciertos_simples   DESC,
        u.puntos_eliminacion DESC
    )::INTEGER AS posicion,
    u.id,
    u.nombre,
    u.puntos_totales,
    u.exactos_acertados,
    u.aciertos_simples,
    u.puntos_eliminacion,
    u.errores,
    u.partidos_jugados,
    u.pagado
  FROM public.usuarios u
  WHERE u.rol = 'participante';
$$;

-- ============================================================
-- get_estadisticas_usuario
-- Estadísticas detalladas de un usuario específico
-- ============================================================
CREATE OR REPLACE FUNCTION get_estadisticas_usuario(p_id_usuario UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_usuario public.usuarios%ROWTYPE;
  v_bonus   public.bonus_premundial%ROWTYPE;
  v_result  JSONB;
BEGIN
  SELECT * INTO v_usuario FROM public.usuarios WHERE id = p_id_usuario;
  SELECT * INTO v_bonus   FROM public.bonus_premundial WHERE id_usuario = p_id_usuario;

  v_result := jsonb_build_object(
    'usuario', row_to_json(v_usuario),
    'bonus',   row_to_json(v_bonus),
    'porcentaje_acierto',
      CASE WHEN v_usuario.partidos_jugados > 0
        THEN ROUND(
          (v_usuario.exactos_acertados + v_usuario.aciertos_simples)::NUMERIC
          / v_usuario.partidos_jugados * 100, 1
        )
        ELSE 0
      END,
    'mejor_racha', (
      -- Contar racha actual de aciertos (exacto o simple)
      SELECT COUNT(*)
      FROM (
        SELECT tipo_acierto,
          ROW_NUMBER() OVER (ORDER BY p.fecha_hora_inicio DESC) as rn
        FROM public.predicciones pred
        JOIN public.partidos p ON p.id = pred.id_partido
        WHERE pred.id_usuario = p_id_usuario
          AND pred.tipo_acierto IN ('exacto','simple','clasificado')
        ORDER BY p.fecha_hora_inicio DESC
      ) sub
      WHERE rn <= (
        SELECT COALESCE(MIN(rn2), 999)
        FROM (
          SELECT ROW_NUMBER() OVER (ORDER BY p2.fecha_hora_inicio DESC) as rn2
          FROM public.predicciones pred2
          JOIN public.partidos p2 ON p2.id = pred2.id_partido
          WHERE pred2.id_usuario = p_id_usuario
            AND pred2.tipo_acierto = 'error'
        ) sub2
      )
    )
  );

  RETURN v_result;
END;
$$;
