'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface U { id:string; nombre:string; email:string; pagado:boolean; puntos_totales:number }

export default function AdminUsuariosClient({ usuarios:ini }:{ usuarios:U[] }) {
  const [lista, setLista] = useState(ini)
  const [carga, setCarga] = useState<string|null>(null)

  async function toggle(id:string, pagado:boolean) {
    setCarga(id)
    const sb = createClient()
    const { error } = await sb.from('usuarios').update({ pagado:!pagado }).eq('id',id)
    if (error) toast.error('Error')
    else {
      setLista(l => l.map(u => u.id===id ? {...u,pagado:!pagado} : u))
      toast.success(!pagado ? 'Pago confirmado' : 'Pago removido')
    }
    setCarga(null)
  }

  if (lista.length===0) return <p style={{color:'#888',textAlign:'center',padding:'40px'}}>Sin participantes</p>

  return (
    <div>
      {lista.map(u => (
        <div key={u.id} style={{background:'#12121A',border:'1px solid #22223A',borderRadius:'8px',padding:'14px 18px',marginBottom:'8px',display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
          <div style={{flex:1}}>
            <p style={{fontWeight:'bold',fontSize:'14px'}}>{u.nombre}</p>
            <p style={{color:'#888',fontSize:'12px'}}>{u.email}</p>
          </div>
          <p style={{fontSize:'20px',fontWeight:'bold',color:'#F5C518',minWidth:'50px',textAlign:'center'}}>{u.puntos_totales} pts</p>
          <button onClick={()=>toggle(u.id,u.pagado)} disabled={carga===u.id} style={{background:u.pagado?'rgba(46,204,113,0.2)':'rgba(200,16,46,0.2)',border:'1px solid '+(u.pagado?'#2ECC71':'#C8102E'),color:u.pagado?'#2ECC71':'#C8102E',padding:'8px 14px',borderRadius:'6px',cursor:'pointer',fontSize:'12px',fontWeight:'bold'}}>
            {carga===u.id?'...':u.pagado?'PAGADO':'SIN PAGO'}
          </button>
        </div>
      ))}
    </div>
  )
}