/* ============================================================
   Datos del quiz — EDITA AQUÍ las preguntas, opciones y
   respuesta(s) correcta(s). "correctas" es un arreglo de índices
   (0 a 4) por si una pregunta acepta más de una respuesta válida.
============================================================ */
const PREGUNTAS = [
  {
    texto: "¿Cuál es el youtuber favorito de Vania?",
    opciones: ["Polinesios (Rafa)", "Juanpa Zurita", "Luisito Comunica", "HIMA", "Kimberly Loaiza"],
    correctas: [0]
  },
  {
    texto: "¿Cuál es el cantante favorito de Vania?",
    opciones: ["Harry Styles", "Bad Bunny", "Shawn Mendes", "Taylor Swift", "The 1975"],
    correctas: [0]
  },
  {
    texto: "¿Cuál es el deporte favorito de Vania?",
    opciones: ["Vóley", "Básquet", "Fútbol", "Natación", "Tenis"],
    correctas: [1]
  },
  {
    texto: "¿Cuál es el trend favorito de Vania?",
    opciones: ["Jeep Wrangler", "Beetle", "Mini Cooper", "Fiat 500", "Vocho"],
    correctas: [2]
  },
  {
    texto: "¿Cuál es la frase más utilizada por Vania en el 2026?",
    opciones: ["jajaja", "uwuwu", "de una", "ok mañana", "obvio"],
    correctas: [1, 3]
  }
];

const PUNTAJE_PARA_PASAR = PUNTAJE_MINIMO.nivel1;

let indicePregunta = 0;
let puntaje = 0;
let respondioActual = false;

const tarjetaPregunta = document.getElementById('tarjeta-pregunta');
const barraProgreso = document.getElementById('barra-progreso');
const btnSiguiente = document.getElementById('btn-siguiente');

/* Verifica que haya un nombre guardado; si no, regresa al menú */
(function verificarAcceso(){
  const datos = Progreso.cargar();
  if(!datos.nombre){
    window.location.href = 'index.html';
  }
})();

function crearBarraProgreso(){
  barraProgreso.innerHTML = '';
  PREGUNTAS.forEach((_, i) => {
    const punto = document.createElement('div');
    punto.className = 'punto-progreso';
    barraProgreso.appendChild(punto);
  });
  actualizarBarraProgreso();
}

function actualizarBarraProgreso(){
  const puntos = barraProgreso.querySelectorAll('.punto-progreso');
  puntos.forEach((p, i) => {
    p.classList.remove('activo', 'hecho');
    if(i < indicePregunta) p.classList.add('hecho');
    else if(i === indicePregunta) p.classList.add('activo');
  });
}

function renderizarPregunta(){
  respondioActual = false;
  btnSiguiente.disabled = true;
  actualizarBarraProgreso();

  const pregunta = PREGUNTAS[indicePregunta];

  tarjetaPregunta.innerHTML = `
    <p class="pregunta-numero">Pregunta ${indicePregunta + 1} de ${PREGUNTAS.length}</p>
    <h2 class="pregunta-texto">${pregunta.texto}</h2>
    <div class="opciones-lista" id="opciones-lista"></div>
  `;

  const lista = document.getElementById('opciones-lista');
  pregunta.opciones.forEach((texto, i) => {
    const boton = document.createElement('button');
    boton.className = 'opcion-btn';
    boton.textContent = texto;
    boton.addEventListener('click', () => seleccionarOpcion(i, boton));
    lista.appendChild(boton);
  });

  btnSiguiente.textContent = indicePregunta === PREGUNTAS.length - 1 ? 'Ver resultado' : 'Siguiente';
}

function seleccionarOpcion(indiceElegido, botonElegido){
  if(respondioActual) return;
  respondioActual = true;

  const pregunta = PREGUNTAS[indicePregunta];
  const esCorrecta = pregunta.correctas.includes(indiceElegido);
  if(esCorrecta) puntaje++;

  const botones = document.querySelectorAll('.opcion-btn');
  botones.forEach((btn, i) => {
    btn.disabled = true;
    if(pregunta.correctas.includes(i)) btn.classList.add('correcta');
  });
  if(!esCorrecta) botonElegido.classList.add('incorrecta');

  btnSiguiente.disabled = false;
}

btnSiguiente.addEventListener('click', () => {
  indicePregunta++;
  if(indicePregunta < PREGUNTAS.length){
    renderizarPregunta();
  } else {
    mostrarResultado();
  }
});

function mostrarResultado(){
  const paso = puntaje >= PUNTAJE_PARA_PASAR;
  Progreso.guardarResultadoNivel(1, puntaje, null);

  document.getElementById('pantalla-juego').classList.remove('activa');
  document.getElementById('pantalla-resultado').classList.add('activa');

  document.getElementById('resultado-emoji').textContent = paso ? '🎉' : '💛';
  document.getElementById('resultado-titulo').textContent = paso ? '¡Pasaste!' : 'Casi...';
  document.getElementById('resultado-puntaje').textContent = `${puntaje} / ${PREGUNTAS.length} puntos`;
  document.getElementById('resultado-mensaje').textContent = paso
    ? 'Desbloqueaste la escala de New York.'
    : `Necesitas mínimo ${PUNTAJE_PARA_PASAR} puntos para avanzar. ¡Intenta de nuevo!`;

  const btnContinuar = document.getElementById('btn-continuar');
  btnContinuar.textContent = paso ? 'Continuar al mapa' : 'Reintentar';
  btnContinuar.onclick = () => {
    if(paso){
      window.location.href = 'index.html';
    } else {
      indicePregunta = 0;
      puntaje = 0;
      document.getElementById('pantalla-resultado').classList.remove('activa');
      document.getElementById('pantalla-juego').classList.add('activa');
      crearBarraProgreso();
      renderizarPregunta();
    }
  };
}

/* Inicio */
crearBarraProgreso();
renderizarPregunta();