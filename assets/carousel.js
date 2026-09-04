// ============================================================
// CARROSSÉIS — som de madeira, scroll animado, loop infinito (fast food)
// e efeito coverflow com escala pela proximidade do centro (bebidas)
// ============================================================

/* ------------------------------------------------------------
   1) SOM DE MADEIRA
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
   2) SCROLL ANIMADO (usado pelas setas dos dois carrosséis)
   Substitui o scrollBy() nativo por uma animação própria com
   easing — fica mais "macio" do que o smooth-scroll do browser.
------------------------------------------------------------ */
function easeInOutCubic(t){ return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2; }

function animateScrollTo(el, targetLeft, duration = 520){
  const startX = el.scrollLeft;
  const delta = targetLeft - startX;
  const startTime = performance.now();
  function step(now){
    const t = Math.min((now - startTime) / duration, 1);
    el.scrollLeft = startX + delta * easeInOutCubic(t);
    if(t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Avança/recua o carrossel indicado. dir = -1 (esquerda) ou 1 (direita).
// Fast food avança 2 cartões de cada vez; bebidas avança 1 (mais natural
// no efeito coverflow, onde cada item passa pelo centro).
function scrollCarouselStep(trackId, dir){
  const track = document.getElementById(trackId);
  if(!track) return;
  const itemSelector = trackId === 'bebidas-track' ? '.drink-card' : '.food-card';
  const cards = track.querySelectorAll(itemSelector);
  if(cards.length < 2) return;
  const r0 = cards[0].getBoundingClientRect();
  const r1 = cards[1].getBoundingClientRect();
  const stepWidth = r1.left - r0.left; // largura real de 1 item + espaço
  const itensPorPasso = trackId === 'bebidas-track' ? 1 : 2;
  animateScrollTo(track, track.scrollLeft + stepWidth * itensPorPasso * dir, 560);
  playWoodSound();
}

/* ------------------------------------------------------------
   3) FAST FOOD — carrossel infinito
   Trunfo: a lista real é repetida 3x (anterior / atual / seguinte).
   O carrossel começa posicionado no bloco do meio; sempre que o
   scroll entra fundo demais no bloco anterior ou seguinte, salta
   silenciosamente (sem animação) para a posição equivalente no bloco
   do meio — como o conteúdo é idêntico, o "salto" é impercetível e o
   efeito de loop contínuo funciona nos dois sentidos.
------------------------------------------------------------ */
const __infiniteState = {};

function renderInfiniteTrack(trackId, items, renderItemFn){
  const track = document.getElementById(trackId);
  if(!track) return;
  if(!items.length){
    track.innerHTML = `<p class="empty-state">Sem produtos nesta categoria.</p>`;
    return;
  }
  const html = items.map(renderItemFn).join('');
  track.innerHTML = html + html + html; // 3 blocos idênticos = ilusão de loop
  initInfiniteCarousel(trackId, items.length);
}

function initInfiniteCarousel(trackId, itemCount){
  const track = document.getElementById(trackId);
  if(!track) return;
  const cards = track.children;
  if(cards.length < itemCount * 3) return;

  const posicionar = () => {
    const r0 = cards[0].getBoundingClientRect();
    const rN = cards[itemCount].getBoundingClientRect();
    const setWidth = rN.left - r0.left;
    __infiniteState[trackId] = { setWidth };
    track.scrollLeft = setWidth; // arranca já no bloco "atual" (o do meio)
  };
  posicionar();

  let ticking = false;
  track.addEventListener('scroll', () => {
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const st = __infiniteState[trackId];
      if(st){
        if(track.scrollLeft < st.setWidth * 0.5){
          track.scrollLeft += st.setWidth;
        } else if(track.scrollLeft > st.setWidth * 1.5){
          track.scrollLeft -= st.setWidth;
        }
      }
      ticking = false;
    });
  }, { passive: true });

  // Reposiciona quando a janela muda de tamanho (a largura dos cartões é
  // responsiva, por isso a largura de "um bloco" também muda).
  window.addEventListener('resize', () => { posicionar(); });
}

/* ------------------------------------------------------------
   4) BEBIDAS — efeito coverflow (maior ao centro, gradual)
   A cada scroll (e ao carregar/redimensionar), calcula a distância de
   cada cartão ao centro visível do carrossel e aplica uma escala e
   opacidade proporcionais — sem saltos, sempre em transição suave
   (a suavidade vem da transition definida em .drink-card no CSS).
------------------------------------------------------------ */
function initBebidasScale(trackId){
  const track = document.getElementById(trackId);
  if(!track) return;

  function update(){
    const rect = track.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const metade = rect.width / 2 || 1;
    track.querySelectorAll('.drink-card').forEach(card => {
      const r = card.getBoundingClientRect();
      const cardCenter = r.left + r.width / 2;
      const dist = Math.abs(cardCenter - centerX);
      const norm = Math.min(dist / metade, 1); // 0 = centro, 1 = extremidade
      const scale = 1.3 - norm * 0.7;   // centro maior, extremidades ~0.6x
      const opacity = 1 - norm * 0.5;   // centro nítido, extremidades esbatidas
      card.style.transform = `scale(${scale.toFixed(3)})`;
      card.style.opacity = Math.max(opacity, 0.5).toFixed(2);
      card.classList.toggle('is-centered', norm < 0.12);
    });
  }

  let ticking = false;
  track.addEventListener('scroll', () => {
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', update);

  update();
}
