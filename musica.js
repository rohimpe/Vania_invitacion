/* ============================================================
   Reproductor de música de fondo — se auto-inyecta en cualquier
   página que incluya este script. Recuerda si estaba encendida
   o apagada usando localStorage, para que la preferencia se
   mantenga al navegar entre páginas.
============================================================ */
(function(){
  const CLAVE_MUSICA = 'vania_musica';
  const RUTA_CANCION = window.CANCION_PERSONALIZADA || 'assets/musica/cancion.mp3';

  const audio = new Audio(RUTA_CANCION);
  audio.loop = true;
  audio.volume = 0.45;
  window.musicaFondo = audio; // permite pausarla/reanudarla desde otros scripts

  function estaSilenciada(){
    return localStorage.getItem(CLAVE_MUSICA) === 'off';
  }

  function crearBoton(){
    const boton = document.createElement('button');
    boton.id = 'boton-musica';
    boton.type = 'button';
    boton.setAttribute('aria-label', 'Silenciar o activar música');
    boton.textContent = estaSilenciada() ? '🔇' : '🔊';
    document.body.appendChild(boton);
    return boton;
  }

  function intentarReproducir(){
    if(estaSilenciada()) return;
    audio.play().catch(() => {
      // El navegador bloqueó el autoplay: reintenta con cualquier toque/click
      // hasta que realmente logre sonar (antes se rendía en el primer intento).
      const activarConInteraccion = () => {
        if(estaSilenciada()) return;
        audio.play().then(() => {
          document.removeEventListener('click', activarConInteraccion);
          document.removeEventListener('touchend', activarConInteraccion);
        }).catch(() => { /* sigue esperando el próximo toque */ });
      };
      document.addEventListener('click', activarConInteraccion);
      document.addEventListener('touchend', activarConInteraccion, { passive: true });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const boton = crearBoton();

    boton.addEventListener('click', () => {
      if(audio.paused){
        localStorage.setItem(CLAVE_MUSICA, 'on');
        audio.play().catch(() => {});
        boton.textContent = '🔊';
      } else {
        localStorage.setItem(CLAVE_MUSICA, 'off');
        audio.pause();
        boton.textContent = '🔇';
      }
    });

    intentarReproducir();
  });
})();