/* ============================================================
   Conexión a Supabase — guarda y lee el ranking de puntajes.
   Requiere que la librería de Supabase esté cargada ANTES de
   este archivo (ver la etiqueta <script> en el HTML).
============================================================ */
const SUPABASE_URL = 'https://jxfeejbesbfpsjjeohzj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Xp6EDG-n3hMnuZZMxfLgdQ_z5KoWmWJ';

const clienteSupabase = (typeof window.supabase !== 'undefined')
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

/* Guarda (o actualiza) la fila de la jugadora actual en el ranking */
async function guardarRankingEnSupabase(){
  if(!clienteSupabase){
    console.warn('Supabase no está disponible todavía.');
    return;
  }
  const datos = Progreso.cargar();
  if(!datos.nombre) return;

  try{
    const { error } = await clienteSupabase
      .from('ranking')
      .upsert({
        nombre: datos.nombre,
        memoria_puntaje: datos.nivel1.puntaje,
        memoria_tiempo: datos.nivel1.tiempo,
        flappy_puntaje: datos.nivel2.puntaje,
        actualizado_en: new Date().toISOString()
      }, { onConflict: 'nombre' });

    if(error) console.error('Error guardando ranking:', error);
  } catch(e){
    console.error('Error guardando ranking:', e);
  }
}

/* Obtiene el ranking completo, ordenado por mejor puntaje */
async function obtenerRankingDeSupabase(){
  if(!clienteSupabase) return [];

  const { data, error } = await clienteSupabase
    .from('ranking')
    .select('*')
    .order('flappy_puntaje', { ascending: false })
    .order('memoria_puntaje', { ascending: false });

  if(error){
    console.error('Error leyendo ranking:', error);
    return [];
  }
  return data;
}