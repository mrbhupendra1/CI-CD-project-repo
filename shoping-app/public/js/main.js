// Basic client-side app: fetch products, render, cart in localStorage
const API = '/api/products';

async function fetchProducts(){
  try{
    const res = await fetch(API);
    if(!res.ok) throw new Error('api fail');
    return await res.json();
  }catch(e){
    return window.PRODUCTS || []; // fallback to products-data.js
  }
}

function money(x){ return '₹' + (x).toLocaleString('en-IN'); }

// render product cards into containerId
async function renderProducts(containerId){
  const products = await fetchProducts();
  const node = document.getElementById(containerId);
  node.innerHTML = '';
  products.forEach(p=>{
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <div class="badge">NEW</div>
      <img loading="lazy" src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <div class="muted">${p.sku}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
        <div><span class="price">${money(p.price)}</span></div>
        <div style="display:flex;gap:8px">
          <button onclick="addToCart(${p.id})" style="padding:8px 10px;border-radius:8px;border:none;background:linear-gradient(90deg,#06b6d4,#7c3aed);color:#041025;cursor:pointer">Add</button>
          <a href="product.html?id=${p.id}" style="padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);text-decoration:none;color:var(--muted)">View</a>
        </div>
      </div>
    `;
    node.appendChild(el);
  });
}

// CART
function cartKey(){ return 'SHOP_CART_V1' }
function getCart(){ return JSON.parse(localStorage.getItem(cartKey()) || '[]') }
function saveCart(c){ localStorage.setItem(cartKey(), JSON.stringify(c)) }
function addToCart(id){
  const c = getCart();
  const idx = c.findIndex(x=>x.id===id);
  if(idx>=0) c[idx].qty++;
  else c.push({id, qty:1});
  saveCart(c);
  showCartCount();
  toast('Added to cart');
}
function showCartCount(){
  const count = getCart().reduce((s,i)=>s+i.qty,0);
  const el = document.getElementById('cart-count');
  if(el) el.innerText = count;
}
function toast(msg){
  const t = document.createElement('div'); t.innerText = msg;
  Object.assign(t.style,{position:'fixed',left:'50%',transform:'translateX(-50%)',bottom:'80px',background:'#081226',padding:'10px 18px',borderRadius:'8px',zIndex:9999});
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),1400);
}

// CART PANEL UI toggling
function toggleCartPanel(){
  const panel = document.querySelector('.slide-in');
  panel.classList.toggle('open');
  renderCartPanel();
}
async function renderCartPanel(){
  const cart = getCart();
  const prodList = await fetchProducts();
  const panelBody = document.getElementById('cart-items');
  if(!panelBody) return;
  if(cart.length===0){ panelBody.innerHTML = '<div style="padding:12px;color:var(--muted)">Cart empty</div>'; return;}
  panelBody.innerHTML = '';
  let total=0;
  cart.forEach(item=>{
    const p = prodList.find(x=>x.id===item.id);
    if(!p) return;
    total += p.price * item.qty;
    const row = document.createElement('div');
    row.style.display='flex';row.style.justifyContent='space-between';row.style.alignItems='center';row.style.padding='8px 0';
    row.innerHTML = `<div style="display:flex;gap:10px;align-items:center">
      <img src="${p.img}" style="width:56px;height:56px;border-radius:8px;object-fit:cover">
      <div>
        <div style="font-weight:700">${p.name}</div>
        <div style="color:var(--muted);font-size:13px">${money(p.price)}</div>
      </div>
    </div>
    <div>
      <button onclick="updateQty(${item.id}, -1)">-</button>
      <span style="padding:6px 10px">${item.qty}</span>
      <button onclick="updateQty(${item.id}, +1)">+</button>
    </div>`;
    panelBody.appendChild(row);
  });
  document.getElementById('cart-total').innerText = money(total);
}
function updateQty(id, delta){
  let c = getCart();
  const idx = c.findIndex(x=>x.id===id);
  if(idx<0) return;
  c[idx].qty += delta;
  if(c[idx].qty<=0) c.splice(idx,1);
  saveCart(c);
  renderCartPanel();
  showCartCount();
}

async function placeOrder(){
  const items = getCart();
  if(items.length===0){ toast('Cart empty'); return; }
  const name = prompt('Enter your name for order');
  if(!name) return;
  const res = await fetch('/api/order',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({items,name,address:'Demo address'})});
  const data = await res.json();
  if(data.orderId){ localStorage.removeItem(cartKey()); showCartCount(); toggleCartPanel(); alert('Order placed: '+data.orderId) }
  else alert('Order failed');
}

// On page load
document.addEventListener('DOMContentLoaded', ()=>{
  showCartCount();
  // wire hero shop button
  const shopBtn = document.getElementById('shop-now');
  if(shopBtn) shopBtn.onclick = ()=> location.href = 'products.html';
});

