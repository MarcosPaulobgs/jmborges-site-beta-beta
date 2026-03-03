// ================== MENU MOBILE ==================
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

menuToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// ================== SCROLL SUAVE ==================
document.querySelectorAll('nav a, .hero .btn').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });

    // fecha menu no mobile
    navMenu.classList.remove('active');
  });
});

// ================== FUNÇÃO COMPRAR (WHATSAPP) ==================
function comprar(produto) {
  const numeroWhatsApp = "5573988497971";
  const mensagem = `Olá! Gostaria de comprar o ${produto}.`;
  const url = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
}

// ================== FAVORITAR + COMPRAR (EVENT DELEGATION) ==================
const grid = document.getElementById('grid-produtos');

grid.addEventListener('click', (e) => {
  // Se clicou em "Comprar"
  const btnComprar = e.target.closest('.btn-comprar');
  if (btnComprar) {
    const produto = btnComprar.dataset.produto || 'Produto';
    comprar(produto);
    return;
  }

  // Se clicou no card (favoritar)
  const card = e.target.closest('.card');
  if (card) {
    card.classList.toggle('favorito');
  }
});

// ================== VER MAIS PRODUTOS ==================
const btnVerMais = document.getElementById('btn-ver-mais');

btnVerMais.addEventListener('click', () => {
  const novosProdutos = [
    { nome: "Porta-retratos", desc: "Lembrança inesquecível", preco: "R$ 60,00", img: "https://via.placeholder.com/300" },
    { nome: "Caneca Personalizada", desc: "Mensagem especial", preco: "R$ 35,00", img: "https://via.placeholder.com/300" },
    { nome: "Vela Aromática", desc: "Ambiente acolhedor", preco: "R$ 40,00", img: "https://via.placeholder.com/300" },
    { nome: "Agenda 2026", desc: "Organize seu ano com estilo", preco: "R$ 50,00", img: "https://via.placeholder.com/300" },
    { nome: "Kit Spa", desc: "Relaxe e se presenteie", preco: "R$ 110,00", img: "https://via.placeholder.com/300" }
  ];

  novosProdutos.forEach((prod) => {
    const card = document.createElement('div');
    card.classList.add('card');

    card.innerHTML = `
      <img src="${prod.img}" alt="${prod.nome}">
      <div class="card-content">
        <h3>${prod.nome}</h3>
        <p>${prod.desc}</p>
        <span class="preco">${prod.preco}</span>
        <button type="button" class="btn-comprar" data-produto="${prod.nome}">Comprar</button>
      </div>
    `;

    grid.appendChild(card);
  });

  // esconde o botão após carregar
  btnVerMais.parentElement.style.display = 'none';
});