'use client'
// src/components/auth/RegisterForm.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirm: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    if (form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: { nombre: form.nombre.trim() },
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('¡Cuenta creada! Revisa tu email para confirmar.')
    router.push('/auth/login')
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Nombre completo</label>
        <input type="text" required className="input" placeholder="Juan Pérez"
          value={form.nombre} onChange={set('nombre')} />
      </div>
      <div>
        <label className="label">Email</label>
        <input type="email" required className="input" placeholder="tu@email.com"
          value={form.email} onChange={set('email')} />
      </div>
      <div>
        <label className="label">Contraseña</label>
        <input type="password" required className="input" placeholder="Mín. 6 caracteres"
          value={form.password} onChange={set('password')} />
      </div>
      <div>
        <label className="label">Confirmar contraseña</label>
        <input type="password" required className="input" placeholder="Repite tu contraseña"
          value={form.confirm} onChange={set('confirm')} />
      </div>

      <div className="bg-brand-dark3 border border-brand-dark4 rounded-md p-3 mt-2">
        <p className="font-cond text-xs text-brand-muted">
          ⚠️ Tu cuenta quedará <span className="text-yellow-400">pendiente de pago</span>.
          El admin habilitará tu participación una vez confirmado el pago de{' '}
          <span className="text-brand-gold font-bold">$25.000 CLP</span>.
        </p>
      </div>

      <button type="submit" disabled={loading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  )
}
