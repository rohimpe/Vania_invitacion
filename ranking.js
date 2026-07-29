/* ============================================================
   Lógica de la página de ranking — trae los datos de Supabase
   y los muestra ordenados.
============================================================ */
const listaRanking = document.getElementById('lista-ranking');

function medallaPara(posicion){
  if(posicion === 0) return '🥇';
  if(posicion === 1) return '🥈';
  if(posicion === 2) return '🥉';
  return `#${posicion + 1}`;
}

async function cargarRanking(){
  const datos = await obtenerRankingDeSupabase();

  if(!datos || datos.length === 0){
    listaRanking.innerHTML = '<p class="cargando-ranking">Todavía no hay nadie en el ranking. ¡Sé la primera!</p>';
    return;
  }

  listaRanking.innerHTML = '';
  datos.forEach((fila, indice) => {
    const item = document.createElement('div');
    item.className = 'fila-ranking';
    item.innerHTML = `
      <span class="ranking-posicion">${medallaPara(indice)}</span>
      <span class="ranking-nombre">${fila.nombre}</span>
      <span class="ranking-puntajes">
        <span class="ranking-dato">🧠 ${fila.memoria_puntaje ?? 0}</span>
        <span class="ranking-dato">🐦 ${fila.flappy_puntaje ?? 0}</span>
      </span>
    `;
    listaRanking.appendChild(item);
  });
}

cargarRanking();