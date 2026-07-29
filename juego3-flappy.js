/* ============================================================
   Configuración del juego — ajusta aquí la dificultad
============================================================ */
const GRAVEDAD = 0.45;
const FUERZA_SALTO = -7.5;
const VELOCIDAD_TUBOS = 3;
const HUECO_TUBOS = 165;         // espacio vertical para pasar
const ANCHO_TUBOS = 62;
const DISTANCIA_ENTRE_TUBOS = 210; // px horizontales entre un tubo y el siguiente
const PUNTAJE_PARA_PASAR = PUNTAJE_MINIMO.nivel2;

/* Verifica acceso: debe tener nombre Y haber pasado el nivel 1 (Lima — Memoria) */
(function verificarAcceso(){
  const datos = Progreso.cargar();
  if(!datos.nombre){
    window.location.href = 'index.html';
    return;
  }
  if(!datos.nivel1.completado){
    window.location.href = 'index.html';
  }
})();

const canvas = document.getElementById('lienzo-flappy');
const ctx = canvas.getContext('2d');
const ANCHO = canvas.width;
const ALTO = canvas.height;

const overlayInicio = document.getElementById('overlay-inicio');
const marcadorPuntaje = document.getElementById('puntaje-actual');

const imgVania = new Image();
imgVania.src = 'assets/imagenes/vania_floppy.jpeg';

let personaje, tubos, puntaje, corriendo, juegoIniciado, animacionId, audioTriste;

function reiniciarEstado(){
  personaje = {
    x: ANCHO * 0.28,
    y: ALTO / 2,
    ancho: 40,
    alto: 40,
    velocidadY: 0
  };
  tubos = [];
  puntaje = 0;
  corriendo = false;
  juegoIniciado = false;
  marcadorPuntaje.textContent = '0';
  crearTubo(ANCHO + 40);
}

function crearTubo(x){
  const margen = 60;
  const centroHueco = margen + Math.random() * (ALTO - margen * 2 - HUECO_TUBOS) + HUECO_TUBOS / 2;
  tubos.push({
    x,
    centroHueco,
    superado: false
  });
}

function saltar(){
  if(!juegoIniciado){
    juegoIniciado = true;
    corriendo = true;
    overlayInicio.classList.add('oculto');
    bucleJuego();
  }
  if(corriendo){
    personaje.velocidadY = FUERZA_SALTO;
  }
}

function actualizar(){
  personaje.velocidadY += GRAVEDAD;
  personaje.y += personaje.velocidadY;

  tubos.forEach(tubo => { tubo.x -= VELOCIDAD_TUBOS; });

  if(tubos.length && tubos[tubos.length - 1].x < ANCHO - DISTANCIA_ENTRE_TUBOS){
    crearTubo(ANCHO + ANCHO_TUBOS);
  }
  tubos = tubos.filter(tubo => tubo.x > -ANCHO_TUBOS);

  // puntaje: al pasar el centro del tubo
  tubos.forEach(tubo => {
    if(!tubo.superado && tubo.x + ANCHO_TUBOS < personaje.x){
      tubo.superado = true;
      puntaje++;
      marcadorPuntaje.textContent = puntaje;
    }
  });

  // colisión con piso o techo
  if(personaje.y + personaje.alto / 2 >= ALTO || personaje.y - personaje.alto / 2 <= 0){
    return terminarJuego();
  }

  // colisión con tubos
  for(const tubo of tubos){
    const dentroX = personaje.x + personaje.ancho / 2 > tubo.x && personaje.x - personaje.ancho / 2 < tubo.x + ANCHO_TUBOS;
    if(dentroX){
      const topeHueco = tubo.centroHueco - HUECO_TUBOS / 2;
      const baseHueco = tubo.centroHueco + HUECO_TUBOS / 2;
      const chocaArriba = personaje.y - personaje.alto / 2 < topeHueco;
      const chocaAbajo = personaje.y + personaje.alto / 2 > baseHueco;
      if(chocaArriba || chocaAbajo){
        return terminarJuego();
      }
    }
  }
}

function dibujar(){
  ctx.clearRect(0, 0, ANCHO, ALTO);

  // fondo
  ctx.fillStyle = '#FAF8F6';
  ctx.fillRect(0, 0, ANCHO, ALTO);

  // tubos
  tubos.forEach(tubo => {
    const topeHueco = tubo.centroHueco - HUECO_TUBOS / 2;
    const baseHueco = tubo.centroHueco + HUECO_TUBOS / 2;

    ctx.fillStyle = '#B31B1B';
    ctx.fillRect(tubo.x, 0, ANCHO_TUBOS, topeHueco);
    ctx.fillRect(tubo.x, baseHueco, ANCHO_TUBOS, ALTO - baseHueco);

    ctx.fillStyle = '#7A1212';
    ctx.fillRect(tubo.x - 4, topeHueco - 16, ANCHO_TUBOS + 8, 16);
    ctx.fillRect(tubo.x - 4, baseHueco, ANCHO_TUBOS + 8, 16);
  });

  // personaje
  ctx.save();
  ctx.translate(personaje.x, personaje.y);
  const anguloMax = 0.5;
  const angulo = Math.max(-anguloMax, Math.min(anguloMax, personaje.velocidadY / 12));
  ctx.rotate(angulo);
  if(imgVania.complete && imgVania.naturalWidth > 0){
    ctx.drawImage(imgVania, -personaje.ancho / 2, -personaje.alto / 2, personaje.ancho, personaje.alto);
  } else {
    ctx.fillStyle = '#B31B1B';
    ctx.beginPath();
    ctx.arc(0, 0, personaje.ancho / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function bucleJuego(){
  if(!corriendo) return;
  const resultado = actualizar();
  dibujar();
  if(resultado !== 'fin'){
    animacionId = requestAnimationFrame(bucleJuego);
  }
}

function terminarJuego(){
  corriendo = false;
  cancelAnimationFrame(animacionId);
  setTimeout(mostrarResultado, 300);
  return 'fin';
}

function mostrarResultado(){
  const paso = puntaje >= PUNTAJE_PARA_PASAR;
  Progreso.guardarResultadoNivel(2, puntaje, null);
  guardarRankingEnSupabase();

  document.getElementById('pantalla-juego').classList.remove('activa');
  document.getElementById('pantalla-resultado').classList.add('activa');

  // Pausa "superestrella" — si perdió, entra Triste.mp3 (respetando si está silenciada)
  if(window.musicaFondo) window.musicaFondo.pause();
  const musicaSilenciada = localStorage.getItem('vania_musica') === 'off';
  if(!paso && !musicaSilenciada){
    audioTriste = new Audio('assets/musica/Triste.mp3');
    audioTriste.volume = 0.5;
    audioTriste.play().catch(() => {});
  }

  document.getElementById('resultado-emoji').textContent = paso ? '🎓' : '💜';
  document.getElementById('resultado-titulo').textContent = paso ? '¡Llegaste a Cornell!' : 'ok mañana...';
  document.getElementById('resultado-puntaje').textContent = `${puntaje} puntos`;
  document.getElementById('resultado-mensaje').textContent = paso
    ? 'VIAJE TERMINADO....'
    : `Necesitas mínimo ${PUNTAJE_PARA_PASAR} puntos para llegar a Cornell. ¡Intenta de nuevo!`;

  const btnContinuar = document.getElementById('btn-continuar');
  btnContinuar.textContent = paso ? 'Ver invitación' : 'Reintentar';
  btnContinuar.onclick = () => {
    if(audioTriste){ audioTriste.pause(); audioTriste = null; }
    if(paso){
      window.location.href = 'invitacion-final.html';
    } else {
      if(window.musicaFondo) window.musicaFondo.play().catch(() => {});
      document.getElementById('pantalla-resultado').classList.remove('activa');
      document.getElementById('pantalla-juego').classList.add('activa');
      overlayInicio.classList.remove('oculto');
      reiniciarEstado();
      dibujar();
    }
  };
}

/* Controles: click/tap en el lienzo, y barra espaciadora */
document.getElementById('lienzo-wrapper').addEventListener('click', saltar);
document.addEventListener('keydown', (e) => {
  if(e.code === 'Space'){
    e.preventDefault();
    saltar();
  }
});

/* Inicio */
reiniciarEstado();
imgVania.onload = dibujar;
dibujar();