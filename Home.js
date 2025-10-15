// script.js

// --- CONSTANTES ---
const WHATSAPP_NUMBER = "258875193816";
const SLIDE_INTERVAL = 3000; // 3 segundos

// --- DADOS DO PRODUTO (Base de Dados) ---
const initialProducts = [
    { 
        id: 1, 
        name: "Rolo Térmico", 
        size: "80x80 mm", 
        price: 2700.00, 
        stock: "Em Estoque", 
        gallery: [
            "/assets/rolo-termico3.webp", 
            "/assets/rolo80x80.jpg", 
            "/assets/rolo80x80-2.webp"  
        ]
    },
    { 
        id: 2, 
        name: "Rolo Térmico", 
        size: "57x40 mm", 
        price: 1200.00, 
        stock: "Em Estoque", 
        gallery: [
            "/assets/rolo57x40mm.jpg", 
            "/assets/rolotermico57x40mm.jpg", 
            "/assets/rolo termico57x40mm 2.webp"  
        ]
    },
    { 
        id: 3, 
        name: "Impressora Térmica Ultra", 
        size: "80x80 mm", 
        price: 570.00, 
        stock: "Em Estoque", 
        gallery: [
            "/assets/impressora3.jpg", 
            "/assets/impressora4.webp",
            "/assets/impressora2.jpg" 
        ]
    }, 
];

// --- ESTADO GLOBAL (Substitui o useState) ---
let cartItems = [];
let currentSlideIndex = {};
let slideInterval;


// --- FUNÇÕES DE LÓGICA E RENDERIZAÇÃO ---

/**
 * Renderiza a lista de produtos no catálogo e adiciona listeners.
 */
function renderProductGrid() {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;
    
    productGrid.innerHTML = initialProducts.map(product => {
        const currentImage = product.gallery[currentSlideIndex[product.id] || 0];
        const stockStatusClass = `status-${product.stock.split(' ')[0].toLowerCase()}`;
        
        // Retorna a string HTML do card de produto
        return `
            <div class="product-card enhanced-card" data-product-id="${product.id}">
                <div class="card-image-box slider-container">
                    <img src="${currentImage}" alt="${product.name} slide" class="slider-image">
                    
                    <div class="slider-indicators">
                        ${product.gallery.map((_, index) => `
                            <span 
                                class="indicator ${index === currentSlideIndex[product.id] ? 'active' : ''}"
                            ></span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="card-details">
                    <p class="product-category">
                        Impressão Térmica | 
                        <span class="stock-status ${stockStatusClass}">
                            ${product.stock}
                        </span>
                    </p>
                    
                    <h3>${product.name}</h3>
                    
                    <div class="product-spec">
                        <span class="spec-label">Dimensão:</span>
                        <span class="spec-value">${product.size}</span>
                    </div>

                    <div class="product-pricing">
                        <span class="current-price">${product.price.toFixed(2)} MZN</span>
                    </div>
                    
                    <button 
                        class="add-to-cart-btn" 
                        data-product-id="${product.id}"
                        ${product.stock === "Sob Encomenda" ? 'disabled' : ''}
                    >
                        ${product.stock === "Sob Encomenda" ? "Ver Detalhes" : "Adicionar ao Pedido"}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Adiciona o listener DEPOIS que o HTML foi renderizado
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.dataset.productId);
            const product = initialProducts.find(p => p.id === productId);
            if (product) {
                addToCart(product);
            }
        });
    });
}

/**
 * Renderiza o conteúdo do modal de carrinho e atualiza contadores.
 */
function renderCartModal() {
    const cartList = document.getElementById('cart-items-list');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElements = document.querySelectorAll('#cart-count, #sidebar-cart-count');
    const emptyMessage = document.getElementById('empty-cart-message');
    const checkoutBtn = document.getElementById('whatsapp-checkout-btn');
    
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Atualiza o contador do carrinho no Header/Sidebar
    cartCountElements.forEach(el => el.textContent = cartItems.length);

    // Esconde/Mostra a mensagem de carrinho vazio
    emptyMessage.style.display = cartItems.length === 0 ? 'block' : 'none';

    // Atualiza o total
    cartTotalElement.textContent = total.toFixed(2) + ' MZN';
    
    // Habilita/Desabilita o botão de checkout
    checkoutBtn.disabled = cartItems.length === 0;

    // Constrói a lista de itens do carrinho
    cartList.innerHTML = cartItems.map(item => `
        <div class="cart-item-modal" data-product-id="${item.id}">
            <div class="item-details">
                <h4>${item.name} (${item.size})</h4>
                <p class="item-price-unit">${item.price.toFixed(2)} MZN / unid.</p>
            </div>
            <div class="item-controls">
                <button class="quantity-btn" data-id="${item.id}" data-change="-1">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" data-id="${item.id}" data-change="1">+</button>
            </div>
            <p class="item-price-total">Total: ${(item.price * item.quantity).toFixed(2)} MZN</p>
        </div>
    `).join('');

    // Adiciona listeners para os botões de quantidade
    document.querySelectorAll('#cart-items-list .quantity-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.dataset.id);
            const change = parseInt(e.currentTarget.dataset.change);
            updateQuantity(productId, change);
        });
    });
}

/**
 * Adiciona um produto ao carrinho ou aumenta sua quantidade.
 */
function addToCart(product) {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({ ...product, quantity: 1 });
    }
    renderCartModal();
    openCartModal(); // Abre o modal automaticamente
}

/**
 * Atualiza a quantidade de um item no carrinho.
 */
function updateQuantity(productId, change) {
    const itemIndex = cartItems.findIndex(item => item.id === productId);
    
    if (itemIndex > -1) {
        cartItems[itemIndex].quantity += change;
        
        if (cartItems[itemIndex].quantity <= 0) {
            cartItems.splice(itemIndex, 1); // Remove o item
        }
    }
    renderCartModal();
}

/**
 * Gera a mensagem de pedido e abre o link do WhatsApp.
 */
function generateWhatsAppLink() {
    if (cartItems.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
    }
    let message = "Olá, Thermo Tech! Gostaria de fazer o seguinte pedido:\n\n";
    cartItems.forEach(item => {
        const lineTotal = (item.price * item.quantity).toFixed(2);
        message += `- ${item.name} (${item.size}) | Quant: ${item.quantity} | Total: ${lineTotal} MZN\n`;
    });
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\nTOTAL DO PEDIDO: ${total.toFixed(2)} MZN\n`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}


// --- FUNÇÕES DE CONTROLE DE INTERFACE (Modal e Sidebar) ---

function openCartModal() {
    const modalOverlay = document.getElementById('cart-modal-overlay');
    modalOverlay.style.display = 'flex';
    document.body.classList.add('modal-open');
    clearInterval(slideInterval); // Pausa o carrossel
}

function closeCartModal() {
    const modalOverlay = document.getElementById('cart-modal-overlay');
    modalOverlay.style.display = 'none';
    document.body.classList.remove('modal-open');
    startSlideShow(); // Reinicia o carrossel
}

function toggleSidebar() {
    const sidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('is-open');
    overlay.classList.toggle('is-open');
}

function closeSidebar() {
    const sidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-open');
}

/**
 * Lógica do Carrossel de Imagens.
 */
function startSlideShow() {
    clearInterval(slideInterval); 
    
    slideInterval = setInterval(() => {
        // Atualiza o índice do slide para cada produto
        initialProducts.forEach(product => {
            const totalImages = product.gallery.length;
            const current = currentSlideIndex[product.id] || 0;
            currentSlideIndex[product.id] = (current + 1) % totalImages;
        });
        
        // Re-renderiza o catálogo para atualizar as imagens
        renderProductGrid();
    }, SLIDE_INTERVAL);
}


// --- INICIALIZAÇÃO E LISTENERS (Executado no carregamento da página) ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa os índices do carrossel
    initialProducts.forEach(product => {
        currentSlideIndex[product.id] = 0;
    });

    // 2. Renderiza o catálogo e o carrinho (para inicializar contadores)
    renderProductGrid();
    renderCartModal();
    
    // 3. Inicia o carrossel
    startSlideShow();
    
    // 4. Atualiza o ano no footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // 5. Configura Listeners do Modal
    document.getElementById('cart-open-btn').addEventListener('click', openCartModal);
    document.getElementById('cart-close-btn').addEventListener('click', closeCartModal);
    document.getElementById('cart-modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'cart-modal-overlay') {
            closeCartModal(); // Fecha clicando no fundo
        }
    });
    document.getElementById('whatsapp-checkout-btn').addEventListener('click', generateWhatsAppLink);
    
    // 6. Configura Listeners da Sidebar
    document.getElementById('menu-toggle-btn').addEventListener('click', toggleSidebar);
    document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);
    
    // Listener para o botão 'Ver Pedido' na Sidebar
    document.getElementById('sidebar-cart-btn').addEventListener('click', () => {
        openCartModal();
        closeSidebar();
    });
    
    // Fecha a sidebar ao clicar em links de navegação
    document.querySelectorAll('#mobile-sidebar .sidebar-link').forEach(link => {
        link.addEventListener('click', closeSidebar);
    });
});