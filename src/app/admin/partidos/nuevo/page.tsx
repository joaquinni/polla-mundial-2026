'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'

const FASES = ['grupos','ronda_32','octavos','cuartos','semifinal','tercer_puesto','final']
const EQUIPOS = [
  'Alemania','Arabia Saudita','Argentina','Australia','Austria','Argelia',
  'Bélgica','Bosnia-Herzegovina','Brasil','Cabo Verde','Canadá','Corea del Sur',
  'Colombia','Costa de Marfil','Croacia','Curazao','Ecuador','Egipto',
  'Escocia','España','Estados Unidos','Francia','Ghana','Haití',
  'Inglaterra','Irán','Irak','Japón','Jordania','Marruecos',
  'México','Nigeria','Noruega','Nueva Zelanda','Países Bajos','Panamá',
  'Paraguay','Portugal','Qatar','RD Congo','Rep. Checa','Senegal',
  'Sudáfrica','Suecia','Suiza','Túnez','Turquía','Uruguay','Uzbekistán'
].sort()

const BANDERAS: Record<string,string> = {
  'Alemania':'🇩🇪','Arabia Saudita':'🇸🇦','Argentina':'🇦🇷','Australia':'🇦🇺',
  'Austria':'🇦🇹','Argelia':'🇩🇿','Bélgica':'🇧🇪','Bosnia-Herzegovina':'🇧🇦',
  'Brasil':'🇧🇷','Cabo Verde':'🇨🇻','Canadá':'🇨🇦','Corea del Sur':'🇰🇷',
  'Colombia':'🇨🇴','Costa de Marfil':'🇨🇮','Croacia':'🇭🇷','Curazao':'🇨🇼',
  'Ecuador':'🇪🇨','Egipto':'🇪🇬','Escocia':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','España':'🇪🇸',
  'Estados Unidos':'🇺🇸','Francia':'🇫🇷','Ghana':'🇬🇭','Haití':'🇭🇹',
  'Inglaterra':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Irán':'🇮🇷','Irak':'🇮🇶','Japón':'🇯🇵',
  'Jordania':'🇯🇴','Marruecos':'🇲🇦','México':'🇲🇽','Noruega':'🇳🇴',
  'Nueva Zelanda':'🇳🇿','Países Bajos':'🇳🇱','Panamá':'🇵🇦','Paraguay':'🇵🇾',
  'Portugal':'🇵🇹','Qatar':'🇶🇦','RD Congo':'🇨🇩','Rep. Checa':'🇨🇿',
  'Senegal':'🇸🇳','Sudáfrica':'🇿🇦','Suecia':'🇸🇪','Suiza':'🇨🇭',
  'Túnez':'🇹🇳','Turquía':'🇹🇷','Uruguay':'🇺🇾','Uzbekistán':'🇺🇿',
}

export default function NuevoPartidoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fase: 'grupos', grupo: '', equipo_local: '',
    equipo_visita: '', fecha_hora_inicio: '', sede: ''
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.equipo_local || !form.equipo_visita || !form.fecha_hora_inicio) {
      toast.error('Completa todos los campos obligatorios')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('partidos').insert({
      fase: form.fase,
      grupo: form.grupo || null,
      equipo_local: form.equipo_local,
      equipo_visita: form.equipo_visita,
      bandera_local: BANDERAS[form.equipo_local] || '',
      bandera_visita: BANDERAS[form.equipo_visita] || '',
      fecha_hora_inicio: new Date(form.fecha_hora_inicio).toISOString(),
      sede: form.sede || null,
    })
    setLoading(false)
    if (error) { toast.error('Error: ' + error.message); return }
    toast.success('Partido creado!')
    router.push('/admin')
  }

  const s = { width:'100%', background:'#1A1A28', border:'1px solid #22223A', color:'white', padding:'10px', borderRadius:'6px' }

  return (
    <div style={{minHeight:'100vh',background:'#0A0A0F',color:'white',padding:'40px 20px',fontFamily:'sans-serif'}}>
      <div style={{maxWidth:'600px',margin:'0 auto'}}>
        <Link href="/admin" style={{color:'#F5C518',fontSize:'14px'}}>← Volver</Link>
        <h1 style={{color:'#F5C518',fontSize:'26px',margin:'16px 0 24px',letterSpacing:'2px'}}>CREAR PARTIDO</h1>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <div>
            <label style={{display:'block',color:'#888',fontSize:'12px',marginBottom:'6px'}}>FASE</label>
            <select value={form.fase} onChange={set('fase')} style={s}>
              {FASES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          {form.fase === 'grupos' && (
            <div>
              <label style={{display:'block',color:'#888',fontSize:'12px',marginBottom:'6px'}}>GRUPO</label>
              <select value={form.grupo} onChange={set('grupo')} style={s}>
                <option value="">Selecciona...</option>
                {['A','B','C','D','E','F','G','H','I','J','K','L'].map(g => (
                  <option key={g} value={g}>Grupo {g}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label style={{display:'block',color:'#888',fontSize:'12px',marginBottom:'6px'}}>EQUIPO LOCAL *</label>
            <select value={form.equipo_local} onChange={set('equipo_local')} required style={s}>
              <option value="">Selecciona...</option>
              {EQUIPOS.map(e => <option key={e} value={e}>{BANDERAS[e]} {e}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:'block',color:'#888',fontSize:'12px',marginBottom:'6px'}}>EQUIPO VISITA *</label>
            <select value={form.equipo_visita} onChange={set('equipo_visita')} required style={s}>
              <option value="">Selecciona...</option>
              {EQUIPOS.map(e => <option key={e} value={e}>{BANDERAS[e]} {e}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:'block',color:'#888',fontSize:'12px',marginBottom:'6px'}}>FECHA Y HORA *</label>
            <input type="datetime-local" value={form.fecha_hora_inicio} onChange={set('fecha_hora_inicio')} required style={s} />
          </div>
          <div>
            <label style={{display:'block',color:'#888',fontSize:'12px',marginBottom:'6px'}}>SEDE</label>
            <input type="text" value={form.sede} onChange={set('sede')} placeholder="Ej: Miami" style={s} />
          </div>
          <button type="submit" disabled={loading} style={{background:'#F5C518',color:'#0A0A0F',border:'none',padding:'12px',borderRadius:'6px',fontWeight:'bold',fontSize:'14px',cursor:'pointer',letterSpacing:'2px',marginTop:'8px'}}>
            {loading ? 'CREANDO...' : 'CREAR PARTIDO'}
          </button>
        </form>
      </div>
    </div>
  )
}

