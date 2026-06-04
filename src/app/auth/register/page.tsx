// src/app/auth/register/page.tsx
import RegisterForm from '@/components/auth/RegisterForm'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4 drop-shadow-[0_0_20px_rgba(245,197,24,0.5)]">🏆</div>
        <h1 className="font-display text-5xl tracking-widest text-brand-gold">POLLA MUNDIAL</h1>
        <p className="font-cond text-sm tracking-[0.3em] text-brand-muted mt-1 uppercase">
          FIFA World Cup 2026
        </p>
      </div>
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h2 className="font-display text-2xl tracking-widest text-white mb-2">CREAR CUENTA</h2>
          <p className="font-cond text-sm text-brand-muted mb-6">
            Cuota de inscripción: <span className="text-brand-gold font-bold">$25.000 CLP</span>
            {' '}(coordinar pago con el admin)
          </p>
          <RegisterForm />
          <p className="mt-6 text-center font-cond text-sm text-brand-muted">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-brand-gold hover:text-brand-gold-d transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
