-- ============================================================
-- SEED — Partidos Fase de Grupos Mundial 2026
-- Fechas oficiales FIFA (11 jun – 2 jul 2026)
-- Todas las horas en UTC (Chile = UTC-4 / UTC-3 en verano)
-- ============================================================

-- GRUPO A: México · Sudáfrica · Corea del Sur · Rep. Checa
INSERT INTO public.partidos (fase, grupo, equipo_local, bandera_local, equipo_visita, bandera_visita, fecha_hora_inicio, sede) VALUES
  ('grupos','A','México','🇲🇽','Sudáfrica','🇿🇦','2026-06-11 23:00:00+00','Ciudad de México'),
  ('grupos','A','Corea del Sur','🇰🇷','República Checa','🇨🇿','2026-06-12 02:00:00+00','Dallas'),
  ('grupos','A','México','🇲🇽','Corea del Sur','🇰🇷','2026-06-16 23:00:00+00','Ciudad de México'),
  ('grupos','A','Rep. Checa','🇨🇿','Sudáfrica','🇿🇦','2026-06-17 02:00:00+00','Dallas'),
  ('grupos','A','México','🇲🇽','República Checa','🇨🇿','2026-06-21 23:00:00+00','Ciudad de México'),
  ('grupos','A','Sudáfrica','🇿🇦','Corea del Sur','🇰🇷','2026-06-21 23:00:00+00','Dallas');

-- GRUPO B: Canadá · Bosnia-Herzegovina · Qatar · Suiza
INSERT INTO public.partidos (fase, grupo, equipo_local, bandera_local, equipo_visita, bandera_visita, fecha_hora_inicio, sede) VALUES
  ('grupos','B','Canadá','🇨🇦','Bosnia-Herzegovina','🇧🇦','2026-06-12 23:00:00+00','Toronto'),
  ('grupos','B','Qatar','🇶🇦','Suiza','🇨🇭','2026-06-13 02:00:00+00','Vancouver'),
  ('grupos','B','Canadá','🇨🇦','Qatar','🇶🇦','2026-06-17 23:00:00+00','Toronto'),
  ('grupos','B','Suiza','🇨🇭','Bosnia-Herzegovina','🇧🇦','2026-06-18 02:00:00+00','Vancouver'),
  ('grupos','B','Canadá','🇨🇦','Suiza','🇨🇭','2026-06-22 22:00:00+00','Toronto'),
  ('grupos','B','Bosnia-Herzegovina','🇧🇦','Qatar','🇶🇦','2026-06-22 22:00:00+00','Vancouver');

-- GRUPO C: Brasil · Marruecos · Haití · Escocia
INSERT INTO public.partidos (fase, grupo, equipo_local, bandera_local, equipo_visita, bandera_visita, fecha_hora_inicio, sede) VALUES
  ('grupos','C','Brasil','🇧🇷','Haití','🇭🇹','2026-06-13 23:00:00+00','Miami'),
  ('grupos','C','Marruecos','🇲🇦','Escocia','🏴󠁧󠁢󠁳󠁣󠁴󠁿','2026-06-14 02:00:00+00','Atlanta'),
  ('grupos','C','Brasil','🇧🇷','Marruecos','🇲🇦','2026-06-18 23:00:00+00','Miami'),
  ('grupos','C','Escocia','🏴󠁧󠁢󠁳󠁣󠁴󠁿','Haití','🇭🇹','2026-06-19 02:00:00+00','Atlanta'),
  ('grupos','C','Brasil','🇧🇷','Escocia','🏴󠁧󠁢󠁳󠁣󠁴󠁿','2026-06-23 22:00:00+00','Miami'),
  ('grupos','C','Haití','🇭🇹','Marruecos','🇲🇦','2026-06-23 22:00:00+00','Atlanta');

-- GRUPO D: Estados Unidos · Paraguay · Australia · Turquía
INSERT INTO public.partidos (fase, grupo, equipo_local, bandera_local, equipo_visita, bandera_visita, fecha_hora_inicio, sede) VALUES
  ('grupos','D','Estados Unidos','🇺🇸','Paraguay','🇵🇾','2026-06-14 23:00:00+00','Nueva York'),
  ('grupos','D','Australia','🇦🇺','Turquía','🇹🇷','2026-06-15 02:00:00+00','Los Ángeles'),
  ('grupos','D','Estados Unidos','🇺🇸','Australia','🇦🇺','2026-06-19 23:00:00+00','Nueva York'),
  ('grupos','D','Turquía','🇹🇷','Paraguay','🇵🇾','2026-06-20 02:00:00+00','Los Ángeles'),
  ('grupos','D','Estados Unidos','🇺🇸','Turquía','🇹🇷','2026-06-24 22:00:00+00','Nueva York'),
  ('grupos','D','Paraguay','🇵🇾','Australia','🇦🇺','2026-06-24 22:00:00+00','Los Ángeles');

-- GRUPO E: Alemania · Curazao · Costa de Marfil · Ecuador
INSERT INTO public.partidos (fase, grupo, equipo_local, bandera_local, equipo_visita, bandera_visita, fecha_hora_inicio, sede) VALUES
  ('grupos','E','Alemania','🇩🇪','Curazao','🇨🇼','2026-06-15 23:00:00+00','Filadelfia'),
  ('grupos','E','Costa de Marfil','🇨🇮','Ecuador','🇪🇨','2026-06-16 02:00:00+00','San Francisco'),
  ('grupos','E','Alemania','🇩🇪','Costa de Marfil','🇨🇮','2026-06-20 23:00:00+00','Filadelfia'),
  ('grupos','E','Ecuador','🇪🇨','Curazao','🇨🇼','2026-06-21 02:00:00+00','San Francisco'),
  ('grupos','E','Alemania','🇩🇪','Ecuador','🇪🇨','2026-06-25 22:00:00+00','Filadelfia'),
  ('grupos','E','Curazao','🇨🇼','Costa de Marfil','🇨🇮','2026-06-25 22:00:00+00','San Francisco');

-- GRUPO F: Países Bajos · Japón · Suecia · Túnez
INSERT INTO public.partidos (fase, grupo, equipo_local, bandera_local, equipo_visita, bandera_visita, fecha_hora_inicio, sede) VALUES
  ('grupos','F','Países Bajos','🇳🇱','Túnez','🇹🇳','2026-06-15 19:00:00+00','Houston'),
  ('grupos','F','Japón','🇯🇵','Suecia','🇸🇪','2026-06-16 19:00:00+00','Seattle'),
  ('grupos','F','Países Bajos','🇳🇱','Japón','🇯🇵','2026-06-20 19:00:00+00','Houston'),
  ('grupos','F','Suecia','🇸🇪','Túnez','🇹🇳','2026-06-21 19:00:00+00','Seattle'),
  ('grupos','F','Países Bajos','🇳🇱','Suecia','🇸🇪','2026-06-25 19:00:00+00','Houston'),
  ('grupos','F','Túnez','🇹🇳','Japón','🇯🇵','2026-06-25 19:00:00+00','Seattle');

-- GRUPO G: Bélgica · Egipto · Irán · Nueva Zelanda
INSERT INTO public.partidos (fase, grupo, equipo_local, bandera_local, equipo_visita, bandera_visita, fecha_hora_inicio, sede) VALUES
  ('grupos','G','Bélgica','🇧🇪','Nueva Zelanda','🇳🇿','2026-06-16 19:00:00+00','Kansas City'),
  ('grupos','G','Irán','🇮🇷','Egipto','🇪🇬','2026-06-17 19:00:00+00','Boston'),
  ('grupos','G','Bélgica','🇧🇪','Irán','🇮🇷','2026-06-21 19:00:00+00','Kansas City'),
  ('grupos','G','Egipto','🇪🇬','Nueva Zelanda','🇳🇿','2026-06-22 19:00:00+00','Boston'),
  ('grupos','G','Bélgica','🇧🇪','Egipto','🇪🇬','2026-06-26 19:00:00+00','Kansas City'),
  ('grupos','G','Nueva Zelanda','🇳🇿','Irán','🇮🇷','2026-06-26 19:00:00+00','Boston');

-- GRUPO H: España · Cabo Verde · Arabia Saudita · Uruguay
INSERT INTO public.partidos (fase, grupo, equipo_local, bandera_local, equipo_visita, bandera_visita, fecha_hora_inicio, sede) VALUES
  ('grupos','H','España','🇪🇸','Uruguay','🇺🇾','2026-06-17 19:00:00+00','Miami'),
  ('grupos','H','Arabia Saudita','🇸🇦','Cabo Verde','🇨🇻','2026-06-18 19:00:00+00','Nueva York'),
  ('grupos','H','España','🇪🇸','Arabia Saudita','🇸🇦','2026-06-22 23:00:00+00','Miami'),
  ('grupos','H','Uruguay','🇺🇾','Cabo Verde','🇨🇻','2026-06-23 02:00:00+00','Nueva York'),
  ('grupos','H','España','🇪🇸','Cabo Verde','🇨🇻','2026-06-27 22:00:00+00','Miami'),
  ('grupos','H','Uruguay','🇺🇾','Arabia Saudita','🇸🇦','2026-06-27 22:00:00+00','Nueva York');

-- GRUPO I: Francia · Senegal · Irak · Noruega
INSERT INTO public.partidos (fase, grupo, equipo_local, bandera_local, equipo_visita, bandera_visita, fecha_hora_inicio, sede) VALUES
  ('grupos','I','Francia','🇫🇷','Noruega','🇳🇴','2026-06-18 19:00:00+00','Los Ángeles'),
  ('grupos','I','Senegal','🇸🇳','Irak','🇮🇶','2026-06-19 19:00:00+00','Atlanta'),
  ('grupos','I','Francia','🇫🇷','Senegal','🇸🇳','2026-06-23 23:00:00+00','Los Ángeles'),
  ('grupos','I','Noruega','🇳🇴','Irak','🇮🇶','2026-06-24 02:00:00+00','Atlanta'),
  ('grupos','I','Francia','🇫🇷','Irak','🇮🇶','2026-06-28 22:00:00+00','Los Ángeles'),
  ('grupos','I','Noruega','🇳🇴','Senegal','🇸🇳','2026-06-28 22:00:00+00','Atlanta');

-- GRUPO J: Argentina · Argelia · Austria · Jordania
INSERT INTO public.partidos (fase, grupo, equipo_local, bandera_local, equipo_visita, bandera_visita, fecha_hora_inicio, sede) VALUES
  ('grupos','J','Argentina','🇦🇷','Argelia','🇩🇿','2026-06-19 23:00:00+00','Dallas'),
  ('grupos','J','Austria','🇦🇹','Jordania','🇯🇴','2026-06-20 02:00:00+00','San Francisco'),
  ('grupos','J','Argentina','🇦🇷','Austria','🇦🇹','2026-06-24 23:00:00+00','Dallas'),
  ('grupos','J','Jordania','🇯🇴','Argelia','🇩🇿','2026-06-25 02:00:00+00','San Francisco'),
  ('grupos','J','Argentina','🇦🇷','Jordania','🇯🇴','2026-06-29 22:00:00+00','Dallas'),
  ('grupos','J','Argelia','🇩🇿','Austria','🇦🇹','2026-06-29 22:00:00+00','San Francisco');

-- GRUPO K: Portugal · RD Congo · Uzbekistán · Colombia
INSERT INTO public.partidos (fase, grupo, equipo_local, bandera_local, equipo_visita, bandera_visita, fecha_hora_inicio, sede) VALUES
  ('grupos','K','Portugal','🇵🇹','Uzbekistán','🇺🇿','2026-06-20 19:00:00+00','Seattle'),
  ('grupos','K','Colombia','🇨🇴','RD Congo','🇨🇩','2026-06-21 19:00:00+00','Houston'),
  ('grupos','K','Portugal','🇵🇹','Colombia','🇨🇴','2026-06-25 23:00:00+00','Seattle'),
  ('grupos','K','RD Congo','🇨🇩','Uzbekistán','🇺🇿','2026-06-26 02:00:00+00','Houston'),
  ('grupos','K','Portugal','🇵🇹','RD Congo','🇨🇩','2026-06-30 22:00:00+00','Seattle'),
  ('grupos','K','Uzbekistán','🇺🇿','Colombia','🇨🇴','2026-06-30 22:00:00+00','Houston');

-- GRUPO L: Inglaterra · Croacia · Ghana · Panamá
INSERT INTO public.partidos (fase, grupo, equipo_local, bandera_local, equipo_visita, bandera_visita, fecha_hora_inicio, sede) VALUES
  ('grupos','L','Inglaterra','🏴󠁧󠁢󠁥󠁮󠁧󠁿','Panamá','🇵🇦','2026-06-21 23:00:00+00','Boston'),
  ('grupos','L','Croacia','🇭🇷','Ghana','🇬🇭','2026-06-22 02:00:00+00','Kansas City'),
  ('grupos','L','Inglaterra','🏴󠁧󠁢󠁥󠁮󠁧󠁿','Croacia','🇭🇷','2026-06-26 23:00:00+00','Boston'),
  ('grupos','L','Ghana','🇬🇭','Panamá','🇵🇦','2026-07-01 02:00:00+00','Kansas City'),
  ('grupos','L','Inglaterra','🏴󠁧󠁢󠁥󠁮󠁧󠁿','Ghana','🇬🇭','2026-07-01 22:00:00+00','Boston'),
  ('grupos','L','Panamá','🇵🇦','Croacia','🇭🇷','2026-07-01 22:00:00+00','Kansas City');
