import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function AdminPartidosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: usuario } = await supabase
    .from('usuarios').select('rol').eq('id', user.id).single()
  if (usuario?.rol !== 'admin') redirect('/dashboard')

  const { data: partidos } = await supabase
    .from('partidos')
    .select('*')
    .order('fecha_hora_inicio', { ascending: true })

  const faseLabel: Record<string, string> = {
    grupos: 'Grupos', ronda_32: 'Ronda 32', octavos: 'Octavos',
    cuartos: 'Cuartos', semifinal: 'Semis', tercer_puesto: '3er Puesto', final: 'Final'
  }

  const estadoColor: Record<string, string> = {
    pendiente: '#2ECC71', bloqueado: '#F5C518', en_juego: '#3B82F6',
    finalizado_90: '#888', finalizado_extra: '#888', finalizado_penales: '#888'
  }

  return (
    <div style={{minHeight:'100vh',background:'#0A0A0F',color:'white',padding:'32px 20px',fontFamily:'sans-serif'}}>
      <div style={{maxWidth:'900px',margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px',flexWrap:'wrap',gap:'12px'}}>
          <div>
            <Link href="/admin" style={{color:'#F5C518',fontSize:'13px'}}>← Admin</Link>
            <h1 style={{color:'#F5C518',fontSize:'26px',marginTop:'8px',letterSpacing:'2px'}}>
              PARTIDOS ({partidos?.length ?? 0})
            </h1>
          </div>
          <Link href="/admin/partidos/nuevo" style={{background:'#F5C518',color:'#0A0A0F',padding:'10px 20px',borderRadius:'6px',fontWeight:'bold',fontSize:'13px',textDecoration:'none',letterSpacing:'1px'}}>
            + CREAR PARTIDO
          </Link>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {partidos?.map((p: any) => (
            <Link key={p.id} href={`/admin/partidos/${p.id}`}
              style={{display:'flex',alignItems:'center',gap:'12px',background:'#12121A',border:'1px solid #22223A',borderRadius:'8px',padding:'14px 18px',textDecoration:'none',color:'white'}}>
              <div style={{flex:1}}>
                <p style={{fontWeight:'bold',fontSize:'14px',marginBottom:'4px'}}>
                  {p.bandera_local} {p.equipo_local} vs {p.equipo_visita} {p.bandera_visita}
                </p>
                <p style={{color:'#888',fontSize:'12px'}}>
                  {format(new Date(p.fecha_hora_inicio), "d MMM · HH:mm", { locale: es })}h
                  {p.grupo && <span style={{color:'#F5C518',marginLeft:'8px'}}>Grupo {p.grupo}</span>}
                  {p.sede && <span style={{marginLeft:'8px'}}>· {p.sede}</span>}
                </p>
              </div>
              <div style={{textAlign:'center',minWidth:'80px'}}>
                <span style={{fontSize:'11px',color:'#888',display:'block',marginBottom:'2px'}}>{faseLabel[p.fase] ?? p.fase}</span>
                <span style={{fontSize:'11px',color: estadoColor[p.estado] ?? '#888'}}>{p.estado}</span>
              </div>
              {p.goles_local_90 !== null && (
                <div style={{textAlign:'center',minWidth:'60px'}}>
                  <p style={{fontSize:'11px',color:'#888',marginBottom:'2px'}}>Resultado</p>
                  <p style={{fontFamily:'monospace',fontSize:'18px',color:'#F5C518',fontWeight:'bold'}}>
                    {p.goles_local_90}–{p.goles_visita_90}
                  </p>
                </div>
              )}
              <span style={{color:'#444',fontSize:'18px'}}>›</span>
            </Link>
          ))}
          {!partidos?.length && (
            <p style={{color:'#888',textAlign:'center',padding:'40px'}}>No hay partidos registrados</p>
          )}
        </div>
      </div>
    </div>
  )
}

