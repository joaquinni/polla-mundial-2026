# 🏆 Polla Mundial 2026

Sistema multiusuario de predicciones para el FIFA World Cup 2026.

**Stack:** Next.js 14 · Supabase · Google Sheets API · Tailwind CSS

---

## 🚀 Setup en 10 pasos

### 1. Clonar e instalar
```bash
git clone <tu-repo>
cd polla-mundial
npm install
```

### 2. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) → New project
2. Copia la URL y las API keys

### 3. Variables de entorno
```bash
cp .env.example .env.local
# Edita .env.local con tus claves de Supabase
```

### 4. Ejecutar migraciones en Supabase
En el **SQL Editor** de Supabase, ejecuta en orden:
```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_functions.sql
```

### 5. Cargar partidos iniciales (seed)
En el SQL Editor:
```
supabase/seed.sql
```

### 6. Configurar Realtime en Supabase
- Dashboard → Database → Replication
- Habilitar realtime para la tabla `usuarios`

### 7. Deploying la Edge Function (cron de bloqueo)
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref TU_PROJECT_REF

# Deploy la función
supabase functions deploy bloqueo-automatico

# Crear el cron (en Dashboard → Edge Functions → Schedules)
# Schedule: "* * * * *" (cada minuto)
```

### 8. Crear el primer admin
Regístrate normalmente en la app, luego en Supabase SQL Editor:
```sql
UPDATE public.usuarios
SET rol = 'admin', pagado = true
WHERE email = 'tu@email.com';
```

### 9. Iniciar en desarrollo
```bash
npm run dev
# http://localhost:3000
```

### 10. Deploy en Vercel
```bash
# Conecta el repo en vercel.com
# Agrega las variables de entorno en el dashboard de Vercel
```

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── auth/login|register     → Páginas de autenticación
│   ├── dashboard/              → Dashboard principal
│   ├── predicciones/           → Lista y formulario de picks
│   ├── tabla/                  → Tabla de posiciones (realtime)
│   ├── bonus/                  → Predicciones pre-mundial
│   ├── reglamento/             → Reglas completas
│   └── admin/                  → Panel administrador
├── components/                 → Componentes reutilizables
├── lib/
│   ├── supabase/               → Clients (browser + server)
│   └── puntos/                 → Lógica de puntaje
├── constants/grupos.ts         → 48 equipos y grupos oficiales
└── types/index.ts              → Tipos TypeScript
```

---

## ⚽ Grupos Oficiales Mundial 2026
*(Sorteo 5 dic 2025 + Playoffs UEFA 31 mar 2026)*

| Grupo | Equipos |
|-------|---------|
| A | 🇲🇽 México · 🇿🇦 Sudáfrica · 🇰🇷 Corea del Sur · 🇨🇿 Rep. Checa |
| B | 🇨🇦 Canadá · 🇧🇦 Bosnia-Herzegovina · 🇶🇦 Qatar · 🇨🇭 Suiza |
| C | 🇧🇷 Brasil · 🇲🇦 Marruecos · 🇭🇹 Haití · 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia |
| D | 🇺🇸 Estados Unidos · 🇵🇾 Paraguay · 🇦🇺 Australia · 🇹🇷 Turquía |
| E | 🇩🇪 Alemania · 🇨🇼 Curazao · 🇨🇮 Costa de Marfil · 🇪🇨 Ecuador |
| F | 🇳🇱 Países Bajos · 🇯🇵 Japón · 🇸🇪 Suecia · 🇹🇳 Túnez |
| G | 🇧🇪 Bélgica · 🇪🇬 Egipto · 🇮🇷 Irán · 🇳🇿 Nueva Zelanda |
| H | 🇪🇸 España · 🇨🇻 Cabo Verde · 🇸🇦 Arabia Saudita · 🇺🇾 Uruguay |
| I | 🇫🇷 Francia · 🇸🇳 Senegal · 🇮🇶 Irak · 🇳🇴 Noruega |
| J | 🇦🇷 Argentina · 🇩🇿 Argelia · 🇦🇹 Austria · 🇯🇴 Jordania |
| K | 🇵🇹 Portugal · 🇨🇩 RD Congo · 🇺🇿 Uzbekistán · 🇨🇴 Colombia |
| L | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra · 🇭🇷 Croacia · 🇬🇭 Ghana · 🇵🇦 Panamá |

---

## 🔑 Roles

- **Admin:** gestiona partidos, ingresa resultados, calcula puntos, ve pagos
- **Participante:** registra predicciones, ve tabla, ve historial personal

---

*Generado con ❤️ para el Mundial 2026 · 11 jun – 19 jul 2026*
