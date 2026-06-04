// src/app/auth/login/page.tsx
import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Header decorativo */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-4 drop-shadow-[0_0_20px_rgba(245,197,24,0.5)]">🏆</div>
        <h1 className="font-display text-5xl tracking-widest text-brand-gold">
          POLLA MUNDIAL
        </h1>
        <p className="font-cond text-sm tracking-[0.3em] text-brand-muted mt-1 uppercase">
          FIFA World Cup 2026
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h2 className="font-display text-2xl tracking-widest text-white mb-6">
            INICIAR SESIÓN
          </h2>
          <LoginForm />
          <p className="mt-6 text-center font-cond text-sm text-brand-muted">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register"
              className="text-brand-gold hover:text-brand-gold-d transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
