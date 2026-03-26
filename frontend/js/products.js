// =============================================
//  products.js — Product Listing Page Scripts
//  ecommerce-fullstack-design
// =============================================

// ===== DEBOUNCE FUNCTION =====
let debounceTimer;
function debounce(func, delay = 500) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(func, delay);
}

// ===== GRID / LIST VIEW TOGGLE =====
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const productList = document.getElementById('productList');

gridViewBtn.addEventListener('click', () => {
  productList.classList.add('grid-view');
  gridViewBtn.classList.add('active');
  listViewBtn.classList.remove('active');
});

listViewBtn.addEventListener('click', () => {
  productList.classList.remove('grid-view');
  listViewBtn.classList.add('active');
  gridViewBtn.classList.remove('active');
});

// ===== PAGINATION =====
document.querySelectorAll('.page-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ===== FILTER TOGGLE (collapse/expand) =====
document.querySelectorAll('.filter-header').forEach(header => {
  const section = header.closest('.filter-section');
  section.classList.add('open');

  header.addEventListener('click', () => {
    const icon    = header.querySelector('i');
    const content = section.querySelectorAll(':scope > *:not(.filter-header)');
    const isOpen  = section.classList.contains('open');

    if (isOpen) {
      content.forEach(el => { el.style.display = 'none'; });
      icon.classList.remove('fa-chevron-up');
      icon.classList.add('fa-chevron-down');
      section.classList.remove('open');
    } else {
      content.forEach(el => { el.style.display = ''; });
      icon.classList.remove('fa-chevron-down');
      icon.classList.add('fa-chevron-up');
      section.classList.add('open');
    }
  });
});

// ===== FILTER TAGS =====
const filterTagsContainer = document.getElementById('filterTags');

function updateFilterTags() {
  filterTagsContainer.innerHTML = '';

  const checked = document.querySelectorAll('.checkbox-list input[type="checkbox"]:checked');
  if (checked.length === 0) return;

  checked.forEach(input => {
    const labelEl    = input.closest('label');
    const dataRating = labelEl.getAttribute('data-rating');
    const tagText    = dataRating ? dataRating : labelEl.textContent.trim();

    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `
      <span>${tagText}</span>
      <button onclick="removeTag(this)" data-label="${tagText}">&#x2715;</button>
    `;
    filterTagsContainer.appendChild(tag);
  });

  const clearBtn       = document.createElement('button');
  clearBtn.className   = 'clear-all-btn';
  clearBtn.textContent = 'Clear all filter';
  clearBtn.onclick     = clearAllFilters;
  filterTagsContainer.appendChild(clearBtn);
}

function removeTag(btn) {
  const label = btn.getAttribute('data-label');
  document.querySelectorAll('.checkbox-list input[type="checkbox"]').forEach(input => {
    const labelEl    = input.closest('label');
    const dataRating = labelEl.getAttribute('data-rating');
    const current    = dataRating ? dataRating : labelEl.textContent.trim();
    if (current === label) {
      input.checked = false;
      input.dispatchEvent(new Event('change'));
    }
  });
  updateFilterTags();
}

function clearAllFilters() {
  document.querySelectorAll('.checkbox-list input[type="checkbox"]').forEach(input => {
    input.checked = false;
  });
  document.querySelectorAll('.radio-list input[type="radio"]').forEach((input, i) => {
    input.checked = i === 0;
  });
  activeFilters = {};
  updateFilterTags();
  debounce(() => loadProducts(activeFilters));
}

// ===== PRICE RANGE SLIDER =====
const priceMin = document.getElementById('priceMin');
const priceMax = document.getElementById('priceMax');
const minVal   = document.getElementById('minVal');
const maxVal   = document.getElementById('maxVal');
const slider   = document.querySelector('.price-slider');

function updateSliderTrack() {
  if (!priceMin || !priceMax) return;

  const min      = parseInt(priceMin.value);
  const max      = parseInt(priceMax.value);
  const total    = parseInt(priceMin.getAttribute('max'));
  const leftPct  = (min / total) * 100;
  const rightPct = 100 - (max / total) * 100;

  slider.style.background = `linear-gradient(to right,
    var(--deal-border) ${leftPct}%,
    var(--search-button) ${leftPct}%,
    var(--search-button) ${100 - rightPct}%,
    var(--deal-border) ${100 - rightPct}%)`;

  if (minVal && document.activeElement !== minVal) minVal.value = min;
  if (maxVal && document.activeElement !== maxVal) maxVal.value = max;
}

if (priceMin && priceMax) {
  priceMin.addEventListener('input', function() {
    if (parseInt(this.value) > parseInt(priceMax.value)) this.value = priceMax.value;
    updateSliderTrack();
  });

  priceMax.addEventListener('input', function() {
    if (parseInt(this.value) < parseInt(priceMin.value)) this.value = priceMin.value;
    updateSliderTrack();
  });

  if (minVal) {
    minVal.addEventListener('input', function() {
      let val = parseInt(this.value);
      if (isNaN(val)) return;
      if (val < 0) val = 0;
      if (val > parseInt(priceMax.value)) val = parseInt(priceMax.value);
      priceMin.value = val;
      this.value     = val;
      updateSliderTrack();
    });
  }

  if (maxVal) {
    maxVal.addEventListener('input', function() {
      let val = parseInt(this.value);
      if (isNaN(val)) return;
      if (val > 999999) val = 999999;
      if (val < parseInt(priceMin.value)) val = parseInt(priceMin.value);
      priceMax.value = val;
      this.value     = val;
      updateSliderTrack();
    });
  }

  updateSliderTrack();
}

// ===== ACTIVE FILTERS =====
let activeFilters = {};

// ===== LOAD PRODUCTS =====
async function loadProducts(filters = {}) {
  try {
    const list = document.getElementById('productList');
    if (!list) return;

    list.innerHTML = `
      <div style="padding:40px;text-align:center;width:100%;grid-column:1/-1">
        <i class="fas fa-spinner fa-spin" style="font-size:30px;color:var(--search-button)"></i>
        <p style="margin-top:10px;color:var(--topbar-gray)">Loading...</p>
      </div>`;

    const products = await getProducts(filters);
    list.innerHTML = '';

    if (products.length === 0) {
      list.innerHTML = `
        <div style="padding:60px 40px;text-align:center;width:100%;grid-column:1/-1">
          <i class="fas fa-search" style="font-size:48px;color:var(--deal-border)"></i>
          <h3 style="margin-top:16px;font-size:20px;font-weight:600;color:var(--all-category)">No results found</h3>
          <p style="margin-top:8px;color:var(--topbar-gray);font-size:16px;">We couldn't find any products matching your search or filters.</p>
          <p style="margin-top:4px;color:var(--topbar-gray);font-size:14px;">Try adjusting your filters or search with different keywords.</p>
          <button onclick="clearAllFilters()" style="margin-top:20px;background:var(--search-button);color:white;padding:10px 24px;border-radius:6px;font-size:16px;cursor:pointer;border:none;">
            Clear all filters
          </button>
        </div>`;
      document.getElementById('itemCount').textContent = '0';
      return;
    }

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-img">
          <img src="${product.image}" alt="${product.name}"/>
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <div class="product-price">
            <span class="current-price">$${product.price.toFixed(2)}</span>
            ${product.old_price ? `<span class="old-price">$${product.old_price.toFixed(2)}</span>` : ''}
          </div>
          <div class="product-meta">
            <span class="stars-small"><img src="assets/images/star4.png" alt=""/></span>
            <span class="rating-num">${product.rating}</span>
            <span class="dot">•</span>
            <span class="orders">${product.orders} orders</span>
            <span class="dot">•</span>
            ${product.free_shipping ? '<span class="free-shipping">Free Shipping</span>' : ''}
          </div>
          <p class="product-desc">${product.description}</p>
          <a href="product-detail.html?id=${product.id}" class="view-details">View details</a>
        </div>
        <button class="wishlist-btn"><i class="far fa-heart"></i></button>
      `;

      card.querySelector('.wishlist-btn').addEventListener('click', function() {
        this.classList.toggle('active');
        const icon = this.querySelector('i');
        icon.classList.toggle('far');
        icon.classList.toggle('fas');
      });

      list.appendChild(card);
    });

    document.getElementById('itemCount').textContent = products.length.toLocaleString();

  } catch (err) {
    console.error('Products load nahi hue:', err);
    document.getElementById('productList').innerHTML = `
      <p style="padding:20px;color:red">Error: Products load nahi hue. Backend check karo!</p>`;
  }
}

// ===== CATEGORY FILTER =====
document.querySelectorAll('.filter-list a').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelectorAll('.filter-list a').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
    activeFilters.category = this.textContent.trim();
    debounce(() => loadProducts(activeFilters));
  });
});

// ===== BRAND / FEATURES / RATINGS / MANUFACTURER FILTER =====
document.querySelectorAll('.checkbox-list input[type="checkbox"]').forEach(input => {
  input.addEventListener('change', function() {
    const labelEl      = this.closest('label');
    const dataRating   = labelEl.getAttribute('data-rating');
    const section      = this.closest('.filter-section');
    const sectionTitle = section.querySelector('.filter-header h4').textContent.trim();

    if (sectionTitle === 'Brands') {
      const checked = [...section.querySelectorAll('input:checked')]
        .map(i => i.closest('label').textContent.trim());
      activeFilters.brand = checked.join(',');
      if (!activeFilters.brand) delete activeFilters.brand;
    }

    if (sectionTitle === 'Features') {
      const checked = [...section.querySelectorAll('input:checked')]
        .map(i => i.closest('label').textContent.trim());
      activeFilters.features = checked.join(',');
      if (!activeFilters.features) delete activeFilters.features;
    }

    if (sectionTitle === 'Manufacturer') {
      const checked = [...section.querySelectorAll('input:checked')]
        .map(i => i.closest('label').textContent.trim());
      activeFilters.manufacturer = checked.join(',');
      if (!activeFilters.manufacturer) delete activeFilters.manufacturer;
    }

    if (sectionTitle === 'Ratings' && dataRating) {
      const ratingNum = parseFloat(dataRating.replace(' star', ''));
      if (this.checked) {
        activeFilters.rating = ratingNum;
      } else {
        delete activeFilters.rating;
      }
    }

    updateFilterTags();
    debounce(() => loadProducts(activeFilters));
  });
});

// ===== CONDITION FILTER =====
document.querySelectorAll('.radio-list input[type="radio"]').forEach(input => {
  input.addEventListener('change', function() {
    const label = this.closest('label').textContent.trim();
    if (label === 'Any') {
      delete activeFilters.condition;
    } else {
      activeFilters.condition = label;
    }
    debounce(() => loadProducts(activeFilters));
  });
});

// ===== PRICE RANGE APPLY =====
document.querySelector('.apply-btn').addEventListener('click', function() {
  const min = document.getElementById('minVal').value;
  const max = document.getElementById('maxVal').value;
  if (min) activeFilters.min_price = min;
  else delete activeFilters.min_price;
  if (max) activeFilters.max_price = max;
  else delete activeFilters.max_price;
  debounce(() => loadProducts(activeFilters), 300);
});

// ===== SEARCH =====
const searchBtn   = document.querySelector('.search-bar button');
const searchInput = document.getElementById('searchInput');

if (searchBtn) {
  searchBtn.addEventListener('click', function() {
    activeFilters.search = searchInput.value.trim();
    if (!activeFilters.search) delete activeFilters.search;
    loadProducts(activeFilters);
  });
}

if (searchInput) {
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      activeFilters.search = this.value.trim();
      if (!activeFilters.search) delete activeFilters.search;
      loadProducts(activeFilters);
    }
  });
}

// ===== URL SE SEARCH QUERY LO =====
const urlParams = new URLSearchParams(window.location.search);
const urlSearch = urlParams.get('search');
if (urlSearch) {
  activeFilters.search = urlSearch;
  if (searchInput) searchInput.value = urlSearch;
}

// ===== PAGE LOAD =====
loadProducts(activeFilters);