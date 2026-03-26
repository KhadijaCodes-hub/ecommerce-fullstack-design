// =============================================
//  product-detail.js
//  ecommerce-fullstack-design
// =============================================

// ===== TABS =====
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// ===== IMAGE GALLERY =====
function changeImage(thumb, src) {
    document.getElementById('mainImage').src = src;
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
}

// ===== GET ID FROM URL =====
function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// ===== LOAD PRODUCT DETAIL =====
async function loadProductDetail() {
    const id = getProductIdFromURL();

    if (!id) {
        console.log('No id in URL — static data show ho raha hai');
        return;
    }

    try {
        const product = await getProduct(id);
        if (!product) return;

        // Title
        document.querySelector('.detail-title').textContent = product.name;

        // In stock
        document.querySelector('.in-stock').innerHTML = `
      <i class="fas fa-check-circle"></i> In stock
    `;

        // Rating
        document.querySelector('.rating-val').textContent = product.rating;
        document.querySelector('.reviews').innerHTML = `
      <i class="bi bi-chat-left-text"></i> 32 reviews
    `;
        document.querySelector('.sold').innerHTML = `
      <i class="fas fa-shopping-bag"></i> ${product.orders} sold
    `;

        // Price tiers
        document.querySelector('.price-tiers').innerHTML = `
      <div class="tier">
        <span class="tier-price red">$${product.price.toFixed(2)}</span>
        <span class="tier-qty">50-100 pcs</span>
      </div>
      <div class="tier">
        <span class="tier-price">$${(product.price * 0.92).toFixed(2)}</span>
        <span class="tier-qty">100-700 pcs</span>
      </div>
      <div class="tier active-tier">
        <span class="tier-price">$${(product.price * 0.80).toFixed(2)}</span>
        <span class="tier-qty">700+ pcs</span>
      </div>
    `;

        // Details table
        document.querySelector('.detail-table').innerHTML = `
      <div class="detail-row">
        <span class="detail-label">Price:</span>
        <span class="detail-value">Negotiable</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Category:</span>
        <span class="detail-value">${product.category}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Brand:</span>
        <span class="detail-value">${product.brand || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Condition:</span>
        <span class="detail-value">${product.condition || 'Brand new'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Manufacturer:</span>
        <span class="detail-value">${product.manufacturer || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Stock:</span>
        <span class="detail-value">${product.stock} items available</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Warranty:</span>
        <span class="detail-value">2 years full warranty</span>
      </div>
    `;

        // Main image
        document.getElementById('mainImage').src = product.image;

        // Thumbnails
        document.querySelector('.thumbnail-list').innerHTML = `
      <div class="thumb active" onclick="changeImage(this, '${product.image}')">
        <img src="${product.image}" alt=""/>
      </div>
    `;

        // Description tab
        document.getElementById('description').innerHTML = `
      <p class="desc-text">${product.description}</p>
      <table class="specs-table">
        <tr><td>Category</td><td>${product.category}</td></tr>
        <tr><td>Brand</td><td>${product.brand || 'N/A'}</td></tr>
        <tr><td>Condition</td><td>${product.condition || 'Brand new'}</td></tr>
        <tr><td>Manufacturer</td><td>${product.manufacturer || 'N/A'}</td></tr>
        <tr><td>Stock</td><td>${product.stock} items</td></tr>
      </table>
      <ul class="features-list">
        <li><i class="fas fa-check"></i> Free shipping available</li>
        <li><i class="fas fa-check"></i> 2 years full warranty</li>
        <li><i class="fas fa-check"></i> Original product guaranteed</li>
        <li><i class="fas fa-check"></i> 30 days return policy</li>
      </ul>
    `;

        // Page title
        document.title = `${product.name} - Brand eCommerce`;

        // Load related products
        loadRelatedProducts(product.category, id);

    } catch (err) {
        console.error('Product load nahi hua:', err);
    }
}

// ===== LOAD RELATED PRODUCTS =====
async function loadRelatedProducts(category, currentId) {
    try {
        const products = await getProducts({ category });
        const grid = document.querySelector('.related-grid');
        if (!grid) return;

        // Current product exclude karo
        const related = products.filter(p => p.id !== currentId).slice(0, 6);

        if (related.length === 0) return;

        grid.innerHTML = '';
        related.forEach(product => {
            const card = document.createElement('a');
            card.href = `product-detail.html?id=${product.id}`;
            card.className = 'related-card';
            card.innerHTML = `
        <img src="${product.image}" alt="${product.name}"/>
        <p>${product.name}</p>
        <span>$${product.price.toFixed(2)}</span>
      `;
            grid.appendChild(card);
        });

    } catch (err) {
        console.error('Related products load nahi hue:', err);
    }
}

// ===== SEARCH =====
const searchBtn   = document.querySelector('.search-bar button');
const searchInput = document.getElementById('searchInput');

if (searchBtn) {
  searchBtn.addEventListener('click', function() {
    const q = searchInput.value.trim();
    if (q) window.location.href = `products.html?search=${encodeURIComponent(q)}`;
  });
}

if (searchInput) {
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      const q = this.value.trim();
      if (q) window.location.href = `products.html?search=${encodeURIComponent(q)}`;
    }
  });
}

// ===== PAGE LOAD =====
loadProductDetail();
// ===== CART FUNCTIONS =====
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function decreaseQty() {
    const input = document.getElementById('qtyInput');
    if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
}

function increaseQty() {
    const input = document.getElementById('qtyInput');
    input.value = parseInt(input.value) + 1;
}

function addToCart() {
    const id = getProductIdFromURL();
    const qty = parseInt(document.getElementById('qtyInput').value);
    const title = document.querySelector('.detail-title').textContent;
    const price = parseFloat(document.querySelector('.tier-price').textContent.replace('$', ''));
    const image = document.getElementById('mainImage').src;

    const cart = getCart();

    // Already exist karta hai?
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ id, title, price, image, qty });
    }

    saveCart(cart);

    // Button feedback
    const btn = document.querySelector('.add-to-cart-btn');
    btn.innerHTML = '<i class="fas fa-check"></i> Added to cart!';
    btn.style.background = '#00B517';
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to cart';
        btn.style.background = '';
    }, 2000);
}

