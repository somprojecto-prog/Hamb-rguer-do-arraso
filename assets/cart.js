// ============================================================
// CARRINHO DE COMPRAS
// ============================================================
const CART_KEY = 'hda_cart_v1';

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
function cartTotal(){
  return getCart().reduce((s,i) => {
    const extrasTotal = (i.extras||[]).reduce((es,e) => es + Number(e.preco||0), 0);
    return s + (Number(i.preco) + extrasTotal) * i.quantidade;
  }, 0);
}
function lineKey(produtoId, extras){
  const ids = (extras||[]).map(e => e.nome).sort().join('|');
  return produtoId + '::' + ids;
}
function addToCartItem(produto, quantidade, extras, obs){
  const cart = getCart();
  const key = lineKey(produto.id, extras);
  const existing = cart.find(i => lineKey(i.produto_id, i.extras) === key);
  if(existing){ existing.quantidade += quantidade; }
  else{
    cart.push({
      produto_id: produto.id,
      nome: produto.nome,
      preco: produto.preco_promocional || produto.preco,
      imagem_url: produto.imagem_url || null,
      quantidade,
      extras: extras || [],
      obs: obs || ''
    });
  }
  saveCart(cart);
}
function changeCartQty(produtoId, extras, delta){
  const cart = getCart();
  const key = lineKey(produtoId, extras);
  const line = cart.find(i => lineKey(i.produto_id, i.extras) === key);
  if(!line) return;
  line.quantidade += delta;
  const filtered = line.quantidade <= 0
    ? cart.filter(i => lineKey(i.produto_id, i.extras) !== key)
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
