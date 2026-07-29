/* ============================================================
   Capa de datos compartida por TODOS los juegos.
   Hoy usa localStorage. Cuando conectes la base de datos real
   (Firebase/Supabase), solo reemplaza el contenido de estas
   funciones por llamadas async a tu backend — el resto del
   código de cada juego no cambia.
============================================================ */
const Progreso = {
  CLAVE: 'vania_progreso',

  cargar(){
    const guardado = localStorage.getItem(this.CLAVE);
    if(guardado) return JSON.parse(guardado);
    return {
      nombre: '',
      nivel1: { completado: false, puntaje: 0, tiempo: null }, // Lima — Memoria
      nivel2: { completado: false, puntaje: 0, tiempo: null }  // New York — Flappy
    };
  },

  guardar(datos){
    localStorage.setItem(this.CLAVE, JSON.stringify(datos));
  },

  guardarNombre(nombre){
    const datos = this.cargar();
    datos.nombre = nombre;
    this.guardar(datos);
  },

  guardarResultadoNivel(nivel, puntaje, tiempo){
    const datos = this.cargar();
    const clave = `nivel${nivel}`;
    const minimo = PUNTAJE_MINIMO[clave];
    const yaCompletado = datos[clave].completado;
    datos[clave] = {
      completado: yaCompletado || puntaje >= minimo,
      puntaje: Math.max(datos[clave].puntaje, puntaje),
      tiempo: tiempo
    };
    this.guardar(datos);
    return datos[clave].completado;
  }
};

/* Puntajes mínimos para desbloquear el siguiente nivel */
const PUNTAJE_MINIMO = {
  nivel1: 3, // memoria (pares)
  nivel2: 5  // flappy bird (obstáculos)
};