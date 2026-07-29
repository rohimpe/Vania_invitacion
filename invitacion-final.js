/* ============================================================
   Collage de fotos tipo "polaroid" con efecto de respirar +
   flotar en loop. foto13 es el logo de Cornell (pieza central,
   sin rotación, con marco propio).
============================================================ */
const CARPETA_FOTOS_COLLAGE = 'assets/imagenes/';
const EXTENSION_FOTOS_COLLAGE = '.png';

/* Cada foto: número de archivo, posición y rotación dentro del collage */
const FOTOS_COLLAGE = [
  { numero: 11, clase: 'foto-1', rotacion: -8 },
  { numero: 12, clase: 'foto-2', rotacion: 6 },
  { numero: 13, clase: 'foto-logo', rotacion: 0 }, // escudo de Cornell — pieza central
  { numero: 14, clase: 'foto-3', rotacion: 5 },
  { numero: 15, clase: 'foto-4', rotacion: -6 }
];

const collage = document.getElementById('collage-fotos');

FOTOS_COLLAGE.forEach((foto, indice) => {
  const contenedor = document.createElement('div');
  contenedor.className = `polaroid ${foto.clase}`;
  contenedor.style.setProperty('--rot', `${foto.rotacion}deg`);
  contenedor.style.animationDelay = `${indice * 0.4}s`;

  const img = document.createElement('img');
  img.src = foto.clase === 'foto-logo'
    ? `${CARPETA_FOTOS_COLLAGE}cornell.png`
    : `${CARPETA_FOTOS_COLLAGE}foto${foto.numero}${EXTENSION_FOTOS_COLLAGE}`;
  img.alt = foto.clase === 'foto-logo' ? 'Cornell University' : 'Recuerdo';
  img.style.animationDelay = `${indice * 0.5}s`;

  contenedor.appendChild(img);
  collage.appendChild(contenedor);
});

/* ============================================================
   Modal de ubicación
============================================================ */
const modalUbicacion = document.getElementById('modal-ubicacion');
const btnVerUbicacion = document.getElementById('btn-ver-ubicacion');
const btnCerrarMapa = document.getElementById('btn-cerrar-mapa');

btnVerUbicacion.addEventListener('click', () => {
  modalUbicacion.classList.remove('oculto');
});

btnCerrarMapa.addEventListener('click', () => {
  modalUbicacion.classList.add('oculto');
});

modalUbicacion.addEventListener('click', (e) => {
  if(e.target === modalUbicacion) modalUbicacion.classList.add('oculto');
});