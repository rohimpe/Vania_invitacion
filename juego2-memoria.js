/* ============================================================
   Configuración — cambia estos valores si quieres ajustar
   la dificultad del juego de memoria.
============================================================ */
const CANTIDAD_FOTOS = 10;           // tienes foto1.jpg ... foto10.jpg
const CARPETA_FOTOS = 'assets/imagenes/';
const EXTENSION_FOTOS = '.jpeg';
const INTENTOS_MAXIMOS = 20;         // pares de cartas volteadas permitidos
const PUNTAJE_PARA_PASAR = PUNTAJE_MINIMO.nivel1;

let cartasVolteadas = [];
let paresEncontrados = 0;
let intentosRestantes = INTENTOS_MAXIMOS;
let bloqueoTablero = false;
let horaInicio = null;
let audioTriste = null;

const tablero = document.getElementById('tablero-memoria');
const marcadorPares = document.getElementById('marcador-pares');
const marcadorIntentos = document.getElementById('marcador-intentos');
const btnPlayVideo = document.getElementById('btn-play-video');

btnPlayVideo.addEventListener('click', () => {
  const video = document.getElementById('video-resultado');
  video.play().catch(() => {});
  btnPlayVideo.classList.add('oculto');
});

/* Verifica acceso: solo necesita tener nombre (es el primer nivel) */
(function verificarAcceso(){
  const datos = Progreso.cargar();
  if(!datos.nombre){
    window.location.href = 'index.html';
  }
})();

function generarMazo(){
  const ids = [];
  for(let i = 1; i <= CANTIDAD_FOTOS; i++){
    ids.push(i, i); // cada foto aparece 2 veces (par)
  }
  // mezclar (Fisher-Yates)
  for(let i = ids.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

function crearTablero(){
  const mazo = generarMazo();
  tablero.innerHTML = '';

  mazo.forEach((idFoto, indice) => {
    const carta = document.createElement('button');
    carta.className = 'carta';
    carta.dataset.idFoto = idFoto;
    carta.dataset.indice = indice;

    carta.innerHTML = `
      <div class="carta-interior">
        <div class="carta-cara carta-reverso">
          <img src="assets/imagenes/cornell.png" alt="Cornell">
        </div>
        <div class="carta-cara carta-frente">
          <img src="${CARPETA_FOTOS}foto${idFoto}${EXTENSION_FOTOS}" alt="Recuerdo">
        </div>
      </div>
    `;

    carta.addEventListener('click', () => voltearCarta(carta));
    tablero.appendChild(carta);
  });
}

function voltearCarta(carta){
  if(bloqueoTablero) return;
  if(carta.classList.contains('volteada') || carta.classList.contains('encontrada')) return;
  if(cartasVolteadas.length === 2) return;

  if(horaInicio === null) horaInicio = Date.now();

  carta.classList.add('volteada');
  cartasVolteadas.push(carta);

  if(cartasVolteadas.length === 2){
    intentosRestantes--;
    marcadorIntentos.textContent = intentosRestantes;
    bloqueoTablero = true;

    const [c1, c2] = cartasVolteadas;
    const esPar = c1.dataset.idFoto === c2.dataset.idFoto;

    if(esPar){
      setTimeout(() => {
        c1.classList.add('encontrada');
        c2.classList.add('encontrada');
        paresEncontrados++;
        marcadorPares.textContent = paresEncontrados;
        cartasVolteadas = [];
        bloqueoTablero = false;
        revisarFinDeJuego();
      }, 500);
    } else {
      c1.classList.add('error');
      c2.classList.add('error');
      setTimeout(() => {
        c1.classList.remove('volteada', 'error');
        c2.classList.remove('volteada', 'error');
        cartasVolteadas = [];
        bloqueoTablero = false;
        revisarFinDeJuego();
      }, 800);
    }
  }
}

function revisarFinDeJuego(){
  const seAcabaronIntentos = intentosRestantes <= 0;
  const encontroTodos = paresEncontrados === CANTIDAD_FOTOS;

  if(seAcabaronIntentos || encontroTodos){
    setTimeout(mostrarResultado, 400);
  }
}

function mostrarResultado(){
  const tiempoSegundos = horaInicio ? Math.round((Date.now() - horaInicio) / 1000) : 0;
  const paso = paresEncontrados >= PUNTAJE_PARA_PASAR;
  Progreso.guardarResultadoNivel(1, paresEncontrados, tiempoSegundos);
  guardarRankingEnSupabase();

  document.getElementById('pantalla-juego').classList.remove('activa');
  document.getElementById('pantalla-resultado').classList.add('activa');

  const emoji = document.getElementById('resultado-emoji');
  const videoWrapper = document.getElementById('video-wrapper');
  const video = document.getElementById('video-resultado');

  // Pausa la música de fondo para que no se mezcle con el video o la canción triste
  if(window.musicaFondo) window.musicaFondo.pause();

  if(paso){
    emoji.classList.add('oculto');
    videoWrapper.classList.remove('oculto');
    btnPlayVideo.classList.add('oculto');
    video.src = 'assets/videos/rafa.mp4';
    video.currentTime = 0;

    video.play().catch(() => {
      // El navegador bloqueó el autoplay con sonido: mostramos un botón simple para activarlo
      btnPlayVideo.classList.remove('oculto');
    });
  } else {
    videoWrapper.classList.add('oculto');
    video.removeAttribute('src');
    emoji.classList.remove('oculto');
    emoji.textContent = '💜';

    const musicaTriste = new Audio('assets/musica/Triste.mp3');
    musicaTriste.volume = 0.5;
    musicaTriste.play().catch(() => {});
    audioTriste = musicaTriste;
  }

  document.getElementById('resultado-titulo').textContent = paso ? '¡Pasaste!' : 'ok mañana...';
  document.getElementById('resultado-puntaje').textContent = `${paresEncontrados} de ${CANTIDAD_FOTOS} pares · ${tiempoSegundos}s`;
  document.getElementById('resultado-mensaje').textContent = paso
    ? 'Directo a New York!!!.'
    : `Necesitas mínimo ${PUNTAJE_PARA_PASAR} pares para avanzar. ¡Intenta de nuevo!`;

  const btnContinuar = document.getElementById('btn-continuar');
  btnContinuar.textContent = paso ? 'Continuar al mapa' : 'Reintentar';
  btnContinuar.onclick = () => {
    if(audioTriste){ audioTriste.pause(); audioTriste = null; }
    video.pause();
    if(window.musicaFondo) window.musicaFondo.play().catch(() => {});
    if(paso){
      window.location.href = 'index.html';
    } else {
      reiniciarJuego();
    }
  };
}

function reiniciarJuego(){
  cartasVolteadas = [];
  paresEncontrados = 0;
  intentosRestantes = INTENTOS_MAXIMOS;
  bloqueoTablero = false;
  horaInicio = null;
  marcadorPares.textContent = '0';
  marcadorIntentos.textContent = INTENTOS_MAXIMOS;

  document.getElementById('pantalla-resultado').classList.remove('activa');
  document.getElementById('pantalla-juego').classList.add('activa');
  crearTablero();
}

/* Inicio */
marcadorIntentos.textContent = INTENTOS_MAXIMOS;
crearTablero();