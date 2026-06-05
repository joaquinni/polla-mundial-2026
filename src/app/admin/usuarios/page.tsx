import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminUsuariosClient from './client'

export default async function AdminUsuariosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: usuario } = await supabase
    .from('usuarios').select('rol').eq('id', user.id).single()
  if (usuario?.rol !== 'admin') redirect('/dashboard')

  const { data: usuarios } = await supabase
    .from('usuarios')
    .select('*')
    .eq('rol', 'participante')
    .order('created_at', { ascending: true })

  const { data: config } = await supabase
    .from('configuracion').select('monto_entrada').single()

  const pagados = usuarios?.filter(u => u.pagado).length ?? 0
  const total = usuarios?.length ?? 0
  const pozo = pagados * (config?.monto_entrada ?? 20000)

  return (
    <div style={{minHeight:'100vh',background:'#0A0A0F',color:'white',padding:'32px 20px',fontFamily:'sans-serif'}}>
      <div style={{maxWidth:'900px',margin:'0 auto'}}>
        <Link href="/admin" style={{color:'#F5C518',fontSize:'13px'}}>← Admin</Link>
        <h1 style={{color:'#F5C518',fontSize:'26px',marginTop:'8px',marginBottom:'8px',letterSpacing:'2px'}}>
          USUARIOS ({total})
        </h1>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'24px'}}>
          {[
            {label:'Participantes',value:total},
            {label:'Han pagado',value:pagados},
            {label:'Pozo actual',value:`$${(pozo/1000).toFixed(0)}k CLP`},
          ].map(s => (
            <div key={s.label} style={{background:'#12121A',border:'1px solid #22223A',borderRadius:'8px',padding:'16px',textAlign:'center'}}>
              <p style={{fontSize:'24px',fontWeight:'bold',color:'#F5C518'}}>{s.value}</p>
              <p style={{fontSize:'11px',color:'#888',marginTop:'4px'}}>{s.label}</p>
            </div>
          ))}
        </div>
        <AdminUsuariosClient usuarios={usuarios ?? []} />
      </div>
    </div>
  )
}