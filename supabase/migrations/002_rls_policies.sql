-- ============================================================
-- MIGRACIÓN 002 — Row Level Security (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas públicas
ALTER TABLE public.usuarios          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partidos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predicciones      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_premundial  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_cambios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premios_especiales ENABLE ROW LEVEL SECURITY;

-- Helper: verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol = 'admin'
  );
$$;

-- ============================================================
-- USUARIOS
-- ============================================================

-- Cada usuario ve su propio perfil; admin ve todos
CREATE POLICY "usuarios_select" ON public.usuarios
  FOR SELECT USING (
    auth.uid() = id OR is_admin()
  );

-- Cada usuario puede actualizar su propio perfil (solo nombre)
CREATE POLICY "usuarios_update_own" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Solo admin puede actualizar campos sensibles como pagado, rol
CREATE POLICY "usuarios_update_admin" ON public.usuarios
  FOR UPDATE USING (is_admin());

-- ============================================================
-- PARTIDOS
-- ============================================================

-- Todos los autenticados pueden leer partidos
CREATE POLICY "partidos_select" ON public.partidos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Solo admin puede crear, editar y eliminar partidos
CREATE POLICY "partidos_insert" ON public.partidos
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "partidos_update" ON public.partidos
  FOR UPDATE USING (is_admin());

CREATE POLICY "partidos_delete" ON public.partidos
  FOR DELETE USING (is_admin());

-- ============================================================
-- PREDICCIONES
-- ============================================================

-- El usuario ve SUS predicciones siempre.
-- Ve las de OTROS solo cuando el partido está bloqueado.
-- Admin ve TODAS siempre.
CREATE POLICY "predicciones_select" ON public.predicciones
  FOR SELECT USING (
    id_usuario = auth.uid()
    OR is_admin()
    OR EXISTS (
      SELECT 1 FROM public.partidos p
      WHERE p.id = id_partido
        AND p.fecha_bloqueo <= NOW()
    )
  );

-- El usuario puede insertar su propia predicción
-- solo si el partido no ha sido bloqueado aún
CREATE POLICY "predicciones_insert" ON public.predicciones
  FOR INSERT WITH CHECK (
    id_usuario = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.partidos p
      WHERE p.id = id_partido
        AND p.fecha_bloqueo > NOW()
        AND p.estado = 'pendiente'
    )
  );

-- El usuario puede editar su predicción antes del bloqueo
CREATE POLICY "predicciones_update" ON public.predicciones
  FOR UPDATE USING (
    id_usuario = auth.uid()
    AND NOT bloqueado
    AND EXISTS (
      SELECT 1 FROM public.partidos p
      WHERE p.id = id_partido
        AND p.fecha_bloqueo > NOW()
    )
  );

-- Solo admin puede puntuar predicciones (update puntos_obtenidos)
CREATE POLICY "predicciones_update_admin" ON public.predicciones
  FOR UPDATE USING (is_admin());

-- ============================================================
-- BONUS PRE-MUNDIAL
-- ============================================================

-- El usuario ve y gestiona su propio bonus
CREATE POLICY "bonus_select" ON public.bonus_premundial
  FOR SELECT USING (id_usuario = auth.uid() OR is_admin());

CREATE POLICY "bonus_insert" ON public.bonus_premundial
  FOR INSERT WITH CHECK (
    id_usuario = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.configuracion WHERE mundial_iniciado = TRUE
    )
  );

CREATE POLICY "bonus_update" ON public.bonus_premundial
  FOR UPDATE USING (
    id_usuario = auth.uid()
    AND NOT bloqueado
    AND NOT EXISTS (
      SELECT 1 FROM public.configuracion WHERE mundial_iniciado = TRUE
    )
  );

-- Admin puede actualizar bonus para puntuar
CREATE POLICY "bonus_update_admin" ON public.bonus_premundial
  FOR UPDATE USING (is_admin());

-- ============================================================
-- HISTORIAL
-- ============================================================

-- El usuario ve su propio historial; admin ve todo
CREATE POLICY "historial_select" ON public.historial_cambios
  FOR SELECT USING (id_usuario = auth.uid() OR is_admin());

-- El sistema inserta historial (via service role)
CREATE POLICY "historial_insert" ON public.historial_cambios
  FOR INSERT WITH CHECK (is_admin());

-- ============================================================
-- CONFIGURACIÓN
-- ============================================================

-- Todos los autenticados pueden leer configuración
CREATE POLICY "config_select" ON public.configuracion
  FOR SELECT USING (auth.role() = 'authenticated');

-- Solo admin puede modificar configuración
CREATE POLICY "config_update" ON public.configuracion
  FOR UPDATE USING (is_admin());

-- ============================================================
-- PREMIOS
-- ============================================================
CREATE POLICY "premios_select" ON public.premios_especiales
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "premios_all_admin" ON public.premios_especiales
  FOR ALL USING (is_admin());
