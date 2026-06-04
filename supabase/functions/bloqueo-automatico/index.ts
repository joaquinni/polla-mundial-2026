// supabase/functions/bloqueo-automatico/index.ts
// Cron job que corre cada minuto y bloquea partidos automáticamente 1h antes

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (_req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const ahora = new Date().toISOString()

  // Buscar partidos cuyo fecha_bloqueo ya pasó pero aún están en estado 'pendiente'
  const { data: partidos, error } = await supabase
    .from('partidos')
    .select('id, equipo_local, equipo_visita, fecha_bloqueo')
    .eq('estado', 'pendiente')
    .lte('fecha_bloqueo', ahora)

  if (error) {
    console.error('Error buscando partidos:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const resultados = []

  for (const partido of partidos ?? []) {
    const { error: errBloqueo } = await supabase
      .rpc('bloquear_predicciones_partido', { p_id_partido: partido.id })

    if (errBloqueo) {
      console.error(`Error bloqueando ${partido.id}:`, errBloqueo)
      resultados.push({ id: partido.id, ok: false, error: errBloqueo.message })
    } else {
      console.log(`✅ Bloqueado: ${partido.equipo_local} vs ${partido.equipo_visita}`)
      resultados.push({ id: partido.id, ok: true })
    }
  }

  return new Response(
    JSON.stringify({ procesados: partidos?.length ?? 0, resultados }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
