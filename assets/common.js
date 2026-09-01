// ============================================================
// FUNÇÕES PARTILHADAS — usadas pelo site do cliente e pelo painel do gestor
// ============================================================

function formatKz(valor){
  return new Intl.NumberFormat('pt-AO', { maximumFractionDigits: 0 }).format(valor || 0) + ' Kz';
}

function showToast(msg){
  let el = document.getElementById('global-toast');
  if(!el){
    el = document.createElement('div');
    el.id = 'global-toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

async function getSession(){
  const { data, error } = await supabaseClient.auth.getSession();
  if(error){ console.warn(error); return null; }
  return data.session;
}

async function getProfile(userId){
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if(error){ console.warn(error); return null; }
  return data;
}

async function logout(){
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}

async function requireLogin(redirectTo){
  const session = await getSession();
  if(!session){
    window.location.href = redirectTo || 'conta.html';
    return null;
  }
  const profile = await getProfile(session.user.id);
  return { session, profile };
}

async function requireAdmin(){
  const session = await getSession();
  if(!session){
    window.location.href = 'login.html';
    return null;
  }
  const profile = await getProfile(session.user.id);
  if(!profile || profile.role !== 'admin'){
    document.body.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem;text-align:center;padding:2rem;font-family:Inter,sans-serif;background:#121212;color:#F1E7DA;">
        <div style="font-size:3rem;">🔒</div>
        <h1 style="font-family:'Playfair Display',serif;">Acesso restrito</h1>
        <p style="color:rgba(241,231,218,0.6);max-width:360px;">Esta área é exclusiva para administradores. A tua conta não tem essa permissão.</p>
        <a href="../index.html" style="color:#FF8A3D;font-weight:600;">Voltar ao site</a>
      </div>`;
    return null;
  }
  return { session, profile };
      }
