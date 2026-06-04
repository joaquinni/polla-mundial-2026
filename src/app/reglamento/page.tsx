// src/app/reglamento/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect }     from 'next/navigation'
import Navbar from '@/components/shared/Navbar'

export default async function ReglamentoPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: usuario } = await supabase
    .from('usuarios').select('nombre,rol,puntos_totales,pagado').eq('id', user.id).single()
  const { data: config } = await supabase.from('configuracion').select('*').single()

  const participantes = 20 // estimado
  const pozo = (config?.monto_entrada ?? 25000) * participantes

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar usuario={usuario} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-6">

        <h1 className="section-title">📖 REGLAMENTO</h1>

        {[
          {
            title: '💰 Inscripción y premios',
            content: `Cada participante paga $${(config?.monto_entrada ?? 25000).toLocaleString('es-CL')} CLP para ingresar a la polla. El pozo se reparte entre los tres primeros lugares:
            • 1° lugar: ${config?.porcentaje_primero ?? 75}% del pozo
            • 2° lugar: ${config?.porcentaje_segundo ?? 15}% del pozo
            • 3° lugar: ${config?.porcentaje_tercero ?? 10}% del pozo`,
          },
          {
            title: '⚽ Puntaje — Fase de Grupos',
            content: `• Resultado exacto (marcador correcto): ${config?.pts_resultado_exacto ?? 3} puntos
• Aciertas ganador o empate, pero no el marcador exacto: ${config?.pts_acierto_simple ?? 1} punto
• Todo errado: 0 puntos

Ejemplo:
Resultado real: Chile 2–1 Argentina
→ Pones Chile 2–1 Argentina → 3 puntos ✅
→ Pones Chile 1–0 Argentina → 1 punto (acertaste ganador)
→ Pones Chile 1–1 Argentina → 0 puntos (fallaste)`,
          },
          {
            title: '⚔️ Puntaje — Eliminación Directa',
            content: `Si el partido se define en los 90 minutos reglamentarios:
• Resultado exacto: ${config?.pts_resultado_exacto ?? 3} puntos

Si el partido va a prórroga o penales:
• Solo importa acertar quién clasifica: ${config?.pts_clasificado ?? 1} punto
• Fallar: 0 puntos

⚠️ El marcador exacto SOLO se evalúa al minuto 90. Si hay prórroga, el marcador predicho ya no cuenta.`,
          },
          {
            title: '🎯 Bonus Pre-Mundial',
            content: `Antes del primer partido debes registrar:
• Campeón del mundo: +${config?.pts_bonus_campeon ?? 5} puntos si aciertas
• Subcampeón: +${config?.pts_bonus_subcampeon ?? 3} puntos si aciertas
• Goleador del torneo: +${config?.pts_bonus_goleador ?? 1} punto si aciertas

Estas predicciones se bloquean automáticamente cuando comienza el primer partido y no pueden modificarse.`,
          },
          {
            title: '🔒 Bloqueo Anti-Trampa',
            content: `Las predicciones de cada partido se bloquean automáticamente 1 hora antes del pitazo inicial.

• Antes del bloqueo: puedes ver y editar solo tu predicción
• Después del bloqueo: todas las predicciones del partido se vuelven visibles públicamente
• Si no predices antes del bloqueo: recibes automáticamente 0 puntos en ese partido
• No hay excepciones manuales, salvo fallas técnicas comprobadas del sistema`,
          },
          {
            title: '🏆 Sistema de Desempate',
            content: `En caso de empate en puntaje total se aplica este orden:
1. Mayor cantidad de resultados exactos acertados
2. Mayor cantidad de aciertos simples
3. Mayor cantidad de puntos en eliminación directa
4. Si persiste el empate: selección aleatoria entre los empatados`,
          },
        ].map(section => (
          <div key={section.title} className="card">
            <div className="card-header">
              <h2 className="font-display text-xl tracking-widest text-brand-gold">{section.title}</h2>
            </div>
            <div className="p-5">
              <p className="font-cond text-sm text-brand-muted leading-relaxed whitespace-pre-line tracking-wider">
                {section.content}
              </p>
            </div>
          </div>
        ))}

      </main>
    </div>
  )
}
