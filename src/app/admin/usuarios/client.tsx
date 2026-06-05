'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Usuario {
  id: string; nombre: string; email: string; pagado: boolean
  puntos_totales: number; exactos_acertados: number; partidos_jugados: number
}

export default function AdminUsuariosClient({ usuarios: initial }: { usuarios: Usuario[] }) {
  const [usuarios, setUsuarios] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)

  async function togglePago(id: string, pagado: boolean) {
    setLoading(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('usuarios').update({ pagado: !pagado }).eq('id', id)
    if (error) { toast.error('Error: ' + error.message) }
    else {
      setUsuarios(us => us.map(u => u.id === id ? { ...u, pagado: !pagado } : u))
      toast.success(!pagado ? '✅ Pago confirmado' : 'Pago removido')
    }
    setLoading(null)
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
      {usuarios.map(u => (
        <div key={u.id} style={{background:'#12121A',border:`1px solid ${u.pagado?'rgba(46,204,113,0.4)':'#22223A'}`,borderRadius:'8px',padding:'14px 18px',display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:'200px'}}>
            <p style={{fontWeight:'bold',fontSize:'14px',color:u.pagado?'white':'#aaa'}}>{u.nombre}</p>
            <p style={{color:'#888',fontSize:'12px',marginTop:'2px'}}>{u.email}</p>
          </div>
          <div style={{textAlign:'center',minWidth:'60px'}}>
            <p style={{fontSize:'20px',fontWeight:'bold',color:'#F5C518'}}>{u.puntos_totales}</p>
            <p style={{fontSize:'10px',color:'#888'}}>pts</p>
          </div>
          <div style={{textAlign:'center',minWidth:'60px'}}>
            <p style={{fontSize:'16px',color:'white'}}>{u.exactos_acertados}</p>
            <p style={{fontSize:'10px',color:'#888'}}>exactos</p>
          </div>
          <button onClick={() => togglePago(u.id, u.pagado)} disabled={loading===u.id}
            style={{background:u.pagado?'rgba(46,204,113,0.2)':'rgba(200,16,46,0.2)',border:`1px solid ${u.pagado?'#2ECC71':'#C8102E'}`,color:u.pagado?'#2ECC71':'#C8102E',padding:'8px 14px',borderRadius:'6px',cursor:'pointer',fontSize:'12px',fontWeight:'bold',