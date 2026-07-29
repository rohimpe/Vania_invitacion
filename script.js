/* ============================================================
   Nota: el objeto Progreso y PUNTAJE_MINIMO ahora viven en
   progreso.js (compartido con todos los juegos). Este archivo
   se incluye DESPUÉS de progreso.js en index.html.
============================================================ */

/* ============================================================
   Pantalla de nombre
============================================================ */
const pantallaNombre = document.getElementById('pantalla-nombre');
const pantallaMapa = document.getElementById('pantalla-mapa');
const inputNombre = document.getElementById('input-nombre');
const btnEmbarcar = document.getElementById('btn-embarcar');
const errorNombre = document.getElementById('error-nombre');

function mostrarPantalla(pantalla){
  document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
  pantalla.classList.add('activa');
}

function iniciarConNombre(nombre){
  Progreso.guardarNombre(nombre);
  document.getElementById('nombre-jugadora').textContent = nombre;
  mostrarPantalla(pantallaMapa);
  actualizarMapa();
}

btnEmbarcar.addEventListener('click', () => {
  const nombre = inputNombre.value.trim();
  if(nombre.length < 2){
    errorNombre.classList.add('visible');
    inputNombre.focus();
    return;
  }
  errorNombre.classList.remove('visible');
  iniciarConNombre(nombre);
});

inputNombre.addEventListener('keydown', (e) => {
  if(e.key === 'Enter') btnEmbarcar.click();
});

/* ============================================================
   Pantalla de mapa — desbloqueo y estado visual
============================================================ */
function actualizarMapa(){
  const datos = Progreso.cargar();

  const nivel1Ok = datos.nivel1.completado;

  const selloUno = document.querySelector('.sello-1');
  const selloDos = document.querySelector('.sello-2');
  const avion = document.getElementById('avion-viajero');
  const mensaje = document.getElementById('mensaje-progreso');

  // Nivel 1 (Lima — Memoria) siempre desbloqueado
  selloUno.classList.remove('bloqueado');
  if(nivel1Ok) selloUno.classList.add('completado');

  // Nivel 2 (New York — Flappy) depende del nivel 1
  selloDos.classList.toggle('bloqueado', !nivel1Ok);
  if(datos.nivel2.completado) selloDos.classList.add('completado');

  document.getElementById('estado-1').textContent = nivel1Ok ? `✓ ${datos.nivel1.puntaje} pares` : 'Memoria · 10 fotos';
  document.getElementById('estado-2').textContent = datos.nivel2.completado ? `✓ ${datos.nivel2.puntaje} pts` : (nivel1Ok ? 'Flappy Bird · desbloqueado' : 'Bloqueado');

  avion.classList.toggle('en-nivel-2', nivel1Ok);

  if(nivel1Ok){
    if(datos.nivel2.completado){
      mensaje.innerHTML = '¡Itinerario completo! 🎓 — <a href="invitacion-final.html" style="color:inherit;">Ver invitación</a>';
    } else {
      mensaje.textContent = 'Escala 2 de 2 — sigue en New York';
    }
  } else {
    mensaje.textContent = 'Escala 1 de 2 — comienza en Lima';
  }
}

document.querySelectorAll('.sello').forEach(boton => {
  boton.addEventListener('click', () => {
    if(boton.classList.contains('bloqueado')) return;
    const juego = boton.dataset.juego;
    window.location.href = juego;
  });
});

/* ============================================================
   Al cargar: si ya hay nombre guardado, saltar directo al mapa
============================================================ */
(function iniciar(){
  const datos = Progreso.cargar();
  if(datos.nombre){
    document.getElementById('nombre-jugadora').textContent = datos.nombre;
    mostrarPantalla(pantallaMapa);
    actualizarMapa();
  }
})();