// ===== Variables Globales =====
let cart = [];
let products = [];

// ===== Configuración de WhatsApp =====
// IMPORTANTE: Reemplaza con tu número de WhatsApp (incluyendo código de país, sin '+' o '00')
const WHATSAPP_NUMBER = '573155105123'; // Número de la empresa

// ===== Inicialización =====
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('order')) {
        // Modo de Vista de Pedido
        renderOrderPreviewPage(urlParams.get('order'));
    } else {
        // Modo Catálogo Normal
        initializeApp();
    }
});

function initializeApp() {
    // Cargar carrito desde localStorage
    loadCart();
    // Inicializar event listeners
    initializeEventListeners();
    // Cargar productos
    loadProducts();
}

// ===== Event Listeners =====
function initializeEventListeners() {
    // Search
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const closeSearch = document.getElementById('closeSearch');
    const searchInput = document.getElementById('searchInput');

    searchBtn.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        searchInput.focus();
    });

    closeSearch.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        filterProducts('');
    });

    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            searchOverlay.classList.remove('active');
            searchInput.value = '';
            filterProducts('');
        }
    });

    searchInput.addEventListener('input', (e) => {
        filterProducts(e.target.value);
    });

    // Cart Modal
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');

    cartBtn.addEventListener('click', () => {
        cartModal.classList.add('active');
        renderCart();
    });

    closeCart.addEventListener('click', () => {
        cartModal.classList.remove('active');
    });

    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
        }
    });

    // Filter Buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterByCategory(btn.dataset.category);
        });
    });

    // Sort Select
    const sortSelect = document.getElementById('sortSelect');
    sortSelect.addEventListener('change', (e) => {
        sortProducts(e.target.value);
    });


    // Contact Form
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleContactForm(e.target);
    });

    // Order Form Modal
    const btnSolicitarPedido = document.getElementById('btnSolicitarPedido');
    const orderModal = document.getElementById('orderModal');
    const closeOrderForm = document.getElementById('closeOrderForm');
    const orderForm = document.getElementById('orderForm');

    btnSolicitarPedido.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        cartModal.classList.remove('active');
        orderModal.classList.add('active');
        renderOrderSummary();
    });

    closeOrderForm.addEventListener('click', () => {
        orderModal.classList.remove('active');
    });

    orderModal.addEventListener('click', (e) => {
        if (e.target === orderModal) {
            orderModal.classList.remove('active');
        }
    });

    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleOrderSubmit(e.target);
    });

    // Product Modal & Add to Cart (manejador unificado)
    const productModal = document.getElementById('productModal');
    const closeProductModal = document.getElementById('closeProductModal');
    const productsGrid = document.getElementById('productsGrid');

    closeProductModal.addEventListener('click', () => productModal.classList.remove('active'));
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.classList.remove('active');
        }
    });

    productsGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-add-cart');
        const card = e.target.closest('.product-card');

        if (btn) { // Clic en "Agregar al Carrito"
            const imgSrc = card.querySelector('.product-image img').src;
            addToCart({
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: parseFloat(btn.dataset.price),
                image: imgSrc
            });
        } else if (card) { // Clic en la tarjeta (para abrir modal)
            openProductModal(card);
        }
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== Funciones de Productos =====
function loadProducts() {
    // Aquí puedes cargar tus productos desde un archivo JSON o API
    // Por ahora, los productos están en el HTML
    const productCards = document.querySelectorAll('.product-card');
    products = Array.from(productCards).map(card => {
        const btn = card.querySelector('.btn-add-cart');
        return {
            id: btn.dataset.id,
            name: btn.dataset.name,
            price: parseFloat(btn.dataset.price),
            category: card.dataset.category,
            element: card
        };
    });
}

function filterProducts(searchTerm) {
    const productCards = document.querySelectorAll('.product-card');
    const term = searchTerm.toLowerCase();

    productCards.forEach(card => {
        const title = card.querySelector('.product-title').textContent.toLowerCase();
        const description = card.querySelector('.product-description').textContent.toLowerCase();
        
        if (title.includes(term) || description.includes(term)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

function filterByCategory(category) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        if (category === 'todos' || card.dataset.category === category) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

function sortProducts(sortType) {
    const productsGrid = document.getElementById('productsGrid');
    const productCards = Array.from(document.querySelectorAll('.product-card'));

    let sortedCards = [...productCards];

    switch(sortType) {
        case 'price-low':
            sortedCards.sort((a, b) => {
                const priceA = parseFloat(a.querySelector('.product-price').textContent.replace('$', ''));
                const priceB = parseFloat(b.querySelector('.product-price').textContent.replace('$', ''));
                return priceA - priceB;
            });
            break;
        case 'price-high':
            sortedCards.sort((a, b) => {
                const priceA = parseFloat(a.querySelector('.product-price').textContent.replace('$', ''));
                const priceB = parseFloat(b.querySelector('.product-price').textContent.replace('$', ''));
                return priceB - priceA;
            });
            break;
        case 'name':
            sortedCards.sort((a, b) => {
                const nameA = a.querySelector('.product-title').textContent;
                const nameB = b.querySelector('.product-title').textContent;
                return nameA.localeCompare(nameB);
            });
            break;
        default:
            return;
    }

    // Reordenar elementos en el DOM
    sortedCards.forEach(card => {
        productsGrid.appendChild(card);
    });
}

// ===== Funciones del Carrito =====
function addToCart(product) {
    const existingProduct = cart.find(item => item.id === product.id);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartCount();
    saveCart();
    showNotification('Producto agregado al carrito');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    saveCart();
    renderCart();
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        cartTotal.textContent = '$0.00';
        return;
    }
    
    let total = 0;
    let html = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

// ===== Funciones del Formulario de Contacto =====
function handleContactForm(form) {
    const formData = new FormData(form);
    
    // Aquí puedes enviar los datos a un servidor
    // Por ahora, solo mostramos una notificación
    
    showNotification('¡Mensaje enviado correctamente!');
    form.reset();
}

// ===== Notificaciones =====
function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Agregar estilos inline
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background-color: #10b981;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Agregar animaciones para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== Funciones de Utilidad =====
function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

// ===== Funciones del Formulario de Pedido =====
function renderOrderSummary() {
    const orderSummary = document.getElementById('orderSummary');
    const orderTotal = document.getElementById('orderTotal');
    
    let total = 0;
    let html = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="order-summary-item">
                <span>${item.name} x${item.quantity}</span>
                <span>$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    orderSummary.innerHTML = html;
    orderTotal.textContent = `$${total.toFixed(2)}`;
}

function handleOrderSubmit(form) {
    const formData = new FormData(form);
    
    // Preparar datos del pedido
    const orderData = {
        customerName: formData.get('customerName'),
        customerEmail: formData.get('customerEmail'),
        customerPhone: formData.get('customerPhone'),
        customerAddress: formData.get('customerAddress'),
        customerCity: formData.get('customerCity'),
        orderNotes: formData.get('orderNotes') || 'Ninguna',
        orderItems: formatOrderItems(),
        orderTotal: calculateTotal(),
        orderDate: new Date().toLocaleString('es-ES')
    };
    
    // Enviar a WhatsApp
    sendOrderToWhatsApp(orderData, form);
}

function formatOrderItems() {
    return cart.map(item => {
        let itemText = `*${item.name}* (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`;
        // Añadir el enlace de la imagen para la vista previa en WhatsApp
        if (item.image) {
            itemText += `\n[Ver imagen: ${item.image}]`;
        }
        return itemText;
    }).join('\n\n'); // Doble salto de línea para separar productos
}

function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
}

function handleOrderSubmit(form) {
    const submitBtn = form.querySelector('.btn-submit-order');
    const originalText = submitBtn.innerHTML;

    // Deshabilitar botón y mostrar loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando previsualización...';

    const formData = new FormData(form);
    const orderData = {
        customer: {
            name: formData.get('customerName'),
            phone: formData.get('customerPhone'),
            address: formData.get('customerAddress'),
            city: formData.get('customerCity'),
            notes: formData.get('orderNotes') || 'Ninguna',
        },
        items: cart,
        total: calculateTotal(),
        date: new Date().toLocaleString('es-ES')
    };

    // Codificar los datos del pedido en Base64 para la URL
    const encodedOrder = btoa(JSON.stringify(orderData));
    const previewURL = `${window.location.origin}${window.location.pathname}?order=${encodedOrder}`;

    // Abrir la página de previsualización en una nueva pestaña
    window.open(previewURL, '_blank');

    // Limpiar y restaurar el formulario
    setTimeout(() => {
        showNotification('¡Previsualización generada!');
        cart = [];
        saveCart();
        updateCartCount();
        document.getElementById('orderModal').classList.remove('active');
        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }, 1500);
}

function renderOrderPreviewPage(encodedOrder) {
    try {
        const orderData = JSON.parse(atob(encodedOrder));
        
        // Ocultar contenido del catálogo y mostrar vista de pedido
        document.body.innerHTML = `
            <div class="order-preview-container">
                <div class="order-preview-header">
                    <h1>Resumen del Pedido</h1>
                    <p>Fecha: ${orderData.date}</p>
                </div>
                <div class="order-preview-customer">
                    <h2>Datos del Cliente</h2>
                    <p><strong>Nombre:</strong> ${orderData.customer.name}</p>
                    <p><strong>Teléfono:</strong> ${orderData.customer.phone}</p>
                    <p><strong>Dirección:</strong> ${orderData.customer.address}, ${orderData.customer.city}</p>
                    <p><strong>Notas:</strong> ${orderData.customer.notes}</p>
                </div>
                <div class="order-preview-items">
                    <h2>Productos</h2>
                    ${orderData.items.map(item => `
                        <div class="order-preview-item">
                            <img src="${item.image}" alt="${item.name}">
                            <div class="item-info">
                                <p class="item-name">${item.name} (x${item.quantity})</p>
                                <p class="item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-preview-total">
                    <p>Total del Pedido: <strong>$${orderData.total}</strong></p>
                </div>
                <div class="order-preview-footer">
                    <button id="confirmOrderBtn" class="btn-primary">Confirmar y Enviar por WhatsApp</button>
                </div>
            </div>
        `;

        // Configurar el botón de confirmación
        document.getElementById('confirmOrderBtn').addEventListener('click', () => {
            const message = `¡Hola! 👋 Quiero confirmar mi pedido. Puedes ver los detalles aquí: ${window.location.href}`;
            const encodedMessage = encodeURIComponent(message);
            const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
            window.open(whatsappURL, '_blank');
        });

    } catch (error) {
        document.body.innerHTML = '<p>Error al cargar el pedido. El enlace puede ser inválido.</p>';
        console.error('Error decodificando los datos del pedido:', error);
    }
}

// ===== Video Hero =====
function initializeHeroVideo() {
    const video = document.getElementById('heroVideo');
    
    if (video) {
        // Configurar para loop perfecto sin parpadeos
        video.addEventListener('loadeddata', function() {
            video.play().catch(error => {
                console.log('Video autoplay bloqueado:', error);
            });
        });

        // Reiniciar el video justo antes de que termine para evitar parpadeo negro
        video.addEventListener('timeupdate', function() {
            // Cuando falten 0.1 segundos para terminar, reiniciar
            if (video.duration - video.currentTime < 0.1) {
                video.currentTime = 0;
                video.play();
            }
        });

        // Manejar errores de carga
        video.addEventListener('error', function() {
            console.log('Error al cargar el video');
            const heroVideo = document.querySelector('.hero-video');
            if (heroVideo) {
                heroVideo.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)';
            }
        });

        // Asegurar que el video se reproduce
        video.play().catch(error => {
            console.log('Autoplay bloqueado, esperando interacción del usuario');
        });
    }
}

// ===== Funciones del Modal de Producto =====
function openProductModal(productCard) {
    const productModal = document.getElementById('productModal');
    const modalTitle = document.getElementById('productModalTitle');
    const mainImage = document.getElementById('productModalMainImage');
    const thumbnailsContainer = document.getElementById('productModalThumbnails');
    const modalDescription = document.getElementById('productModalDescription');
    const modalPrice = document.getElementById('productModalPrice');
    const addToCartBtn = document.getElementById('productModalAddToCartBtn');

    // Extraer datos del producto
    const title = productCard.querySelector('.product-title').textContent;
    const fullDescription = productCard.dataset.descriptionFull || productCard.querySelector('.product-description').textContent;
    const price = productCard.querySelector('.product-price').textContent;
    const images = (productCard.dataset.images || productCard.querySelector('img').src).split(',');
    const btnAddCartOriginal = productCard.querySelector('.btn-add-cart');

    // Poblar el modal
    modalTitle.textContent = title;
    modalDescription.textContent = fullDescription;
    modalPrice.textContent = price;
    mainImage.src = images[0];

    // Generar miniaturas
    thumbnailsContainer.innerHTML = '';
    images.forEach((imgSrc, index) => {
        const thumb = document.createElement('img');
        thumb.src = imgSrc;
        thumb.alt = `${title} - Vista ${index + 1}`;
        if (index === 0) thumb.classList.add('active');
        
        thumb.addEventListener('click', () => {
            mainImage.src = imgSrc;
            // Actualizar la miniatura activa
            thumbnailsContainer.querySelectorAll('img').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
        thumbnailsContainer.appendChild(thumb);
    });

    // Configurar el botón de agregar al carrito del modal
    addToCartBtn.onclick = () => {
        addToCart({
            id: btnAddCartOriginal.dataset.id,
            name: btnAddCartOriginal.dataset.name,
            price: parseFloat(btnAddCartOriginal.dataset.price),
            image: images[0] // Usar la imagen principal del modal
        });
        productModal.classList.remove('active'); // Opcional: cerrar modal al agregar
    };

    // Mostrar el modal
    productModal.classList.add('active');
}

// ===== Video Hero =====
function initializeHeroVideo() {
    const video = document.getElementById('heroVideo');
    
    if (video) {
        // Configurar para loop perfecto sin parpadeos
        video.addEventListener('loadeddata', function() {
            video.play().catch(error => {
                console.log('Video autoplay bloqueado:', error);
            });
        });

        // Reiniciar el video justo antes de que termine para evitar parpadeo negro
        video.addEventListener('timeupdate', function() {
            // Cuando falten 0.1 segundos para terminar, reiniciar
            if (video.duration - video.currentTime < 0.1) {
                video.currentTime = 0;
                video.play();
            }
        });

        // Manejar errores de carga
        video.addEventListener('error', function() {
            console.log('Error al cargar el video');
            const heroVideo = document.querySelector('.hero-video');
            if (heroVideo) {
                heroVideo.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)';
            }
        });

        // Asegurar que el video se reproduce
        video.play().catch(error => {
            console.log('Autoplay bloqueado, esperando interacción del usuario');
        });
    }
}

// ===== Exportar funciones globales =====
window.removeFromCart = removeFromCart;
