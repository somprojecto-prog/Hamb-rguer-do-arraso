// ============================================================
// CARROSSÉIS — comportamento simples e direto, igual ao ficheiro de
// referência: scroll-snap nativo, o passo é sempre "1 cartão + espaço",
// e som de madeira a tocar nas setas e no deslize manual.
// ============================================================

/* ------------------------------------------------------------
   SOM DE MADEIRA
   Duas camadas, para o efeito nunca falhar:
   - Se existir um <audio id="wood-sound"> com um ficheiro real
     carregado (colocado pelo cliente em assets/sounds/), usa-se esse.
   - Caso contrário, sintetiza-se um "toc" de madeira na hora com a
     Web Audio API — funciona sempre, sem precisar de nenhum ficheiro.
------------------------------------------------------------ */
let __audioCtx = null;
function getAudioCtx(){
  const AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) return null;
  if(!__audioCtx) __audioCtx = new AC();
  if(__audioCtx.state === 'suspended') __audioCtx.resume();
  return __audioCtx;
}
function playSynthWoodKnock(){
  const ctx = getAudioCtx();
  if(!ctx) return;
  try{
    const now = ctx.currentTime;
    const duracao = 0.09;
    const bufferSize = Math.floor(ctx.sampleRate * duracao);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i = 0; i < bufferSize; i++){
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 850 + Math.random() * 350;
    bandpass.Q.value = 1.1;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duracao);
    noise.connect(bandpass); bandpass.connect(gain); gain.connect(ctx.destination);
    noise.start(now); noise.stop(now + duracao);
  }catch(e){ /* Web Audio indisponível — falha silenciosa */ }
}
function playWoodSound(){
  const audioEl = document.getElementById('wood-sound');
  if(audioEl && audioEl.readyState >= 2){
    try{
      audioEl.currentTime = 0;
      const p = audioEl.play();
      if(p && p.catch) p.catch(() => playSynthWoodKnock());
      return;
    }catch(e){ /* cai para o som sintetizado */ }
  }
  playSynthWoodKnock();
}

// Toca o som ao deslizar manualmente (arrastar/tocar), com um pequeno debounce
function bindCarouselSound(){
  document.querySelectorAll('.carousel-track').forEach(track => {
    let timeout, ultimaPosicao = track.scrollLeft;
    track.addEventListener('scroll', () => {
      if(Math.abs(track.scrollLeft - ultimaPosicao) < 4) return;
      ultimaPosicao = track.scrollLeft;
      clearTimeout(timeout);
      timeout = setTimeout(playWoodSound, 90);
    }, { passive: true });
  });
}

/* ------------------------------------------------------------
   NAVEGAÇÃO DOS CARROSSÉIS (setas)
   O passo é sempre a largura real do 1º cartão + o espaço entre
   cartões — tal como no ficheiro de referência.
------------------------------------------------------------ */
function scrollCarouselStep(trackId, dir){
  const track = document.getElementById(trackId);
  if(!track) return;
  const item = track.querySelector('.food-card, .drink-card');
  const step = item ? item.offsetWidth + 16 : 260; // 16px = 1rem de gap
  track.scrollBy({ left: step * dir, behavior: 'smooth' });
  playWoodSound();
}

/* ------------------------------------------------------------
   RENDERIZAÇÃO SIMPLES DA LISTA (sem loop infinito)
   Mantido como função utilitária para os dois carrosséis chamarem
   da mesma forma — apenas junta o HTML de cada item.
------------------------------------------------------------ */
function renderCarouselTrack(trackId, items, renderItemFn){
  const track = document.getElementById(trackId);
  if(!track) return;
  track.innerHTML = items.length
    ? items.map(renderItemFn).join('')
    : `<p class="empty-state">Sem produtos nesta categoria.</p>`;
}
