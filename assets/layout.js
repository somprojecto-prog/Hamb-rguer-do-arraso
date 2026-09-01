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
            <h1>Hambúrguer do Arraso</h1>
            <span>O melhor da banda</span>
          </div>
        </a>
        <nav class="topnav" style="display:none" id="topnav-desktop">
          <a href="index.html" class="${activePage==='home'?'active':''}">Início</a>
          <a href="loja.html" class="${activePage==='loja'?'active':''}">Menu</a>
          <a href="reservas.html" class="${activePage==='reservas'?'active':''}">Reservas</a>
        </nav>
        <div style="display:flex;align-items:center;gap:.5rem;">
          ${session ? `
            <a href="conta.html" class="icon-btn" aria-label="A minha conta" title="A minha conta">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6"/></svg>
            </a>
          ` : `
            <a href="login.html" class="btn-outline" style="padding:.5rem 1.1rem;font-size:.82rem;">Entrar</a>
          `}
          <a href="carrinho.html" class="icon-btn" aria-label="Carrinho">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3h2l2.4 12.4A2 2 0 0 0 9.36 17H18a2 2 0 0 0 1.98-1.7L21 8H6"/><circle cx="9.5" cy="20.5" r="1.5"/><circle cx="17.5" cy="20.5" r="1.5"/></svg>
            <span class="badge js-cart-badge hidden-badge">0</span>
          </a>
        </div>
      </div>
    </div>
  `;
  updateCartBadge();
}
