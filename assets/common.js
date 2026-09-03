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

// Envia um ficheiro de imagem para o Supabase Storage (bucket "imagens")
// e devolve o URL público, pronto a guardar em qualquer campo *_url.
async function uploadImagem(file){
  const extensao = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const nomeFicheiro = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${extensao}`;
  const { error } = await supabaseClient.storage
    .from('imagens')
    .upload(nomeFicheiro, file, { cacheControl: '3600', upsert: false });
  if(error) throw error;
  const { data } = supabaseClient.storage.from('imagens').getPublicUrl(nomeFicheiro);
  return data.publicUrl;
}

// Devolve a sessão atual (ou null se não houver ninguém autenticado)
async function applySiteSettings(){
  try{
    const { data } = await supabaseClient.from('site_settings').select('*').eq('id',1).single();
    if(!data) return;

    // --- Aparência (cores, logo, imagem de fundo) ---
    if(data.cor_laranja) document.documentElement.style.setProperty('--orange', data.cor_laranja);
    if(data.cor_laranja_clara) document.documentElement.style.setProperty('--orange-light', data.cor_laranja_clara);
    if(data.logo_url){
      document.querySelectorAll('.logo-placeholder').forEach(el => {
        el.style.backgroundImage = `url(${data.logo_url})`;
        el.style.backgroundSize = 'cover';
        el.textContent = '';
      });
    }
    if(data.hero_url){
      const hero = document.querySelector('header.wood-texture');
      if(hero){
        hero.style.backgroundImage = `linear-gradient(rgba(18,18,18,0.5),rgba(18,18,18,0.5)), url(${data.hero_url})`;
        hero.style.backgroundSize = 'cover';
        hero.style.backgroundPosition = 'center';
      }
    }
    if(data.hero_foto_url){
      document.querySelectorAll('.js-hero-photo').forEach(el => {
        el.style.backgroundImage = `url(${data.hero_foto_url})`;
      });
    }

    // --- Textos do site (nome, slogan, descrições, rodapé, contactos) ---
    if(data.nome_site){
      document.querySelectorAll('.js-site-name').forEach(el => el.textContent = data.nome_site);
    }
    if(data.slogan){
      document.querySelectorAll('.js-site-slogan').forEach(el => el.textContent = data.slogan);
    }
    if(data.hero_descricao){
      document.querySelectorAll('.js-hero-descricao').forEach(el => el.textContent = data.hero_descricao);
    }

    const footerCopy = document.getElementById('footer-copy');
    if(footerCopy){
      const nome = data.nome_site || 'Hambúrguer do Arraso';
      const texto = data.rodape_texto || 'Todos os direitos reservados.';
      footerCopy.innerHTML = `© <span>${new Date().getFullYear()}</span> ${nome} — ${texto}`;
    }

    if(data.redes_instagram){
      document.querySelectorAll('.js-social-instagram').forEach(el => el.href = data.redes_instagram);
    }
    if(data.redes_facebook){
      document.querySelectorAll('.js-social-facebook').forEach(el => el.href = data.redes_facebook);
    }
    if(data.contacto_whatsapp){
      const numero = data.contacto_whatsapp.replace(/\D/g,'');
      document.querySelectorAll('.js-social-whatsapp').forEach(el => el.href = `https://wa.me/c/${numero}`);
      document.querySelectorAll('.js-whatsapp-float').forEach(el => el.href = `https://wa.me/c/${numero}`);
    }
    if(data.contacto_telefone){
      document.querySelectorAll('.js-contacto-telefone').forEach(el => el.textContent = data.contacto_telefone);
    }
    if(data.contacto_email){
      document.querySelectorAll('.js-contacto-email').forEach(el => el.textContent = data.contacto_email);
    }
    if(data.contacto_morada){
      document.querySelectorAll('.js-contacto-morada').forEach(el => el.textContent = data.contacto_morada);
    }
  }catch(e){ console.warn('Não foi possível aplicar as configurações do site.', e); }
}

async function getSession(){
  const { data, error } = await supabaseClient.auth.getSession();
  if(error){ console.warn(error); return null; }
  return data.session;
}

// Devolve o perfil (nome, telefone, morada, role) do utilizador autenticado
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

// Bloqueia o acesso a páginas que exigem sessão iniciada (área do cliente).
// Devolve {session, profile} se tudo OK, ou redireciona para o login.
async function requireLogin(redirectTo){
  const session = await getSession();
  if(!session){
    window.location.href = redirectTo || 'conta.html';
    return null;
  }
  const profile = await getProfile(session.user.id);
  return { session, profile };
}

// Bloqueia o acesso ao painel do gestor a quem não for admin.
// A verificação real (a que conta) acontece nas políticas RLS da base de
// dados — isto aqui é só para não deixar a interface aberta a mostrar dados.
async function requireAdmin(){
  const session = await getSession();
  if(!session){
    window.location.href = 'login.html';
    return null;
  }
  const profile = await getProfile(session.user.id);
  const papeisEquipa = ['admin','gestor','funcionario'];
  if(!profile || !papeisEquipa.includes(profile.role)){
    document.body.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem;text-align:center;padding:2rem;font-family:Inter,sans-serif;background:#121212;color:#F1E7DA;">
        <div style="font-size:3rem;">🔒</div>
        <h1 style="font-family:'Playfair Display',serif;">Acesso restrito</h1>
        <p style="color:rgba(241,231,218,0.6);max-width:360px;">Esta área é exclusiva para a equipa do restaurante. A tua conta não tem essa permissão.</p>
        <a href="../index.html" style="color:#FF8A3D;font-weight:600;">Voltar ao site</a>
      </div>`;
    return null;
  }
  return { session, profile };
}
