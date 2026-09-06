// ============================================================
// CARRINHO DE COMPRAS
// Fica guardado no navegador do cliente até finalizar a encomenda.
// ============================================================
const CART_KEY = 'hda_cart_v2';

function getCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch(e){ return []; }
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
function cartCount(){
  return getCart().reduce((s,i) => s + i.quantidade, 0);
}
function lineExtrasTotal(item){
  return (item.opcoesEscolhidas||[]).reduce((s,o) => s + Number(o.preco||0), 0);
}
function cartTotal(){
  return getCart().reduce((s,i) => s + (Number(i.preco) + lineExtrasTotal(i)) * i.quantidade, 0);
}
function lineKey(produtoId, opcoesEscolhidas){
  const ids = (opcoesEscolhidas||[]).map(o => o.grupo+':'+o.escolha).sort().join('|');
  return produtoId + '::' + ids;
}
// produto: registo da tabela products. opcoesEscolhidas: [{grupo,escolha,preco}]
function addToCartItem(produto, quantidade, opcoesEscolhidas, obs){
  const cart = getCart();
  const key = lineKey(produto.id, opcoesEscolhidas);
  const existing = cart.find(i => lineKey(i.produto_id, i.opcoesEscolhidas) === key);
  if(existing){ existing.quantidade += quantidade; }
  else{
    cart.push({
      produto_id: produto.id,
      nome: produto.nome,
      preco: produto.preco_promocional || produto.preco,
      imagem_url: produto.imagem_url || null,
      quantidade,
      opcoesEscolhidas: opcoesEscolhidas || [],
      obs: obs || ''
    });
  }
  saveCart(cart);
}
function changeCartQty(produtoId, opcoesEscolhidas, delta){
  const cart = getCart();
  const key = lineKey(produtoId, opcoesEscolhidas);
  const line = cart.find(i => lineKey(i.produto_id, i.opcoesEscolhidas) === key);
  if(!line) return;
  line.quantidade += delta;
  const filtered = line.quantidade <= 0
    ? cart.filter(i => lineKey(i.produto_id, i.opcoesEscolhidas) !== key)
    : cart;
  saveCart(filtered);
}
function clearCart(){ saveCart([]); }

function updateCartBadge(){
  document.querySelectorAll('.js-cart-badge').forEach(el => {
    const n = cartCount();
    el.textContent = n;
    el.classList.toggle('hidden-badge', n === 0);
  });
}
