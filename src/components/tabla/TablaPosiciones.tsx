'use client'
// src/components/tabla/TablaPosiciones.tsx
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Fila {
  posicion: number; id: string; nombre: string; puntos_totales: number
  exactos_acertados: number; aciertos_simples: number; puntos_eliminacion: number
  errores: number; partidos_jugados: number; pagado: boolean
}

interface Props { tablaInicial: Fila[]; userId: string }

export default function TablaPosiciones({ tablaInicial, userId }: Props) {
  const [tabla, setTabla] = useState<Fila[]>(tablaInicial)
  const [flash, setFlash] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Realtime: escuchar cambios en usuarios (puntos actualizados)
    const channel = supabase
      .channel('tabla-realtime')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'usuarios',
      }, async () => {
        const { data } = await supabase.rpc('get_tabla_posiciones')
        if (data) {
          setTabla(data)
          setFlash('updated')
          setTimeout(() => setFlash(null), 1500)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const medals = ['🥇','🥈','🥉']

  return (
    <div className="card overflow-hidden">
      {flash && (
        <div className="bg-brand-gold/10 border-b border-brand-gold/30 px-5 py-2 font-cond text-xs text-brand-gold tracking-wider text-center animate-pulse">
          ⚡ Tabla actualizada en tiempo real
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-brand-dark3">
              <th className="px-4 py-3 text-left font-cond text-xs tracking-widest text-brand-muted uppercase">#</th>
              <th className="px-4 py-3 text-left font-cond text-xs tracking-widest text-brand-muted uppercase">Jugador</th>
              <th className="px-4 py-3 text-center font-cond text-xs tracking-widest text-brand-gold uppercase">Puntos</th>
              <th className="px-4 py-3 text-center font-cond text-xs tracking-widest text-brand-muted uppercase hidden sm:table-cell">⭐ Exactos</th>
              <th className="px-4 py-3 text-center font-cond text-xs tracking-widest text-brand-muted uppercase hidden md:table-cell">✓ Simples</th>
              <th className="px-4 py-3 text-center font-cond text-xs tracking-widest text-brand-muted uppercase hidden md:table-cell">✗ Errores</th>
              <th className="px-4 py-3 text-center font-cond text-xs tracking-widest text-brand-muted uppercase hidden lg:table-cell">Elim.</th>
              <th className="px-4 py-3 text-center font-cond text-xs tracking-widest text-brand-muted uppercase hidden sm:table-cell">Jugados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-dark4">
            {tabla.map((f, idx) => {
              const isMe = f.id === userId
              const isTop3 = f.posicion <= 3
              return (
                <tr key={f.id}
                  className={`transition-colors ${
                    isMe    ? 'bg-brand-gold/5 hover:bg-brand-gold/10' :
                    isTop3  ? 'hover:bg-brand-dark3' : 'hover:bg-brand-dark3'
                  }`}>
                  <td className="px-4 py-3">
                    <span className="font-cond text-sm">
                      {f.posicion <= 3 ? medals[f.posicion - 1] : `#${f.posicion}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-cond font-bold tracking-wider text-sm ${isMe ? 'text-brand-gold' : 'text-white'}`}>
                        {f.nombre}
                      </span>
                      {isMe && <span className="font-cond text-xs text-brand-muted">(tú)</span>}
                      {!f.pagado && (
                        <span className="font-cond text-xs text-yellow-500 border border-yellow-700/50 rounded px-1">
                          sin pago
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-display text-2xl ${isTop3 ? 'text-brand-gold' : 'text-white'}`}>
                      {f.puntos_totales}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className="font-cond text-sm text-brand-gold">{f.exactos_acertados}</span>
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <span className="font-cond text-sm text-blue-400">{f.aciertos_simples}</span>
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <span className="font-cond text-sm text-red-400">{f.errores}</span>
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <span className="font-cond text-sm text-purple-400">{f.puntos_eliminacion}</span>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className="font-cond text-sm text-brand-muted">{f.partidos_jugados}</span>
                  </td>
                </tr>
              )
            })}
            {tabla.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center font-cond text-brand-muted">
                El torneo aún no ha comenzado
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-brand-dark4 px-5 py-3">
        <p className="font-cond text-xs text-brand-muted tracking-wider">
          Desempate: 1° Exactos acertados · 2° Aciertos simples · 3° Puntos en eliminación directa
        </p>
      </div>
    </div>
  )
}
