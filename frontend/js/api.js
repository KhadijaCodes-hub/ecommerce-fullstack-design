// =============================================
//  api.js — Backend API Connection
//  ecommerce-fullstack-design
// =============================================

const API_URL = 'http://127.0.0.1:8000/api';

// ===== GET ALL PRODUCTS =====
async function getProducts(filters = {}) {
  let url = `${API_URL}/products/?`;
  if (filters.category)     url += `category=${filters.category}&`;
  if (filters.search)       url += `search=${filters.search}&`;
  if (filters.brand)        url += `brand=${filters.brand}&`;
  if (filters.manufacturer) url += `manufacturer=${filters.manufacturer}&`;
  if (filters.condition)    url += `condition=${filters.condition}&`;
  if (filters.min_price)    url += `min_price=${filters.min_price}&`;
  if (filters.max_price)    url += `max_price=${filters.max_price}&`;
  if (filters.rating)       url += `rating=${filters.rating}&`;

  const res  = await fetch(url);
  const data = await res.json();
  return data;
}

// ===== GET SINGLE PRODUCT =====
async function getProduct(id) {
  const res  = await fetch(`${API_URL}/products/${id}`);
  const data = await res.json();
  return data;
}

// ===== CREATE PRODUCT =====
async function createProduct(product) {
  const res = await fetch(`${API_URL}/products/`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(product)
  });
  return await res.json();
}

// ===== UPDATE PRODUCT =====
async function updateProduct(id, product) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(product)
  });
  return await res.json();
}

// ===== DELETE PRODUCT =====
async function deleteProduct(id) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE'
  });
  return await res.json();
}