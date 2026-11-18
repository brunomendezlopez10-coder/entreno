// Biblioteca de ejercicios y plan semanal (≈30 min por sesión, nivel avanzado).
// eq: cal = calistenia, man = mancuernas, pol = polea alta
// unit: lastre = kg extra sobre tu peso corporal, kg = carga, seg = segundos
window.EXERCISES = {
  dips:        { n: 'Fondos lastrados en paralelas (profundos)', eq: 'cal', unit: 'lastre', m: 'Pecho, tríceps, hombro anterior', cue: 'Baja hasta que el hombro quede por debajo del codo, pausa 1 s abajo en estiramiento. Lastre: mancuerna entre los pies.' },
  ppPush:      { n: 'Flexiones pseudo‑planche', eq: 'cal', unit: 'lastre', m: 'Pecho, hombro anterior, core', cue: 'Manos a la altura de la cintura, dedos hacia fuera, hombros por delante de las manos. Bajada en 3 s.' },
  archerPush:  { n: 'Flexiones arqueras con déficit', eq: 'cal', unit: 'lastre', m: 'Pecho, tríceps', cue: 'Manos sobre mancuernas para bajar más. Carga en un brazo, el otro estirado. Reps por lado.' },
  hspu:        { n: 'Flexiones en pino (HSPU) con déficit', eq: 'cal', unit: 'lastre', m: 'Hombros, tríceps', cue: 'Contra la pared, manos sobre mancuernas o paralelas bajas. Si no salen 5, haz negativas de 5 s.' },
  pullup:      { n: 'Dominadas lastradas (prono)', eq: 'cal', unit: 'lastre', m: 'Dorsal, bíceps, romboides', cue: 'Desde colgado completo (estira el dorsal) hasta pecho a la barra. Bajada controlada 2–3 s.' },
  neutralPull: { n: 'Dominadas arqueras / agarre neutro', eq: 'cal', unit: 'lastre', m: 'Dorsal, braquial', cue: 'Arquera: sube hacia una mano manteniendo el otro brazo casi estirado. Reps por lado.' },
  chinup:      { n: 'Dominadas supinas (chin‑ups) lentas', eq: 'cal', unit: 'lastre', m: 'Bíceps, dorsal', cue: 'Agarre supino a la anchura de hombros, 3 s de bajada, colgado completo abajo.' },
  flRow:       { n: 'Remo front lever (tuck / advanced tuck)', eq: 'cal', unit: 'lastre', m: 'Dorsal, romboides, core', cue: 'En posición de front lever recogido, lleva la barra al ombligo. Si es muy duro: remo invertido con pies elevados.' },
  dragonFlag:  { n: 'Dragon flag', eq: 'cal', unit: 'lastre', m: 'Abdomen, core', cue: 'Cuerpo recto como una tabla, baja en 3–4 s. Si fallas la subida, haz solo negativas.' },
  toes2bar:    { n: 'Toes‑to‑bar estricto', eq: 'cal', unit: 'lastre', m: 'Abdomen, flexores de cadera', cue: 'Sin balanceo: enrolla la pelvis y lleva los pies a la barra. Bajada lenta.' },
  lsit:        { n: 'L‑sit en paralelas', eq: 'cal', unit: 'seg', m: 'Core, flexores de cadera, tríceps', cue: 'Hombros abajo, piernas rectas a 90°. Anota segundos.' },
  pistol:      { n: 'Pistol squat lastrada', eq: 'cal', unit: 'lastre', m: 'Cuádriceps, glúteo', cue: 'Sujeta una mancuerna delante como contrapeso. Profundidad completa. Reps por pierna.' },
  shrimp:      { n: 'Sentadilla camarón (shrimp)', eq: 'cal', unit: 'lastre', m: 'Cuádriceps, glúteo', cue: 'Agarra el pie trasero, rodilla trasera toca el suelo. Avanzado: con mancuerna. Reps por pierna.' },
  nordic:      { n: 'Curl nórdico', eq: 'cal', unit: 'lastre', m: 'Isquiotibiales', cue: 'Pies anclados, cadera extendida. Baja lo más lento posible (4–5 s) y empuja con las manos para subir.' },
  sissy:       { n: 'Sentadilla sissy', eq: 'cal', unit: 'lastre', m: 'Cuádriceps (recto femoral)', cue: 'Talones elevados, rodillas hacia delante, cadera extendida. Máximo estiramiento abajo.' },
  dbIncline:   { n: 'Press inclinado con mancuernas', eq: 'man', unit: 'kg', m: 'Pecho superior, hombro anterior', cue: 'Banco a 30°. Baja hasta notar estiramiento en el pecho, codos a ~45°.' },
  dbFly:       { n: 'Aperturas con mancuernas', eq: 'man', unit: 'kg', m: 'Pecho', cue: 'Codos ligeramente flexionados, baja hasta el máximo estiramiento controlado.' },
  latRaise:    { n: 'Elevaciones laterales con mancuernas', eq: 'man', unit: 'kg', m: 'Hombro lateral', cue: 'Ligera inclinación hacia delante, sube hasta la altura del hombro. Últimas reps: parciales abajo.' },
  leanLat:     { n: 'Elevación lateral inclinada (lean‑away)', eq: 'man', unit: 'kg', m: 'Hombro lateral', cue: 'Agárrate a un poste y inclínate hacia fuera: más tensión abajo. Reps por lado.' },
  skull:       { n: 'Press francés con mancuernas (inclinado)', eq: 'man', unit: 'kg', m: 'Tríceps (cabeza larga)', cue: 'En banco inclinado, baja las mancuernas detrás de la cabeza para estirar el tríceps.' },
  dbRow:       { n: 'Remo con mancuerna a una mano', eq: 'man', unit: 'kg', m: 'Dorsal, romboides', cue: 'Apoyado en banco. Estira abajo dejando caer el hombro, lleva el codo hacia la cadera.' },
  inclineCurl: { n: 'Curl inclinado con mancuernas', eq: 'man', unit: 'kg', m: 'Bíceps (cabeza larga)', cue: 'Banco a 45–60°, brazos colgando por detrás del cuerpo. Sin balanceo.' },
  hammer:      { n: 'Curl martillo', eq: 'man', unit: 'kg', m: 'Braquial, braquiorradial', cue: 'Agarre neutro, codos pegados, bajada controlada.' },
  bulgarian:   { n: 'Sentadilla búlgara con mancuernas', eq: 'man', unit: 'kg', m: 'Cuádriceps, glúteo', cue: 'Paso largo, baja hasta que la rodilla trasera casi toque el suelo. Reps por pierna.' },
  rdl:         { n: 'Peso muerto rumano con mancuernas', eq: 'man', unit: 'kg', m: 'Isquios, glúteo', cue: 'Cadera atrás, espalda neutra, baja hasta el máximo estiramiento de isquios.' },
  slRdl:       { n: 'Peso muerto rumano a una pierna', eq: 'man', unit: 'kg', m: 'Isquios, glúteo medio', cue: 'Mancuerna en la mano contraria a la pierna de apoyo. Reps por pierna.' },
  hipThrust:   { n: 'Hip thrust a una pierna con mancuerna', eq: 'man', unit: 'kg', m: 'Glúteo', cue: 'Espalda en el banco, mancuerna sobre la cadera, pausa 1 s arriba. Reps por pierna.' },
  lunge:       { n: 'Zancadas caminando con mancuernas', eq: 'man', unit: 'kg', m: 'Cuádriceps, glúteo', cue: 'Paso largo y torso ligeramente inclinado. Reps por pierna.' },
  calf:        { n: 'Gemelo a una pierna con mancuerna', eq: 'man', unit: 'kg', m: 'Gemelos', cue: 'En un escalón: pausa 2 s abajo en estiramiento máximo, sube completo.' },
  cableOhExt:  { n: 'Extensión de tríceps sobre la cabeza (polea alta)', eq: 'pol', unit: 'kg', m: 'Tríceps (cabeza larga)', cue: 'De espaldas a la polea con cuerda, codos junto a las orejas. Máximo estiramiento atrás.' },
  pushdown:    { n: 'Extensión de tríceps en polea (pushdown)', eq: 'pol', unit: 'kg', m: 'Tríceps', cue: 'Codos pegados, extensión completa. Última serie: rest‑pause.' },
  cableFly:    { n: 'Cruce de poleas de alto a bajo', eq: 'pol', unit: 'kg', m: 'Pecho (inferior y medio)', cue: 'Brazos abiertos atrás para estirar el pecho, junta las manos frente a la cadera. Con una polea: a una mano.' },
  pulldown:    { n: 'Jalón unilateral arrodillado (polea alta)', eq: 'pol', unit: 'kg', m: 'Dorsal', cue: 'Brazo totalmente estirado arriba, lleva el codo hacia la cadera. Reps por lado.' },
  straightArm: { n: 'Pullover en polea alta (brazos rectos)', eq: 'pol', unit: 'kg', m: 'Dorsal, redondo mayor', cue: 'Inclinado hacia delante, brazos casi rectos desde arriba hasta los muslos.' },
  facePull:    { n: 'Face pull (polea alta)', eq: 'pol', unit: 'kg', m: 'Deltoides posterior, manguito rotador', cue: 'Cuerda hacia la frente separando las manos, codos altos, rotación externa al final.' },
  cableCurl:   { n: 'Curl en polea alta (doble bíceps)', eq: 'pol', unit: 'kg', m: 'Bíceps (cabeza corta)', cue: 'Brazo a la altura del hombro, lleva la mano a la sien. Reps por lado si usas una polea.' },
  cableCrunch: { n: 'Crunch en polea alta', eq: 'pol', unit: 'kg', m: 'Abdomen', cue: 'De rodillas, enrolla la columna llevando los codos a los muslos. No tires con los brazos.' },
};

// Cada bloque es una superserie: haz A1 → A2 → descanso, y repite "rounds" veces.
// Índice = día de la semana de JavaScript (0 = domingo).
window.PLAN = {
  1: { key: 'pushA', title: 'Empuje A', focus: 'Pecho · hombro · tríceps', blocks: [
    { rounds: 4, rest: 90, items: [ { ex: 'dips', reps: '6-10' }, { ex: 'latRaise', reps: '12-20' } ] },
    { rounds: 3, rest: 75, items: [ { ex: 'dbIncline', reps: '8-12' }, { ex: 'cableOhExt', reps: '10-15' } ] },
    { rounds: 3, rest: 60, items: [ { ex: 'ppPush', reps: '8-15' }, { ex: 'cableFly', reps: '12-15', tech: 'Última serie: rest‑pause' } ] },
  ]},
  2: { key: 'pullA', title: 'Tirón A', focus: 'Espalda · bíceps · core', blocks: [
    { rounds: 4, rest: 90, items: [ { ex: 'pullup', reps: '5-8' }, { ex: 'dragonFlag', reps: '5-8' } ] },
    { rounds: 3, rest: 75, items: [ { ex: 'flRow', reps: '6-10' }, { ex: 'inclineCurl', reps: '8-12' } ] },
    { rounds: 3, rest: 60, items: [ { ex: 'pulldown', reps: '10-15' }, { ex: 'facePull', reps: '12-20', tech: 'Última serie: parciales al fallo' } ] },
  ]},
  3: { key: 'legsA', title: 'Pierna A', focus: 'Cuádriceps · isquios · gemelo · abdomen', blocks: [
    { rounds: 4, rest: 90, items: [ { ex: 'pistol', reps: '5-8' }, { ex: 'nordic', reps: '4-8' } ] },
    { rounds: 3, rest: 75, items: [ { ex: 'bulgarian', reps: '8-12' }, { ex: 'calf', reps: '10-15' } ] },
    { rounds: 3, rest: 60, items: [ { ex: 'rdl', reps: '8-12' }, { ex: 'cableCrunch', reps: '10-15' } ] },
  ]},
  4: { key: 'pushB', title: 'Empuje B', focus: 'Hombro · pecho · tríceps', blocks: [
    { rounds: 4, rest: 90, items: [ { ex: 'hspu', reps: '5-10' }, { ex: 'leanLat', reps: '12-20' } ] },
    { rounds: 3, rest: 75, items: [ { ex: 'archerPush', reps: '6-10' }, { ex: 'skull', reps: '10-15' } ] },
    { rounds: 3, rest: 60, items: [ { ex: 'dbFly', reps: '10-15' }, { ex: 'pushdown', reps: '12-20', tech: 'Última serie: rest‑pause' } ] },
  ]},
  5: { key: 'pullB', title: 'Tirón B', focus: 'Espalda · brazos', blocks: [
    { rounds: 4, rest: 90, items: [ { ex: 'neutralPull', reps: '6-10' }, { ex: 'straightArm', reps: '12-15' } ] },
    { rounds: 3, rest: 75, items: [ { ex: 'dbRow', reps: '8-12' }, { ex: 'cableCurl', reps: '10-15' } ] },
    { rounds: 3, rest: 60, items: [ { ex: 'chinup', reps: '5-8' }, { ex: 'hammer', reps: '10-15', tech: 'Última serie: drop‑set' } ] },
  ]},
  6: { key: 'legsB', title: 'Pierna B', focus: 'Glúteo · cuádriceps · core', blocks: [
    { rounds: 4, rest: 90, items: [ { ex: 'shrimp', reps: '5-8' }, { ex: 'hipThrust', reps: '8-12' } ] },
    { rounds: 3, rest: 75, items: [ { ex: 'sissy', reps: '8-15' }, { ex: 'slRdl', reps: '8-12' } ] },
    { rounds: 3, rest: 60, items: [ { ex: 'lunge', reps: '10-12' }, { ex: 'toes2bar', reps: '8-15' } ] },
  ]},
  0: { key: 'arms', title: 'Brazos + core', focus: 'Bíceps · tríceps · hombro posterior (o descanso si estás fatigado)', blocks: [
    { rounds: 3, rest: 75, items: [ { ex: 'chinup', reps: '6-10' }, { ex: 'dips', reps: '10-15' } ] },
    { rounds: 3, rest: 60, items: [ { ex: 'inclineCurl', reps: '10-15' }, { ex: 'cableOhExt', reps: '12-15' } ] },
    { rounds: 3, rest: 60, items: [ { ex: 'facePull', reps: '15-20' }, { ex: 'lsit', reps: '15-30' } ] },
  ]},
};

window.WARMUP = '3 min: 30 s comba o jumping jacks · 10 rotaciones de hombro · 10 dislocaciones con goma · 1 serie fácil del primer ejercicio.';
