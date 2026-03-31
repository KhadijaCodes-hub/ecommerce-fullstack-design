// =============================================
//  admin.js — Admin Panel Scripts
//  ecommerce-fullstack-design
// =============================================

const ADMIN_API_URL = 'http://127.0.0.1:8000/api';
let deleteProductId = null;
let allProducts     = [];

// ===== AUTH CHECK =====
function checkAdminAuth() {
  const token = localStorage.getItem('adminToken');
  const user  = JSON.parse(localStorage.getItem('adminUser') || '{}');

  if (!token || user.role !== 'admin') {
    window.location.href = 'login.html';
    return false;
  }

  document.getElementById('adminName').textContent = user.name || 'Admin';
  return true;
}

// ===== LOGOUT =====
function logoutAdmin() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = 'login.html';
}

// ===== SECTION SWITCH =====
function showSection(name) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-sidebar li').forEach(l => l.classList.remove('active'));

  document.getElementById(`section-${name}`).classList.add('active');

  const sidebarItems = document.querySelectorAll('.admin-sidebar li');
  const map = { 'products': 0, 'add-product': 1, 'users': 2 };
  if (map[name] !== undefined) sidebarItems[map[name]].classList.add('active');

  if (name === 'products') loadProducts();
  if (name === 'users')    loadUsers();
  if (name === 'add-product') {
    document.getElementById('formTitle').textContent = 'Add New Product';
    document.getElementById('submitBtn').innerHTML   = '<i class="fas fa-save"></i> Save Product';
    document.getElementById('editProductId').value  = '';
    resetForm();
  }
}

// ===== TOAST =====
function showToast(msg, type = 'success') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className   = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== LOAD PRODUCTS =====
async function loadProducts() {
  try {
    const res      = await fetch(`${ADMIN_API_URL }/products/`);
    const products = await res.json();
    allProducts    = products;

    // Stats
    document.getElementById('totalProducts').textContent   = products.length;
    const cats = [...new Set(products.map(p => p.category))];
    document.getElementById('totalCategories').textContent = cats.length;
    document.getElementById('freeShippingCount').textContent = products.filter(p => p.free_shipping).length;

    renderTable(products);

  } catch (err) {
    showToast('Products load nahi hue!', 'error');
  }
}

// ===== RENDER TABLE =====
function renderTable(products) {
  const tbody = document.getElementById('productsTableBody');

  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:gray">No products found</td></tr>';
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.image}" alt="${p.name}" class="product-img-thumb"/></td>
      <td><strong>${p.name}</strong></td>
      <td><span style="background:#e8f0fe;color:#1a73e8;padding:3px 8px;border-radius:12px;font-size:13px">${p.category}</span></td>
      <td><strong>$${p.price.toFixed(2)}</strong></td>
      <td>${p.stock}</td>
      <td>
        <div class="table-actions">
          <button class="edit-btn" onclick="editProduct('${p.id}')">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="delete-btn" onclick="openDeleteModal('${p.id}')">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ===== FILTER TABLE =====
function filterTable() {
  const q       = document.getElementById('adminSearch').value.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
  renderTable(filtered);
}

// ===== EDIT PRODUCT =====
async function editProduct(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  showSection('add-product');

  document.getElementById('formTitle').textContent  = 'Edit Product';
  document.getElementById('submitBtn').innerHTML    = '<i class="fas fa-save"></i> Update Product';
  document.getElementById('editProductId').value   = id;

  document.getElementById('prodName').value         = product.name;
  document.getElementById('prodCategory').value     = product.category;
  document.getElementById('prodPrice').value        = product.price;
  document.getElementById('prodOldPrice').value     = product.old_price || '';
  document.getElementById('prodStock').value        = product.stock;
  document.getElementById('prodBrand').value        = product.brand || '';
  document.getElementById('prodManufacturer').value = product.manufacturer || '';
  document.getElementById('prodCondition').value    = product.condition || 'Brand new';
  document.getElementById('prodRating').value       = product.rating || '';
  document.getElementById('prodOrders').value       = product.orders || '';
  document.getElementById('prodImage').value        = product.image;
  document.getElementById('prodDescription').value  = product.description;
  document.getElementById('prodFreeShipping').checked = product.free_shipping;
}

// ===== SUBMIT PRODUCT =====
async function submitProduct(e) {
  e.preventDefault();

  const token = localStorage.getItem('adminToken');
  const id    = document.getElementById('editProductId').value;

  const data = {
    name:          document.getElementById('prodName').value,
    category:      document.getElementById('prodCategory').value,
    price:         parseFloat(document.getElementById('prodPrice').value),
    old_price:     parseFloat(document.getElementById('prodOldPrice').value) || null,
    stock:         parseInt(document.getElementById('prodStock').value),
    brand:         document.getElementById('prodBrand').value || null,
    manufacturer:  document.getElementById('prodManufacturer').value || null,
    condition:     document.getElementById('prodCondition').value,
    rating:        parseFloat(document.getElementById('prodRating').value) || 7.5,
    orders:        parseInt(document.getElementById('prodOrders').value) || 0,
    image:         document.getElementById('prodImage').value,
    description:   document.getElementById('prodDescription').value,
    free_shipping: document.getElementById('prodFreeShipping').checked,
  };

  try {
    const btn = document.getElementById('submitBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    btn.disabled  = true;

    const url    = id ? `${ADMIN_API_URL }/products/${id}` : `${ADMIN_API_URL }/products/`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Failed');

    showToast(id ? 'Product updated!' : 'Product added!', 'success');
    resetForm();
    showSection('products');

  } catch (err) {
    showToast('Error saving product!', 'error');
  } finally {
    const btn = document.getElementById('submitBtn');
    btn.innerHTML = '<i class="fas fa-save"></i> Save Product';
    btn.disabled  = false;
  }
}

// ===== RESET FORM =====
function resetForm() {
  document.getElementById('productForm').reset();
  document.getElementById('editProductId').value = '';
}

// ===== DELETE MODAL =====
function openDeleteModal(id) {
  deleteProductId = id;
  document.getElementById('deleteModal').classList.add('open');
}

function closeModal() {
  deleteProductId = null;
  document.getElementById('deleteModal').classList.remove('open');
}

async function confirmDelete() {
  if (!deleteProductId) return;

  const token = localStorage.getItem('adminToken');

  try {
    const res = await fetch(`${ADMIN_API_URL }/products/${deleteProductId}`, {
      method:  'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed');

    showToast('Product deleted!', 'success');
    closeModal();
    loadProducts();

  } catch (err) {
    showToast('Error deleting product!', 'error');
    closeModal();
  }
}

// ===== LOAD USERS =====
async function loadUsers() {
  const token = localStorage.getItem('adminToken');
  try {
    const res   = await fetch(`${ADMIN_API_URL }/auth/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const users = await res.json();
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td><span style="background:${u.role==='admin'?'#e8f0fe':'#f0fdf4'};color:${u.role==='admin'?'#1a73e8':'#16a34a'};padding:3px 8px;border-radius:12px;font-size:13px">${u.role}</span></td>
      </tr>
    `).join('');
  } catch (err) {
    document.getElementById('usersTableBody').innerHTML =
      '<tr><td colspan="3" style="text-align:center;padding:20px;color:gray">Could not load users</td></tr>';
  }
}

// ===== PAGE LOAD =====
if (checkAdminAuth()) {
  loadProducts();
}