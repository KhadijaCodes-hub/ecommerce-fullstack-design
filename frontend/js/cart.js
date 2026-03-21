// =============================================
//  cart.js — Cart Page Scripts
//  ecommerce-fullstack-design
// =============================================

// ===== REMOVE ITEM =====
function removeItem(itemId) {
  const item = document.getElementById(itemId);
  if (item) {
    item.style.opacity = '0';
    item.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      item.remove();
      updateCartCount();
    }, 300);
  }
}

// ===== REMOVE ALL =====
function removeAll() {
  document.querySelectorAll('.cart-item').forEach(item => {
    item.style.opacity = '0';
    item.style.transition = 'opacity 0.3s';
    setTimeout(() => item.remove(), 300);
  });
  setTimeout(() => {
    document.getElementById('cartCount').textContent = '(0)';
  }, 400);
}

// ===== UPDATE CART COUNT =====
function updateCartCount() {
  const count = document.querySelectorAll('.cart-item').length;
  document.getElementById('cartCount').textContent = `(${count})`;
}

// ===== SAVE FOR LATER =====
function saveForLater(itemId) {
  removeItem(itemId);
}

// ===== UPDATE QTY =====
function updateQty() {
  // Future: recalculate totals
}

// ===== MOVE TO CART =====
document.querySelectorAll('.move-to-cart-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const card = this.closest('.saved-card');
    card.style.opacity = '0';
    card.style.transition = 'opacity 0.3s';
    setTimeout(() => card.remove(), 300);
  });
});

// ===== APPLY COUPON =====
document.querySelector('.apply-coupon-btn').addEventListener('click', function() {
  const code = document.querySelector('.coupon-input input').value.trim();
  if (code) {
    alert(`Coupon "${code}" applied!`);
  }
});