// ========================= FIREBASE (CDN) ========================= // Comentário do bloco
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"; // Importa init do Firebase
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"; // Importa Firestore e helpers

// ========================= CONFIG FIREBASE ========================= // Comentário do bloco
const firebaseConfig = { // Objeto de configuração do Firebase
  apiKey: "COLE_AQUI", // Cole seu apiKey
  authDomain: "COLE_AQUI", // Cole seu authDomain
  projectId: "COLE_AQUI", // Cole seu projectId
  storageBucket: "COLE_AQUI", // Cole seu storageBucket
  messagingSenderId: "COLE_AQUI", // Cole seu senderId
  appId: "COLE_AQUI" // Cole seu appId
}; // Fim config

const app = initializeApp(firebaseConfig); // Inicializa o Firebase App
const db = getFirestore(app); // Inicializa o Firestore

// ========================= DOM (ELEMENTOS) ========================= // Comentário do bloco
const grid = document.getElementById("grid-produtos"); // Pega o grid de produtos
const btnVerMais = document.getElementById("btn-ver-mais"); // Pega o botão ver mais
const searchInput = document.getElementById("searchInput"); // Pega o input de busca
const searchBtn = document.getElementById("searchBtn"); // Pega o botão da lupa
const cartBtn = document.getElementById("cartBtn"); // Botão do carrinho
const cartBadge = document.getElementById("cartBadge"); // Badge do carrinho
const cartModal = document.getElementById("cartModal"); // Modal carrinho
const cartClose = document.getElementById("cartClose"); // Botão fechar modal
const cartItems = document.getElementById("cartItems"); // Lista de itens no modal
const cartTotal = document.getElementById("cartTotal"); // Total do carrinho
const checkoutBtn = document.getElementById("checkoutBtn"); // Botão finalizar

// ========================= MENU MOBILE + SCROLL ========================= // Comentário do bloco
const menuToggle = document.getElementById("menu-toggle"); // Botão hamburger
const navMenu = document.getElementById("nav-menu"); // Menu nav

if (menuToggle && navMenu) { // Confere se existem
  menuToggle.addEventListener("click", () => { // Ao clicar no hamburger
    navMenu.classList.toggle("active"); // Abre/fecha menu no mobile
  }); // Fim listener
} // Fim if

document.querySelectorAll("nav a, .hero .btn").forEach((a) => { // Pega links âncora
  a.addEventListener("click", (e) => { // Ao clicar num link
    const href = a.getAttribute("href"); // Lê o href
    if (!href || !href.startsWith("#")) return; // Se não for âncora, sai
    e.preventDefault(); // Evita pulo seco
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }); // Scroll suave
    navMenu?.classList.remove("active"); // Fecha menu mobile
  }); // Fim listener
}); // Fim forEach

// ========================= DADOS DO SITE ========================= // Comentário do bloco
let allProducts = []; // Lista completa vinda do Firestore
let visibleCount = 6; // Quantos aparecem inicialmente
let currentSearch = ""; // Texto da busca atual

// ========================= CARRINHO (LOCALSTORAGE) ========================= // Comentário do bloco
const CART_KEY = "jmb_cart_v1"; // Chave do carrinho no storage
const WHATSAPP_NUMBER = "5573988574884"; // Seu WhatsApp para checkout

function loadCart() { // Função para carregar carrinho
  const raw = localStorage.getItem(CART_KEY); // Lê o JSON
  return raw ? JSON.parse(raw) : []; // Se existir, parseia; senão, array vazio
} // Fim loadCart

function saveCart(cart) { // Função para salvar carrinho
  localStorage.setItem(CART_KEY, JSON.stringify(cart)); // Salva array como JSON
} // Fim saveCart

function formatBRL(value) { // Formata número para R$ (simples)
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); // Retorna formatado
} // Fim formatBRL

function parsePriceBRL(text) { // Converte "R$ 120,00" em número 120.00
  const cleaned = String(text).replace(/[^\d,]/g, "").replace(",", "."); // Remove símbolos e ajusta vírgula
  return Number(cleaned) || 0; // Retorna número
} // Fim parsePriceBRL

function updateBadge() { // Atualiza badge do carrinho
  const cart = loadCart(); // Lê carrinho
  const qty = cart.reduce((sum, it) => sum + it.qty, 0); // Soma quantidades
  cartBadge.textContent = String(qty); // Atualiza texto do badge
} // Fim updateBadge

function addToCart(productId) { // Adiciona produto ao carrinho
  const cart = loadCart(); // Carrega carrinho
  const product = allProducts.find((p) => p.id === productId); // Encontra produto
  if (!product) return; // Se não achar, sai
  const found = cart.find((it) => it.id === productId); // Procura se já existe
  if (found) found.qty += 1; // Se existe, soma 1
  else cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 }); // Se não, cria item
  saveCart(cart); // Salva carrinho
  updateBadge(); // Atualiza badge
} // Fim addToCart

function openCart() { // Abre modal carrinho
  cartModal.classList.add("open"); // Adiciona classe open
  renderCart(); // Renderiza itens
} // Fim openCart

function closeCart() { // Fecha modal carrinho
  cartModal.classList.remove("open"); // Remove classe open
} // Fim closeCart

function changeQty(id, delta) { // Altera quantidade
  const cart = loadCart(); // Carrega carrinho
  const item = cart.find((it) => it.id === id); // Encontra item
  if (!item) return; // Se não achar, sai
  item.qty += delta; // Aplica delta
  if (item.qty <= 0) { // Se zerar
    const idx = cart.findIndex((it) => it.id === id); // Pega índice
    cart.splice(idx, 1); // Remove item
  } // Fim if
  saveCart(cart); // Salva carrinho
  updateBadge(); // Atualiza badge
  renderCart(); // Atualiza modal
} // Fim changeQty

function renderCart() { // Renderiza carrinho no modal
  const cart = loadCart(); // Carrega carrinho
  cartItems.innerHTML = ""; // Limpa lista
  let total = 0; // Totalizador

  if (cart.length === 0) { // Se carrinho vazio
    cartItems.innerHTML = `<p style="opacity:.7">Seu carrinho está vazio.</p>`; // Mensagem
    cartTotal.textContent = `Total: ${formatBRL(0)}`; // Total zero
    return; // Sai
  } // Fim if

  cart.forEach((it) => { // Para cada item
    total += it.price * it.qty; // Soma total
    const row = document.createElement("div"); // Cria linha
    row.className = "cart-row"; // Classe CSS
    row.innerHTML = ` 
      <div class="cart-name">${it.name}</div>
      <div class="cart-controls">
        <button type="button" class="ghost" data-dec="${it.id}">-</button>
        <span>${it.qty}</span>
        <button type="button" class="ghost" data-inc="${it.id}">+</button>
      </div>
      <div class="cart-price">${formatBRL(it.price * it.qty)}</div>
    `; // HTML da linha
    cartItems.appendChild(row); // Adiciona na lista
  }); // Fim forEach

  cartTotal.textContent = `Total: ${formatBRL(total)}`; // Atualiza total

  cartItems.querySelectorAll("[data-inc]").forEach((b) => { // Botões +
    b.addEventListener("click", () => changeQty(b.dataset.inc, +1)); // Incrementa
  }); // Fim forEach +

  cartItems.querySelectorAll("[data-dec]").forEach((b) => { // Botões -
    b.addEventListener("click", () => changeQty(b.dataset.dec, -1)); // Decrementa
  }); // Fim forEach -
} // Fim renderCart

function checkoutWhatsApp() { // Finaliza no WhatsApp
  const cart = loadCart(); // Carrega carrinho
  if (cart.length === 0) return; // Se vazio, sai

  const lines = cart.map((it) => `• ${it.qty}x ${it.name} (${formatBRL(it.price)})`); // Linhas da mensagem
  const total = cart.reduce((s, it) => s + it.price * it.qty, 0); // Total
  const message = `Olá! Quero finalizar este pedido:\n\n${lines.join("\n")}\n\nTotal: ${formatBRL(total)}`; // Mensagem final
  const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`; // URL WhatsApp
  window.open(url, "_blank"); // Abre WhatsApp
} // Fim checkoutWhatsApp

cartBtn.addEventListener("click", openCart); // Abre carrinho ao clicar
cartClose.addEventListener("click", closeCart); // Fecha carrinho
cartModal.addEventListener("click", (e) => { if (e.target === cartModal) closeCart(); }); // Fecha clicando fora
checkoutBtn.addEventListener("click", checkoutWhatsApp); // Finaliza pedido

// ========================= BUSCA (FUNCIONANDO) ========================= // Comentário do bloco
function applySearch() { // Aplica filtro por busca
  currentSearch = searchInput.value.trim().toLowerCase(); // Atualiza termo
  visibleCount = 6; // Reseta paginação
  renderProducts(); // Re-renderiza
} // Fim applySearch

searchBtn.addEventListener("click", applySearch); // Clique na lupa aplica busca
searchInput.addEventListener("input", applySearch); // Digitar já filtra

// ========================= PRODUTOS (FIRESTORE) ========================= // Comentário do bloco
async function fetchProducts() { // Busca produtos do Firestore
  const ref = collection(db, "products"); // Referência da coleção
  const q = query(ref, orderBy("highlightOrder", "asc")); // Ordena destaques (menor primeiro)
  const snap = await getDocs(q); // Faz a leitura
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })); // Converte docs para objetos
  allProducts = docs.map((p) => ({ // Normaliza campos
    id: p.id, // ID
    name: p.name || "", // Nome
    desc: p.desc || "", // Descrição
    priceText: p.priceText || "R$ 0,00", // Texto do preço
    price: Number(p.price ?? parsePriceBRL(p.priceText)), // Preço numérico
    imageUrl: p.imageUrl || "https://via.placeholder.com/300", // URL imagem
    highlighted: Boolean(p.highlighted), // Destaque
    highlightOrder: Number(p.highlightOrder ?? 999999), // Ordem
    createdAt: p.createdAt || 0 // Data
  })); // Fim normalização
} // Fim fetchProducts

function createCard(p) { // Cria card
  const card = document.createElement("div"); // Cria div
  card.className = "card"; // Classe card
  card.innerHTML = `
    <img src="${p.imageUrl}" alt="${p.name}">
    <div class="card-content">
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <span class="preco">${p.priceText}</span>
      <button type="button" class="btn-comprar" data-buy="${p.id}">Adicionar ao carrinho</button>
    </div>
  `; // HTML do card
  return card; // Retorna card
} // Fim createCard

function renderProducts() { // Renderiza produtos na tela
  if (!grid) return; // Se grid não existe, sai

  const filtered = allProducts.filter((p) => { // Aplica filtro por busca
    if (!currentSearch) return true; // Se não tem busca, mostra tudo
    return (p.name + " " + p.desc).toLowerCase().includes(currentSearch); // Busca em nome+desc
  }); // Fim filtro

  const ordered = filtered.sort((a, b) => { // Ordena: destaques primeiro pela ordem
    const ad = a.highlighted ? a.highlightOrder : 999999; // Destaques ficam antes
    const bd = b.highlighted ? b.highlightOrder : 999999; // Destaques ficam antes
    if (ad !== bd) return ad - bd; // Ordena por ordem
    return (b.createdAt || 0) - (a.createdAt || 0); // Depois por data
  }); // Fim sort

  const visible = ordered.slice(0, visibleCount); // Pega só os visíveis

  grid.innerHTML = ""; // Limpa grid
  visible.forEach((p) => grid.appendChild(createCard(p))); // Insere cards

  const hasMore = visibleCount < ordered.length; // Verifica se tem mais
  btnVerMais.parentElement.style.display = hasMore ? "block" : "none"; // Mostra/esconde

  grid.querySelectorAll("[data-buy]").forEach((btn) => { // Para cada botão comprar
    btn.addEventListener("click", () => addToCart(btn.dataset.buy)); // Adiciona ao carrinho
  }); // Fim forEach
} // Fim renderProducts

btnVerMais.addEventListener("click", () => { // Clique em ver mais
  visibleCount += 6; // Aumenta 6
  renderProducts(); // Re-renderiza
}); // Fim listener

// ========================= INIT ========================= // Comentário do bloco
updateBadge(); // Atualiza badge ao carregar
await fetchProducts(); // Busca produtos no Firestore
renderProducts(); // Renderiza produtos