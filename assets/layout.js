// ============================================================
// CABEÇALHO PARTILHADO DO SITE DO CLIENTE
// ============================================================
async function renderTopbar(activePage){
  const mount = document.getElementById('topbar-mount');
  if(!mount) return;

  const session = await getSession();

  mount.innerHTML = `
    <div class="topbar">
      <div class="wrap topbar-inner">
        <a href="index.html" class="brand">
          <div class="logo-placeholder">HA</div>
          <div>
            <h1 class="js-site-name">Hambúrguer do Arraso</h1>
            <span class="js-site-slogan">O melhor da banda</span>
          </div>
        </a>
        <!-- "Menu" foi removido de propósito: o cardápio já está na página
             inicial (basta deslizar/rolar) — ver pedido do cliente. -->
        <nav class="topnav" style="display:none" id="topnav-desktop">
          <a href="index.html" class="${activePage==='home'?'active':''}">Início</a>
          <a href="reservas.html" class="${activePage==='reservas'?'active':''}">Reservas</a>
        </nav>
        <div style="display:flex;align-items:center;gap:.3rem;">
          <a href="pesquisa.html" class="icon-btn" aria-label="Pesquisar" title="Pesquisar">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          </a>
          <a href="carrinho.html" class="icon-btn" id="topbar-cart" aria-label="Carrinho" title="Carrinho">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3h2l2.4 12.4A2 2 0 0 0 9.36 17H18a2 2 0 0 0 1.98-1.7L21 8H6"/><circle cx="9.5" cy="20.5" r="1.5"/><circle cx="17.5" cy="20.5" r="1.5"/></svg>
            <span class="badge js-cart-badge hidden-badge">0</span>
          </a>
          ${session ? `
            <a href="conta.html" class="icon-btn" aria-label="A minha conta" title="A minha conta">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6"/></svg>
            </a>
          ` : `
            <a href="login.html" class="btn-outline" style="padding:.5rem 1.1rem;font-size:.82rem;">Entrar</a>
          `}
        </div>
      </div>
    </div>
  `;
  applySiteSettings();
  updateCartBadge();
}

// ============================================================
// BARRA DE NAVEGAÇÃO INFERIOR (estilo app, só visível no telemóvel —
// no ecrã grande a navegação e o carrinho já vivem na topbar)
// Início · Carrinho · Reservas · Pesquisar (ícone de lupa)
// "Menu" foi removido — o cardápio está na página inicial, basta deslizar.
// ============================================================
function renderBottomNav(activePage){
  const mount = document.getElementById('bottom-nav-mount');
  if(!mount) return;

  mount.innerHTML = `
    <nav id="bottom-nav">
      <a href="index.html" class="bottom-nav-item ${activePage==='home'?'active':''}">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 9.5V20a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V9.5"/></svg>
        Início
      </a>
      <a href="carrinho.html" class="bottom-nav-item ${activePage==='carrinho'?'active':''}" style="position:relative;">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3h2l2.4 12.4A2 2 0 0 0 9.36 17H18a2 2 0 0 0 1.98-1.7L21 8H6"/><circle cx="9.5" cy="20.5" r="1.5"/><circle cx="17.5" cy="20.5" r="1.5"/></svg>
        Carrinho
        <span class="nav-badge js-cart-badge hidden-badge">0</span>
      </a>
      <a href="reservas.html" class="bottom-nav-item ${activePage==='reservas'?'active':''}">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
        Reservas
      </a>
      <a href="pesquisa.html" class="bottom-nav-item ${activePage==='pesquisa'?'active':''}" aria-label="Pesquisar">
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      </a>
    </nav>
  `;
  updateCartBadge();
}
