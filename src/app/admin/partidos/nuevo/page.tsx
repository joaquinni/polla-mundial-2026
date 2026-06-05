'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { GRUPOS } from '@/constants/grupos'
import Link from 'next/link'

const FASES = ['grupos','ronda_32','octavos','cuartos','semifinal','tercer_puesto','final']
const TODOS_EQUIPOS = Object.values(GRUPOS).flatMap(g => g.equipos.map(e => e.nombre)).sort()

export default function NuevoPartidoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fase: 'grupos', grupo: '', equipo_local: '', equipo_visita: '',
    bandera_local: '', bandera_visita: '', fecha_hora_inicio: '', sede: ''
  })

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))

  function getBandera(nombre: string) {
    for (const g of Object.values(GRUPOS)) {
      const eq = g.equipos.find((e: any) => e.nombre === nombre)
      if (eq) return (eq as any).bandera
    }
    return ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.equipo_local || !form.equipo_visita || !form.fecha_hora_inicio) {
      toast.error('Completa todos los campo