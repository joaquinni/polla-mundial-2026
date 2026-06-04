// src/constants/grupos.ts
// Grupos oficiales — Sorteo FIFA 5 dic 2025 + Playoffs UEFA 31 mar 2026

export interface Equipo {
  nombre: string
  bandera: string
  confederacion: 'CONMEBOL' | 'UEFA' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC'
}

export interface Grupo {
  letra: string
  equipos: Equipo[]
}

export const GRUPOS: Grupo[] = [
  {
    letra: 'A',
    equipos: [
      { nombre: 'México',            bandera: '🇲🇽', confederacion: 'CONCACAF' },
      { nombre: 'Sudáfrica',         bandera: '🇿🇦', confederacion: 'CAF'      },
      { nombre: 'Corea del Sur',     bandera: '🇰🇷', confederacion: 'AFC'      },
      { nombre: 'República Checa',   bandera: '🇨🇿', confederacion: 'UEFA'     }, // Playoff D
    ],
  },
  {
    letra: 'B',
    equipos: [
      { nombre: 'Canadá',            bandera: '🇨🇦', confederacion: 'CONCACAF' },
      { nombre: 'Bosnia-Herzegovina',bandera: '🇧🇦', confederacion: 'UEFA'     }, // Playoff A
      { nombre: 'Qatar',             bandera: '🇶🇦', confederacion: 'AFC'      },
      { nombre: 'Suiza',             bandera: '🇨🇭', confederacion: 'UEFA'     },
    ],
  },
  {
    letra: 'C',
    equipos: [
      { nombre: 'Brasil',            bandera: '🇧🇷', confederacion: 'CONMEBOL' },
      { nombre: 'Marruecos',         bandera: '🇲🇦', confederacion: 'CAF'      },
      { nombre: 'Haití',             bandera: '🇭🇹', confederacion: 'CONCACAF' },
      { nombre: 'Escocia',           bandera: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', confederacion: 'UEFA'     },
    ],
  },
  {
    letra: 'D',
    equipos: [
      { nombre: 'Estados Unidos',    bandera: '🇺🇸', confederacion: 'CONCACAF' },
      { nombre: 'Paraguay',          bandera: '🇵🇾', confederacion: 'CONMEBOL' },
      { nombre: 'Australia',         bandera: '🇦🇺', confederacion: 'AFC'      },
      { nombre: 'Turquía',           bandera: '🇹🇷', confederacion: 'UEFA'     }, // Playoff C
    ],
  },
  {
    letra: 'E',
    equipos: [
      { nombre: 'Alemania',          bandera: '🇩🇪', confederacion: 'UEFA'     },
      { nombre: 'Curazao',           bandera: '🇨🇼', confederacion: 'CONCACAF' },
      { nombre: 'Costa de Marfil',   bandera: '🇨🇮', confederacion: 'CAF'      },
      { nombre: 'Ecuador',           bandera: '🇪🇨', confederacion: 'CONMEBOL' },
    ],
  },
  {
    letra: 'F',
    equipos: [
      { nombre: 'Países Bajos',      bandera: '🇳🇱', confederacion: 'UEFA'     },
      { nombre: 'Japón',             bandera: '🇯🇵', confederacion: 'AFC'      },
      { nombre: 'Suecia',            bandera: '🇸🇪', confederacion: 'UEFA'     }, // Playoff B
      { nombre: 'Túnez',             bandera: '🇹🇳', confederacion: 'CAF'      },
    ],
  },
  {
    letra: 'G',
    equipos: [
      { nombre: 'Bélgica',           bandera: '🇧🇪', confederacion: 'UEFA'     },
      { nombre: 'Egipto',            bandera: '🇪🇬', confederacion: 'CAF'      },
      { nombre: 'Irán',              bandera: '🇮🇷', confederacion: 'AFC'      },
      { nombre: 'Nueva Zelanda',     bandera: '🇳🇿', confederacion: 'OFC'      },
    ],
  },
  {
    letra: 'H',
    equipos: [
      { nombre: 'España',            bandera: '🇪🇸', confederacion: 'UEFA'     },
      { nombre: 'Cabo Verde',        bandera: '🇨🇻', confederacion: 'CAF'      },
      { nombre: 'Arabia Saudita',    bandera: '🇸🇦', confederacion: 'AFC'      },
      { nombre: 'Uruguay',           bandera: '🇺🇾', confederacion: 'CONMEBOL' },
    ],
  },
  {
    letra: 'I',
    equipos: [
      { nombre: 'Francia',           bandera: '🇫🇷', confederacion: 'UEFA'     },
      { nombre: 'Senegal',           bandera: '🇸🇳', confederacion: 'CAF'      },
      { nombre: 'Irak',              bandera: '🇮🇶', confederacion: 'AFC'      },
      { nombre: 'Noruega',           bandera: '🇳🇴', confederacion: 'UEFA'     },
    ],
  },
  {
    letra: 'J',
    equipos: [
      { nombre: 'Argentina',         bandera: '🇦🇷', confederacion: 'CONMEBOL' },
      { nombre: 'Argelia',           bandera: '🇩🇿', confederacion: 'CAF'      },
      { nombre: 'Austria',           bandera: '🇦🇹', confederacion: 'UEFA'     },
      { nombre: 'Jordania',          bandera: '🇯🇴', confederacion: 'AFC'      },
    ],
  },
  {
    letra: 'K',
    equipos: [
      { nombre: 'Portugal',          bandera: '🇵🇹', confederacion: 'UEFA'     },
      { nombre: 'RD Congo',          bandera: '🇨🇩', confederacion: 'CAF'      },
      { nombre: 'Uzbekistán',        bandera: '🇺🇿', confederacion: 'AFC'      },
      { nombre: 'Colombia',          bandera: '🇨🇴', confederacion: 'CONMEBOL' },
    ],
  },
  {
    letra: 'L',
    equipos: [
      { nombre: 'Inglaterra',        bandera: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederacion: 'UEFA'     },
      { nombre: 'Croacia',           bandera: '🇭🇷', confederacion: 'UEFA'     },
      { nombre: 'Ghana',             bandera: '🇬🇭', confederacion: 'CAF'      },
      { nombre: 'Panamá',            bandera: '🇵🇦', confederacion: 'CONCACAF' },
    ],
  },
]

export const TODOS_LOS_EQUIPOS = GRUPOS.flatMap(g => g.equipos)
export const NOMBRES_EQUIPOS   = TODOS_LOS_EQUIPOS.map(e => e.nombre).sort()

export const FASES_LABEL: Record<string, string> = {
  grupos:        'Fase de Grupos',
  ronda_32:      'Ronda de 32',
  octavos:       'Octavos de Final',
  cuartos:       'Cuartos de Final',
  semifinal:     'Semifinales',
  tercer_puesto: 'Tercer Puesto',
  final:         'Gran Final',
}

export const ESTADO_LABEL: Record<string, string> = {
  pendiente:          'Abierto',
  bloqueado:          'Bloqueado',
  en_juego:           'En juego',
  finalizado_90:      'Finalizado',
  finalizado_extra:   'Finalizado (ET)',
  finalizado_penales: 'Finalizado (Pen.)',
}
