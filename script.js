// Global Variables
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.querySelectorAll('.cart-count');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const searchInput = document.querySelector('.search-form input');
const categoryFilter = document.getElementById('category-filter');
const priceFilter = document.getElementById('price-filter');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCartUI();
    
    // Initialize elements if they exist on the page
    if (productGrid) setupProductPage();
    if (cartItemsContainer) setupCartPage();
    if (searchInput) setupSearch();
    if (categoryFilter) setupFilters();
});

// Fetch products from "API" or local data
function fetchProducts() {
    // In a real app, this would be a fetch() to your backend
    products = [
        {
            id: 1,
            name: "Classic White Tee",
            price: 24.99,
            image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            category: "tops",
            rating: 4.5,
            colors: ["white", "black", "gray"],
            sizes: ["S", "M", "L", "XL"]
        },
        {
            id: 2,
            name: "Black Denim Jacket",
            price: 59.99,
            image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            category: "jackets",
            rating: 4.8,
            colors: ["black", "blue"],
            sizes: ["M", "L", "XL"]
        },
        // Add more products as needed
    ];
}

// Product Page Functionality
function setupProductPage() {
    renderProducts(products);
    
    // Add to Cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
            e.target.textContent = 'Added!';
            setTimeout(() => {
                e.target.textContent = 'Add to Cart';
            }, 1000);
        }
    });
}

function renderProducts(productsToRender) {
    productGrid.innerHTML = '';
    
    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                ${product.price < 30 ? '<span class="product-badge">Sale</span>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">$${product.price.toFixed(2)}</span>
                    ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                <div class="product-rating">
                    ${renderRating(product.rating)}
                    <span class="rating-count">(${Math.floor(Math.random() * 100) + 1})</span>
                </div>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
}

function renderRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Cart Page Functionality
function setupCartPage() {
    renderCartItems();
    
    // Event delegation for cart actions
    cartItemsContainer.addEventListener('click', function(e) {
        const target = e.target.closest('.remove-item') || 
                      e.target.closest('.quantity-btn.minus') || 
                      e.target.closest('.quantity-btn.plus');
        
        if (!target) return;
        
        const productId = parseInt(target.dataset.id);
        
        if (target.classList.contains('remove-item')) {
            removeFromCart(productId);
        } else if (target.classList.contains('minus')) {
            updateQuantity(productId, -1);
        } else if (target.classList.contains('plus')) {
            updateQuantity(productId, 1);
        }
    });
    
    // Quantity input changes
    cartItemsContainer.addEventListener('change', function(e) {
        if (e.target.classList.contains('quantity-input')) {
            const productId = parseInt(e.target.closest('.cart-item').querySelector('.remove-item').dataset.id);
            const newQuantity = parseInt(e.target.value);
            
            if (newQuantity > 0) {
                updateCartItemQuantity(productId, newQuantity);
            } else {
                e.target.value = cart.find(item => item.id === productId).quantity;
            }
        }
    });
    
    // Checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
}

function renderCartItems() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">
                    <i class="fas fa-shopping-bag"></i>
                </div>
                <h3 class="empty-cart-message">Your cart is empty</h3>
                <a href="index.html" class="btn">Start Shopping</a>
            </div>
        `;
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id) || item;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3 class="cart-item-title">${product.name}</h3>
                <p class="cart-item-variant">Color: ${item.color || 'N/A'} | Size: ${item.size || 'M'}</p>
                <p class="cart-item-price">$${(product.price * item.quantity).toFixed(2)}</p>
                <div class="quantity-control">
                    <button class="quantity-btn minus" data-id="${product.id}">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                    <button class="quantity-btn plus" data-id="${product.id}">+</button>
                </div>
            </div>
            <button class="remove-item" data-id="${product.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    
    updateCartSummary();
}

function updateCartSummary() {
    const subtotal = cart.reduce((total, item) => {
        const product = products.find(p => p.id === item.id) || item;
        return total + (product.price * item.quantity);
    }, 0);
    
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    // Update the summary in the cart page
    if (document.querySelectorAll('.summary-value').length > 0) {
        const summaryValues = document.querySelectorAll('.summary-value');
        summaryValues[0].textContent = `$${subtotal.toFixed(2)}`;
        summaryValues[1].textContent = subtotal > 50 ? 'FREE' : `$${shipping.toFixed(2)}`;
        summaryValues[2].textContent = `$${tax.toFixed(2)}`;
        summaryValues[3].textContent = `$${total.toFixed(2)}`;
    }
    
    // Update the cart total in the mini-cart or elsewhere
    if (cartTotal) {
        cartTotal.textContent = total.toFixed(2);
    }
}

// Cart Management Functions
function addToCart(productId, quantity = 1, color = 'white', size = 'M') {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId && item.color === color && item.size === size);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity,
            color,
            size
        });
    }
    
    saveCart();
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    
    if (cart.length === 0) {
        renderCartItems(); // Show empty cart message
    }
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity < 1) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function updateCartItemQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    // Update cart count in header
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.forEach(el => el.textContent = totalItems);
    
    // Update cart page if open
    if (cartItemsContainer) {
        renderCartItems();
    }
}

// Checkout Process
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // In a real app, this would redirect to a checkout page
    alert(`Proceeding to checkout with ${cart.reduce((total, item) => total + item.quantity, 0)} items. Total: $${cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}`);
    
    // For demo purposes, we'll clear the cart after checkout
    cart = [];
    saveCart();
    updateCartUI();
    renderCartItems();
}

// Search Functionality
function setupSearch() {
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts);
    });
}

// Filter Functionality
function setupFilters() {
    categoryFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
}

function applyFilters() {
    const selectedCategory = categoryFilter.value;
    const selectedPrice = priceFilter.value;
    
    let filteredProducts = products;
    
    // Apply category filter
    if (selectedCategory !== 'all') {
        filteredProducts = filteredProducts.filter(
            product => product.category === selectedCategory
        );
    }
    
    // Apply price filter
    switch (selectedPrice) {
        case 'under25':
            filteredProducts = filteredProducts.filter(product => product.price < 25);
            break;
        case '25to50':
            filteredProducts = filteredProducts.filter(product => product.price >= 25 && product.price <= 50);
            break;
        case 'over50':
            filteredProducts = filteredProducts.filter(product => product.price > 50);
            break;
    }
    
    renderProducts(filteredProducts);
}

// Countdown Timer for Deal of the Day
function setupCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    // Set the date we're counting down to (24 hours from now)
    const countDownDate = new Date();
    countDownDate.setDate(countDownDate.getDate() + 1);
    
    // Update the countdown every 1 second
    const countdown = setInterval(function() {
        const now = new Date().getTime();
        const distance = countDownDate - now;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        daysElement.textContent = days.toString().padStart(2, '0');
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
        
        if (distance < 0) {
            clearInterval(countdown);
            countdownElement.innerHTML = '<div class="deal-expired">Deal Expired!</div>';
        }
    }, 1000);
}

// Initialize countdown when DOM is loaded
if (document.readyState !== 'loading') {
    setupCountdown();
} else {
    document.addEventListener('DOMContentLoaded', setupCountdown);
}