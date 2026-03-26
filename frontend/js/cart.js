// =============================================
//  cart.js — Cart Page Scripts
//  ecommerce-fullstack-design
// =============================================

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
  const discount = subtotal > 500 ? 60 : 0;
  const tax      = parseFloat((subtotal * 0.01).toFixed(2));
  const total    = subtotal - discount + tax;

  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('total').textContent    = `$${total.toFixed(2)}`;

  const discountEl = document.querySelector('.discount-val');
  const taxEl      = document.querySelector('.tax-val');
  if (discountEl) discountEl.textContent = `- $${discount.toFixed(2)}`;
  if (taxEl)      taxEl.textContent      = `+ $${tax.toFixed(2)}`;
}

// ===== RENDER CART =====
function renderCart() {
  const cart     = getCart();
  const cartCard = document.querySelector('.cart-card');
  if (!cartCard) return;

  // Bottom actions save karo
  const bottomActions = cartCard.querySelector('.cart-bottom-actions');

  // Purane items hatao
  cartCard.querySelectorAll('.cart-item').forEach(item => item.remove());

  // Cart title count
  document.getElementById('cartCount').textContent = `(${cart.length})`;

  if (cart.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:60px;text-align:center;';
    empty.innerHTML = `
      <i class="fas fa-shopping-cart" style="font-size:48px;color:var(--deal-border)"></i>
      <h3 style="margin-top:16px;color:var(--all-category)">Your cart is empty</h3>
      <p style="color:var(--topbar-gray);margin-top:8px">Add some products to get started!</p>
      <a href="products.html" style="display:inline-block;margin-top:16px;background:var(--search-button);color:white;padding:10px 24px;border-radius:6px;">
        Browse Products
      </a>
    `;
    cartCard.insertBefore(empty, bottomActions);
    calculateTotals();
    return;
  }

  // Items render karo
  cart.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.id        = `item-${index}`;
    div.innerHTML = `
      <div class="item-img">
        <img src="${item.image}" alt="${item.title}"/>
      </div>
      <div class="item-info">
        <h4>${item.title}</h4>
        <p class="item-seller">Price: $${item.price.toFixed(2)} each</p>
        <div class="item-actions">
          <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
          <button class="save-btn">Save for later</button>
        </div>
      </div>
      <div class="item-right">
        <span class="item-price">$${(item.price * item.qty).toFixed(2)}</span>
        <select class="qty-select" onchange="updateQty(${index}, this.value)">
          ${[1,2,3,4,5,6,7,8,9,10].map(n =>
            `<option ${n === item.qty ? 'selected' : ''}>Qty: ${n}</option>`
          ).join('')}
        </select>
      </div>
    `;
    cartCard.insertBefore(div, bottomActions);
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

  // Price update karo
  const items = document.querySelectorAll('.cart-item');
  if (items[index]) {
    items[index].querySelector('.item-price').textContent =
      `$${(cart[index].price * cart[index].qty).toFixed(2)}`;
  }
}

// ===== REMOVE ALL =====
function removeAll() {
  localStorage.removeItem('cart');
  renderCart();
}

// ===== APPLY COUPON =====
document.querySelector('.apply-coupon-btn').addEventListener('click', function() {
  const code = document.querySelector('.coupon-input input').value.trim().toUpperCase();
  if (code === 'SAVE10') {
    alert('Coupon applied! $10 discount added.');
  } else if (code) {
    alert(`Coupon "${code}" is invalid.`);
  }
});

// ===== MOVE TO CART (saved items) =====
document.querySelectorAll('.move-to-cart-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const card  = this.closest('.saved-card');
    const title = card.querySelector('.saved-title').textContent;
    const price = parseFloat(card.querySelector('.saved-price').textContent.replace('$', ''));
    const image = card.querySelector('img').src;

    const cart = getCart();
    cart.push({ id: Date.now().toString(), title, price, image, qty: 1 });
    saveCart(cart);
    renderCart();

    card.style.opacity    = '0';
    card.style.transition = 'opacity 0.3s';
    setTimeout(() => card.remove(), 300);
  });
});

// ===== PAGE LOAD =====
renderCart();