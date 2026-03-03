// ================== MENU MOBILE ==================

// Captura o botão hamburguer (ícone de 3 linhas)
const menuToggle = document.getElementById('menu-toggle');

// Captura o menu de navegação
const navMenu = document.getElementById('nav-menu');

// Verifica se os dois elementos existem antes de aplicar eventos (evita erro no console)
if (menuToggle && navMenu) {

  // Adiciona evento de clique no botão hamburguer
  menuToggle.addEventListener('click', () => {

    // Alterna a classe 'active' (abre/fecha menu)
    navMenu.classList.toggle('active');

    // Verifica se o menu está aberto
    const isOpen = navMenu.classList.contains('active');

    // Atualiza atributo aria-expanded (acessibilidade)
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Fecha o menu ao clicar fora dele
  document.addEventListener('click', (e) => {

    // Verifica se o clique foi dentro do menu
    const clickedInsideMenu = navMenu.contains(e.target);

    // Verifica se o clique foi no botão hamburguer
    const clickedToggle = menuToggle.contains(e.target);

    // Se não clicou nem no menu nem no botão → fecha o menu
    if (!clickedInsideMenu && !clickedToggle) {
      navMenu.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}
// ================== SCROLL SUAVE ==================

// Seleciona todos os links do menu + botão da hero
document.querySelectorAll('nav a, .hero .btn').forEach(anchor => {

  // Adiciona evento de clique em cada link
  anchor.addEventListener('click', function (e) {

    // Pega o valor do href
    const href = this.getAttribute('href');

    // Se não existir ou não for âncora (#), interrompe
    if (!href || !href.startsWith('#')) return;

    // Impede comportamento padrão (pular seco para seção)
    e.preventDefault();

    // Busca o elemento destino
    const target = document.querySelector(href);

    // Se existir, faz scroll suave até ele
    if (target) target.scrollIntoView({ behavior: 'smooth' });

    // Fecha menu no mobile após clicar
    navMenu?.classList.remove('active');

    // Atualiza aria-expanded para acessibilidade
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});
// ================== FUNÇÃO COMPRAR (WHATSAPP) ==================

// Função chamada ao clicar no botão Comprar
function comprar(produto) {

  // Número da loja (com código do país)
  const numeroWhatsApp = "5573988574884";

  // Mensagem personalizada com o nome do produto
  const mensagem = `Olá! Gostaria de comprar o ${produto}.`;

  // Monta URL oficial da API do WhatsApp
  const url = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensagem)}`;

  // Abre o WhatsApp em nova aba
  window.open(url, "_blank");
}

// ================== FAVORITAR + COMPRAR (EVENT DELEGATION) ==================

// Seleciona o container que possui os cards
const grid = document.getElementById('grid-produtos');

// Verifica se o grid existe
if (grid) {

  // Adiciona evento de clique no container (delegação de evento)
  grid.addEventListener('click', (e) => {

    // Verifica se o clique foi em um botão "Comprar"
    const btnComprar = e.target.closest('.btn-comprar');

    if (btnComprar) {

      // Pega o nome do produto armazenado no data-produto
      const produto = btnComprar.dataset.produto || 'Produto';

      // Chama função comprar
      comprar(produto);

      return; // Interrompe para não executar o favoritar
    }

    // Se clicou no card (mas não no botão)
    const card = e.target.closest('.card');

    // Alterna classe favorito (efeito visual)
    if (card) card.classList.toggle('favorito');
  });
}

// ================== VER MAIS PRODUTOS ==================

// Seleciona botão "Ver Mais"
const btnVerMais = document.getElementById('btn-ver-mais');

// Executa apenas se botão e grid existirem
if (btnVerMais && grid) {

  // Evento de clique no botão
  btnVerMais.addEventListener('click', () => {

    // Lista de novos produtos que serão adicionados dinamicamente
    const novosProdutos = [
      { nome: "Porta-retratos", desc: "Lembrança inesquecível", preco: "R$ 60,00", img: "https://via.placeholder.com/300" },
      { nome: "Caneca Personalizada", desc: "Mensagem especial", preco: "R$ 35,00", img: "https://via.placeholder.com/300" },
      { nome: "Vela Aromática", desc: "Ambiente acolhedor", preco: "R$ 40,00", img: "https://via.placeholder.com/300" },
      { nome: "Agenda 2026", desc: "Organize seu ano com estilo", preco: "R$ 50,00", img: "https://via.placeholder.com/300" },
      { nome: "Kit Spa", desc: "Relaxe e se presenteie", preco: "R$ 110,00", img: "https://via.placeholder.com/300" }
    ];

    // Percorre cada produto da lista
    novosProdutos.forEach((prod) => {

      // Cria uma nova div para o card
      const card = document.createElement('div');

      // Adiciona classe card
      card.classList.add('card');

      // Insere estrutura interna do card
      card.innerHTML = `
        <img src="${prod.img}" alt="${prod.nome}">
        <div class="card-content">
          <h3>${prod.nome}</h3>
          <p>${prod.desc}</p>
          <span class="preco">${prod.preco}</span>
          <button type="button" class="btn-comprar" data-produto="${prod.nome}">Comprar</button>
        </div>
      `;

      // Adiciona card ao grid
      grid.appendChild(card);
    });

    // Esconde o botão após carregar novos produtos
    btnVerMais.parentElement.style.display = 'none';
  });
}