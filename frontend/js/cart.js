// =============================================
//  cart.js — Cart Page Scripts
//  ecommerce-fullstack-design
// =============================================

const CART_API_URL = 'http://127.0.0.1:8000/api';
let appliedCouponDiscount = 0;

// ===== CART HELPERS =====
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// ===== CALCULATE TOTALS =====
function calculateTotals() {
  const cart     = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discount = appliedCouponDiscount > 0 ? appliedCouponDiscount : (subtotal > 500 ? 60 : 0);
  const tax      = parseFloat((subtotal * 0.01).toFixed(2));
  const total    = subtotal - discount + tax;

  const subtotalEl = document.getElementById('subtotal');
  const totalEl    = document.getElementById('total');
  const discountEl = document.querySelector('.discount-val');
  const taxEl      = document.querySelector('.tax-val');

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (totalEl)    totalEl.textContent    = `$${total.toFixed(2)}`;
  if (discountEl) discountEl.textContent = `- $${discount.toFixed(2)}`;
  if (taxEl)      taxEl.textContent      = `+ $${tax.toFixed(2)}`;
}

// ===== RENDER CART =====
function renderCart() {
  const cart     = getCart();
  const cartCard = document.querySelector('.cart-card');
  if (!cartCard) return;

  const bottomActions = cartCard.querySelector('.cart-bottom-actions');
  cartCard.querySelectorAll('.cart-item, .empty-cart-msg').forEach(el => el.remove());

  const countEl = document.getElementById('cartCount');
  if (countEl) countEl.textContent = `(${cart.length})`;

  if (cart.length === 0) {
    const empty = document.createElement('div');
    empty.className     = 'empty-cart-msg';
    empty.style.cssText = 'padding:60px;text-align:center;';
    empty.innerHTML = `
      <i class="fas fa-shopping-cart" style="font-size:48px;color:var(--deal-border)"></i>
      <h3 style="margin-top:16px;color:var(--all-category)">Your cart is empty</h3>
      <p style="color:var(--topbar-gray);margin-top:8px">Add some products to get started!</p>
      <a href="products.html" style="display:inline-block;margin-top:16px;background:var(--search-button);color:white;padding:10px 24px;border-radius:6px;">
        Browse Products
      </a>
    `;
    if (bottomActions) {
      cartCard.insertBefore(empty, bottomActions);
    } else {
      cartCard.appendChild(empty);
    }
    calculateTotals();
    return;
  }

  cart.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.id        = `item-${index}`;
    div.innerHTML = `
      <div class="item-img">
        <img src="${item.image}" alt="${item.title}" onerror="this.src='assets/images/smartwatch.png'"/>
      </div>
      <div class="item-info">
        <h4>${item.title}</h4>
        <p class="item-seller">Price: $${parseFloat(item.price).toFixed(2)} each</p>
        <div class="item-actions">
          <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
          <button class="save-btn" onclick="moveToSaved(${index})">Save for later</button>
        </div>
      </div>
      <div class="item-right">
        <span class="item-price">$${(parseFloat(item.price) * item.qty).toFixed(2)}</span>
        <select class="qty-select" onchange="updateQty(${index}, this.value)">
          ${[1,2,3,4,5,6,7,8,9,10].map(n =>
            `<option ${n === item.qty ? 'selected' : ''}>Qty: ${n}</option>`
          ).join('')}
        </select>
      </div>
    `;
    if (bottomActions) {
      cartCard.insertBefore(div, bottomActions);
    } else {
      cartCard.appendChild(div);
    }
  });

  calculateTotals();
}

// ===== REMOVE ITEM =====
function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

// ===== UPDATE QTY =====
function updateQty(index, value) {
  const cart = getCart();
  cart[index].qty = parseInt(value.replace('Qty: ', ''));
  saveCart(cart);
  calculateTotals();
  const items = document.querySelectorAll('.cart-item');
  if (items[index]) {
    items[index].querySelector('.item-price').textContent =
      `$${(parseFloat(cart[index].price) * cart[index].qty).toFixed(2)}`;
  }
}

// ===== REMOVE ALL =====
function removeAll() {
  localStorage.removeItem('cart');
  appliedCouponDiscount = 0;
  renderCart();
}

// ===== MOVE CART TO SAVED =====
function moveToSaved(index) {
  const cart  = getCart();
  const item  = cart[index];
  const saved = JSON.parse(localStorage.getItem('savedItems')) || [];
  const exists = saved.find(s => s.id === item.id);
  if (!exists) {
    saved.push({ id: item.id, title: item.title, price: item.price, image: item.image });
    localStorage.setItem('savedItems', JSON.stringify(saved));
  }
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
  renderSavedItems();
}

// ===== APPLY COUPON =====
const applyBtn = document.querySelector('.apply-coupon-btn');
if (applyBtn) {
  applyBtn.addEventListener('click', async function() {
    const code = document.querySelector('.coupon-input input').value.trim().toUpperCase();
    if (!code) { alert('Please enter a coupon code!'); return; }

    try {
      const res  = await fetch(`${CART_API_URL}/general/coupon`, {
        method:  'POST',
        headers: {'Content-Type': 'application/json'},
        body:    JSON.stringify({ code })
      });
      const data = await res.json();

      if (data.valid) {
        appliedCouponDiscount  = data.discount;
        this.textContent       = '✓ Applied!';
        this.style.color       = '#00B517';
        alert(data.message);
        calculateTotals();
      } else {
        alert(data.message);
      }
    } catch(err) {
      // Offline fallback
      const coupons = { 'SAVE10': 10, 'SAVE20': 20, 'FLAT50': 50, 'WELCOME': 15 };
      if (coupons[code]) {
        appliedCouponDiscount = coupons[code];
        this.textContent      = '✓ Applied!';
        this.style.color      = '#00B517';
        alert(`Coupon applied! $${coupons[code]} off`);
        calculateTotals();
      } else {
        alert('Invalid coupon code');
      }
    }
  });
}

// ===== CHECKOUT =====
const checkoutBtn = document.querySelector('.checkout-btn');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', async function() {
    const cart = getCart();
    if (cart.length === 0) { alert('Your cart is empty!'); return; }

    const user  = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('userToken');

    if (!token) {
      if (confirm('Please login to place order. Go to login page?')) {
        window.location.href = 'login.html';
      }
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);
    const discount = appliedCouponDiscount > 0 ? appliedCouponDiscount : (subtotal > 500 ? 60 : 0);
    const tax      = parseFloat((subtotal * 0.01).toFixed(2));
    const total    = subtotal - discount + tax;

    this.textContent = 'Placing order...';
    this.disabled    = true;

    try {
      const res  = await fetch(`${CART_API_URL}/general/order`, {
        method:  'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          items: cart, subtotal, discount, tax, total,
          coupon:     document.querySelector('.coupon-input input').value || null,
          user_email: user.email || 'guest',
          user_name:  user.name  || 'Guest'
        })
      });
      const data = await res.json();

      localStorage.removeItem('cart');
      appliedCouponDiscount = 0;

      this.textContent      = '✓ Order Placed!';
      this.style.background = '#00B517';

      setTimeout(() => {
        alert(`🎉 Order placed successfully!\nOrder ID: ${data.order_id}\nThank you for shopping!`);
        window.location.href = 'orders.html';
      }, 500);

    } catch(err) {
      alert('Error placing order. Please try again!');
      this.textContent      = 'Checkout';
      this.style.background = '';
      this.disabled         = false;
    }
  });
}

// ===== RENDER SAVED ITEMS =====
function renderSavedItems() {
  const saved   = JSON.parse(localStorage.getItem('savedItems')) || [];
  const section = document.querySelector('.saved-later-section');
  const grid    = document.querySelector('.saved-grid');
  if (!grid || !section) return;

  grid.innerHTML = '';

  if (saved.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  saved.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'saved-card';
    card.innerHTML = `
      <img src="${item.image}" alt="${item.title}" onerror="this.src='assets/images/smartwatch.png'"/>
      <p class="saved-price">$${parseFloat(item.price).toFixed(2)}</p>
      <p class="saved-title">${item.title}</p>
      <button class="move-to-cart-btn" onclick="moveSavedToCart(${index})">
        <i class="fas fa-shopping-cart"></i> Move to cart
      </button>
    `;
    grid.appendChild(card);
  });
}

// ===== MOVE SAVED TO CART =====
function moveSavedToCart(index) {
  const saved  = JSON.parse(localStorage.getItem('savedItems')) || [];
  const item   = saved[index];
  const cart   = getCart();
  const exists = cart.find(c => c.id === item.id);
  if (exists) {
    exists.qty += 1;
  } else {
    cart.push({ id: item.id, title: item.title, price: item.price, image: item.image, qty: 1 });
  }
  saveCart(cart);
  saved.splice(index, 1);
  localStorage.setItem('savedItems', JSON.stringify(saved));
  renderSavedItems();
  renderCart();
}

// ===== PAGE LOAD =====
renderCart();
renderSavedItems();