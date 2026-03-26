// =============================================
//  home.js — Home Page Scripts
//  ecommerce-fullstack-design
// =============================================

// ===== CATEGORY DROPDOWN =====
function toggleCatDropdown(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('catDropdown');
  dropdown.classList.toggle('open');
}

function selectCat(el, value) {
  event.stopPropagation();
  document.getElementById('catSelected').textContent = value;
  document.querySelectorAll('.cat-dropdown-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('catDropdown').classList.remove('open');
}

document.addEventListener('click', function(e) {
  const cat = document.getElementById('catDropdown');
  if (cat && !cat.contains(e.target)) {
    cat.classList.remove('open');
  }
});


// ===== HELP DROPDOWN =====
function toggleHelp(e) {
  e.preventDefault();
  const wrapper = document.querySelector('.help-dropdown-wrapper');
  wrapper.classList.toggle('open');
}

// Bahar click se band ho
document.addEventListener('click', function(e) {
  const help = document.querySelector('.help-dropdown-wrapper');
  if (help && !help.contains(e.target)) {
    help.classList.remove('open');
  }
});


// ===== LANGUAGE DROPDOWN =====
function toggleLang() {
  const dropdown = document.getElementById('langDropdown');
  dropdown.classList.toggle('open');
}

function selectLang(el, value) {
  document.getElementById('langSelected').textContent = value;
  document.getElementById('langDropdown').classList.remove('open');
  event.stopPropagation();
}

// Bahar click se band ho
document.addEventListener('click', function(e) {
  const lang = document.getElementById('langDropdown');
  if (lang && !lang.contains(e.target)) {
    lang.classList.remove('open');
  }
});


// ===== SHIP TO DROPDOWN =====
function toggleShipTo() {
  const dropdown = document.getElementById('shipToDropdown');
  dropdown.classList.toggle('open');
}

function selectCountry(el, flagSrc, code) {
  // Flag update karo
  const flagImg = document.querySelector('.ship-to .flag-emoji img');
  flagImg.src = flagSrc;
  // Close dropdown
  document.getElementById('shipToDropdown').classList.remove('open');
  event.stopPropagation();
}

// Bahar click karne se band ho
document.addEventListener('click', function(e) {
  const dropdown = document.getElementById('shipToDropdown');
  if (dropdown && !dropdown.contains(e.target)) {
    dropdown.classList.remove('open');
  }
});

// ===== COUNTDOWN TIMER =====
const endTime = new Date();
endTime.setDate(endTime.getDate() + 4);
endTime.setHours(endTime.getHours() + 13);
endTime.setMinutes(endTime.getMinutes() + 34);

function updateCountdown() {
  const now  = new Date();
  const diff = endTime - now;
  if (diff <= 0) return;

  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('days').textContent  = String(d).padStart(2, '0');
  document.getElementById('hours').textContent = String(h).padStart(2, '0');
  document.getElementById('mins').textContent  = String(m).padStart(2, '0');
  document.getElementById('secs').textContent  = String(s).padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ===== SEARCH =====
function handleSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (q) {
    window.location.href = `products.html?search=${encodeURIComponent(q)}`;
  }
}

document.getElementById('searchInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') handleSearch();
});

// ===== FOOTER LANGUAGE DROPDOWN =====
function toggleFooterLang() {
  const el = document.getElementById('footerLang');
  el.classList.toggle('open');
}

function selectFooterLang(option, flagSrc, langText) {
  document.getElementById('footerFlag').src    = flagSrc;
  document.getElementById('footerLangText').textContent = langText;
  document.getElementById('footerLang').classList.remove('open');
  event.stopPropagation();
}

document.addEventListener('click', function(e) {
  const el = document.getElementById('footerLang');
  if (el && !el.contains(e.target)) {
    el.classList.remove('open');
  }
});

// ===== FETCH FEATURED PRODUCTS =====
async function loadFeaturedProducts() {
  try {
    const products = await getProducts();
    const grid = document.querySelector('.rec-grid');
    if (!grid) return;

    // Grid clear karo
    grid.innerHTML = '';

    // Products render karo
    products.forEach(product => {
      const card = document.createElement('a');
      card.href = `product-detail.html?id=${product.id}`;
      card.className = 'rec-card';
      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}"/>
        <div class="price">$${product.price.toFixed(2)}</div>
        <div class="desc">${product.name}</div>
      `;
      grid.appendChild(card);
    });

  } catch (err) {
    console.error('Products load nahi hue:', err);
  }
}

// Page load hone pe call karo
loadFeaturedProducts();

// ===== HOME PAGE SEARCH =====
const homeSearchBtn   = document.querySelector('.search-bar button');
const homeSearchInput = document.getElementById('searchInput');

if (homeSearchBtn) {
  homeSearchBtn.addEventListener('click', function() {
    const q = homeSearchInput.value.trim();
    if (q) window.location.href = `products.html?search=${encodeURIComponent(q)}`;
  });
}

if (homeSearchInput) {
  homeSearchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      const q = this.value.trim();
      if (q) window.location.href = `products.html?search=${encodeURIComponent(q)}`;
    }
  });
}