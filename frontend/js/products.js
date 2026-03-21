// =============================================
//  products.js — Product Listing Page Scripts
//  ecommerce-fullstack-design
// =============================================

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

// ===== WISHLIST TOGGLE =====
document.querySelectorAll('.wishlist-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    icon.classList.toggle('far');
    icon.classList.toggle('fas');
  });
});

// ===== PAGINATION =====
document.querySelectorAll('.page-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ===== FILTER TOGGLE (collapse/expand) =====
// ===== FILTER TOGGLE (collapse/expand) =====
// ===== FILTER TOGGLE (collapse/expand) =====
document.querySelectorAll('.filter-header').forEach(header => {
  // ✅ section yahan define karo — loop ke andar
  const section = header.closest('.filter-section');

  // Default: sab open rakho
  section.classList.add('open');

  header.addEventListener('click', () => {
    const icon = header.querySelector('i');
    const content = section.querySelectorAll(':scope > *:not(.filter-header)');
    const isOpen = section.classList.contains('open');

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

// ===== SEARCH =====
document.getElementById('searchInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    const q = this.value.trim();
    if (q) window.location.href = `products.html?search=${encodeURIComponent(q)}`;
  }
});

// ===== FILTER TAGS =====
const filterTagsContainer = document.getElementById('filterTags');

function updateFilterTags() {
  filterTagsContainer.innerHTML = '';

  const checked = document.querySelectorAll(
    '.checkbox-list input[type="checkbox"]:checked'
  );

  if (checked.length === 0) return;

  checked.forEach(input => {
    const labelEl = input.closest('label');

    // Rating wale label ka text alag se nikalo
    const starsImg = labelEl.querySelector('.stars img');
    let tagText = '';

    // data-rating attribute se directly lo
    const dataRating = labelEl.getAttribute('data-rating');
    if (dataRating) {
      tagText = dataRating;
    } else {
      tagText = labelEl.textContent.trim();
    }

    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `
      <span>${tagText}</span>
      <button onclick="removeTag(this)" data-label="${tagText}">&#x2715;</button>
    `;
    filterTagsContainer.appendChild(tag);
  });

  // Clear all button
  const clearBtn = document.createElement('button');
  clearBtn.className = 'clear-all-btn';
  clearBtn.textContent = 'Clear all filter';
  clearBtn.onclick = clearAllFilters;
  filterTagsContainer.appendChild(clearBtn);
}

function removeTag(btn) {
  const label = btn.getAttribute('data-label');

  document.querySelectorAll('.checkbox-list input[type="checkbox"]').forEach(input => {
    const labelEl = input.closest('label');
    const starsImg = labelEl.querySelector('.stars img');

    let currentLabel = '';
    const dataRating = labelEl.getAttribute('data-rating');
    if (dataRating) {
      currentLabel = dataRating;
    } else {
      currentLabel = labelEl.textContent.trim();
    }

    if (currentLabel === label) input.checked = false;
  });

  updateFilterTags();
}

function clearAllFilters() {
  document.querySelectorAll('.checkbox-list input[type="checkbox"]').forEach(input => {
    input.checked = false;
  });
  updateFilterTags();
}

// Har checkbox change pe tags update karo
document.querySelectorAll('.checkbox-list input[type="checkbox"]').forEach(input => {
  input.addEventListener('change', updateFilterTags);
});

// ===== PRICE RANGE SLIDER =====
const priceMin = document.getElementById('priceMin');
const priceMax = document.getElementById('priceMax');
const minVal   = document.getElementById('minVal');
const maxVal   = document.getElementById('maxVal');
const slider   = document.querySelector('.price-slider');

function updateSliderTrack() {
  if (!priceMin || !priceMax) return;

  const min     = parseInt(priceMin.value);
  const max     = parseInt(priceMax.value);
  const total   = parseInt(priceMin.getAttribute('max'));
  const leftPct = (min / total) * 100;
  const rightPct = 100 - (max / total) * 100;

  slider.style.background = `linear-gradient(to right,
    var(--deal-border) ${leftPct}%,
    var(--search-button) ${leftPct}%,
    var(--search-button) ${100 - rightPct}%,
    var(--deal-border) ${100 - rightPct}%)`;

  // Sirf tab update karo jab user us field mein type na kar raha ho
  if (minVal && document.activeElement !== minVal) minVal.value = min;
  if (maxVal && document.activeElement !== maxVal) maxVal.value = max;
}

if (priceMin && priceMax) {

  // Slider min handle
  priceMin.addEventListener('input', function() {
    if (parseInt(this.value) > parseInt(priceMax.value)) {
      this.value = priceMax.value;
    }
    updateSliderTrack();
  });

  // Slider max handle
  priceMax.addEventListener('input', function() {
    if (parseInt(this.value) < parseInt(priceMin.value)) {
      this.value = priceMin.value;
    }
    updateSliderTrack();
  });

  // Min input field
  if (minVal) {
    minVal.addEventListener('input', function() {
      let val = parseInt(this.value);
      if (isNaN(val)) return;
      if (val < 0) val = 0;
      if (val > parseInt(priceMax.value)) val = parseInt(priceMax.value);
      priceMin.value = val;
      this.value = val;
      updateSliderTrack();
    });
  }

  // Max input field
  if (maxVal) {
    maxVal.addEventListener('input', function() {
      let val = parseInt(this.value);
      if (isNaN(val)) return;
      if (val > 999999) val = 999999;
      if (val < parseInt(priceMin.value)) val = parseInt(priceMin.value);
      priceMax.value = val;
      this.value = val;
      updateSliderTrack();
    });
  }

  // Initial track draw
  updateSliderTrack();
}