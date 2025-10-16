const WHATSAPP_NUMBER = "258875193816";
const SLIDE_INTERVAL = 3000;


const initialProducts = [
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
        id: 3, 
        name: "Impressora Térmica ", 
        size: "80x80 mm", 
        price: 2700.00, 
        stock: "Em Estoque", 
        gallery: [
            "/assets/impressora3.jpg", 
            "/assets/impressora4.webp",
            "/assets/impressora2.jpg" 
        ]
    }, 
];


let cartItems = [];

let currentSlideIndex = initialProducts.reduce((acc, product) => {
    acc[product.id] = 0;
    return acc;
}, {});

let slideInterval;



function renderProductGrid() {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;
    
    productGrid.innerHTML = initialProducts.map(product => {
        const currentImage = product.gallery[currentSlideIndex[product.id]];
        const stockStatusClass = `status-${product.stock.split(' ')[0].toLowerCase()}`;
        
        return `
            <div class="product-card enhanced-card" data-product-id="${product.id}">
                <div class="card-image-box slider-container">
                    <img src="${currentImage}" alt="${product.name} slide" class="slider-image">
                    
                    <div class="slider-indicators">
                        ${product.gallery.map((_, index) => `
                            <span 
                                class="indicator ${index === currentSlideIndex[product.id] ? 'active' : ''}"
                                data-index="${index}"
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
}
function updateProductSlides() {
    initialProducts.forEach(product => {
        const totalImages = product.gallery.length;
        const current = currentSlideIndex[product.id] || 0;
        
  
        const next = (current + 1) % totalImages;
        currentSlideIndex[product.id] = next;

        const productCard = document.querySelector(`.product-card[data-product-id="${product.id}"]`);
        
        if (productCard) {
            const sliderImage = productCard.querySelector('.slider-image');
            const indicators = productCard.querySelectorAll('.indicator');
            
       
            if (sliderImage) {
                sliderImage.src = product.gallery[next];
            }

            indicators.forEach((indicator, index) => {
                indicator.classList.remove('active');
                if (index === next) {
                    indicator.classList.add('active');
                }
            });
        }
    });
}

function startSlideShow() {
    clearInterval(slideInterval); 
    slideInterval = setInterval(updateProductSlides, SLIDE_INTERVAL);
}


function renderCartModal() {
    const cartList = document.getElementById('cart-items-list');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElements = document.querySelectorAll('#cart-count, #sidebar-cart-count');
    const emptyMessage = document.getElementById('empty-cart-message');
    const checkoutBtn = document.getElementById('whatsapp-checkout-btn');
    
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
 
    cartCountElements.forEach(el => el.textContent = cartItems.length);

    emptyMessage.style.display = cartItems.length === 0 ? 'block' : 'none';

    cartTotalElement.textContent = total.toFixed(2) + ' MZN';
    
    checkoutBtn.disabled = cartItems.length === 0;

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

   
    document.querySelectorAll('#cart-items-list .quantity-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.dataset.id);
            const change = parseInt(e.currentTarget.dataset.change);
            updateQuantity(productId, change);
        });
    });
}


// Adiciona um produto ao carrinho 
function addToCart(product) {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({ ...product, quantity: 1 });
    }
    renderCartModal();
    openCartModal(); 
}

// Atualiza a quantidade de um item no carrinho.
function updateQuantity(productId, change) {
    const itemIndex = cartItems.findIndex(item => item.id === productId);
    
    if (itemIndex > -1) {
        cartItems[itemIndex].quantity += change;
        
        if (cartItems[itemIndex].quantity <= 0) {
            cartItems.splice(itemIndex, 1);
        }
    }
    renderCartModal();
}


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


function openCartModal() {
    const modalOverlay = document.getElementById('cart-modal-overlay');
    modalOverlay.style.display = 'flex';
    document.body.classList.add('modal-open');
    clearInterval(slideInterval); 
}

function closeCartModal() {
    const modalOverlay = document.getElementById('cart-modal-overlay');
    modalOverlay.style.display = 'none';
    document.body.classList.remove('modal-open');
    startSlideShow(); 
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


document.addEventListener('DOMContentLoaded', () => {
    renderProductGrid();
    renderCartModal();
    startSlideShow();
    
   
    document.getElementById('current-year-footer').textContent = new Date().getFullYear();

    //Modal do Carrinho
    document.getElementById('cart-open-btn').addEventListener('click', openCartModal);
    document.getElementById('cart-close-btn').addEventListener('click', closeCartModal);
    document.getElementById('cart-modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'cart-modal-overlay') {
            closeCartModal();
        }
    });
    document.getElementById('whatsapp-checkout-btn').addEventListener('click', generateWhatsAppLink);
    
    // Listeners da Sidebar Mobile
    document.getElementById('menu-toggle-btn').addEventListener('click', toggleSidebar);
    document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);
    
    document.getElementById('sidebar-cart-btn').addEventListener('click', () => {
        openCartModal();
        closeSidebar();
    });
    
    // Fecha a sidebar ao clicar em um link
    document.querySelectorAll('#mobile-sidebar .sidebar-link').forEach(link => {
        link.addEventListener('click', closeSidebar);
    });

   
    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
        productGrid.addEventListener('click', (e) => {
            const button = e.target.closest('.add-to-cart-btn');
            
            if (button && !button.disabled) {
                const productId = parseInt(button.dataset.productId);
                const product = initialProducts.find(p => p.id === productId);
                if (product) {
                    addToCart(product);
                }
            }
        });
    }
});