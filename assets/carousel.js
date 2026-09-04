// ============================================================
// CARROSSÉIS — scroll partilhado + som de "madeira a chocar"
// ============================================================
// Duas camadas de som, para o efeito nunca falhar:
//  1) Se existir um <audio id="wood-sound"> com um ficheiro real
//     carregado (o cliente coloca o ficheiro em assets/sounds/),
//     esse som é usado — é o mais fiel.
//  2) Caso contrário, sintetiza-se um "toc" de madeira na hora com a
//     Web Audio API. Funciona sempre, sem precisar de nenhum ficheiro.
// ============================================================

let __audioCtx = null;
function getAudioCtx(){
  const AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) return null;
  if(!__audioCtx) __audioCtx = new AC();
  if(__audioCtx.state === 'suspended') __audioCtx.resume();
  return __audioCtx;
}

// Sintetiza um pequeno impacto seco (ruído filtrado com decaimento rápido),
// parecido com dois blocos de madeira a chocar.
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
    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duracao);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + duracao);
  }catch(e){ /* Web Audio indisponível neste navegador — falha silenciosa */ }
}

function playWoodSound(){
  const audioEl = document.getElementById('wood-sound');
  // readyState >= 2 (HAVE_CURRENT_DATA) só acontece se o ficheiro real existir e tiver carregado
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

// Move o carrossel (usado pelos botões de seta) e toca o som
function scrollCarousel(id, amount){
  const track = document.getElementById(id);
  if(!track) return;
  track.scrollBy({ left: amount, behavior: 'smooth' });
  playWoodSound();
}

// Liga o som ao scroll manual (arrastar/deslizar) de todos os carrosséis da página
function bindCarouselSound(){
  document.querySelectorAll('.carousel-track').forEach(track => {
    let timeout;
    let ultimaPosicao = track.scrollLeft;
    track.addEventListener('scroll', () => {
      // só reage a scroll com deslocação real, para não disparar em cada pixel
      if(Math.abs(track.scrollLeft - ultimaPosicao) < 4) return;
      ultimaPosicao = track.scrollLeft;
      clearTimeout(timeout);
      timeout = setTimeout(playWoodSound, 90);
    }, { passive: true });
  });
}
