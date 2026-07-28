/* ===== Quick Pizza - App.js ===== */
const API = '';
let currentUser = null;
let cartData = null;
let allProducts = [];
let allCategories = [];
let currentPage = 'home';
let currentCategory = null;
let favorites = JSON.parse(localStorage.getItem('qp_favorites') || '[]');
let selectedPayment = 'cash';
let heroTimer = null;
let heroProgressTimer = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  initApp();
  startHeroSlider();
  initScrollHeader();
  setTimeout(() => {
    document.getElementById('splash-screen').classList.add('fade-out');
    setTimeout(() => document.getElementById('splash-screen').style.display = 'none', 600);
  }, 2000);
});

function loadFromStorage() {
  const token = localStorage.getItem('qp_token');
  const user = localStorage.getItem('qp_user');
  if (token && user) {
    currentUser = JSON.parse(user);
    updateAuthUI();
  }
}

function saveToStorage(token, user) {
  localStorage.setItem('qp_token', token);
  localStorage.setItem('qp_user', JSON.stringify(user));
  currentUser = user;
}

function clearStorage() {
  localStorage.removeItem('qp_token');
  localStorage.removeItem('qp_user');
  currentUser = null;
  cartData = null;
}

function getHeaders() {
  const token = localStorage.getItem('qp_token');
  return token
    ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

// ===== API HELPERS =====
async function apiGet(url) {
  const res = await fetch(API + url, { headers: getHeaders() });
  if (!res.ok) throw new Error((await res.json()).error || 'Error');
  return res.json();
}

async function apiPost(url, data) {
  const res = await fetch(API + url, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error((await res.json()).error || 'Error');
  return res.json();
}

async function apiPut(url, data) {
  const res = await fetch(API + url, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) });
  if (!res.ok) throw new Error((await res.json()).error || 'Error');
  return res.json();
}

async function apiDelete(url) {
  const res = await fetch(API + url, { method: 'DELETE', headers: getHeaders() });
  if (!res.ok) throw new Error((await res.json()).error || 'Error');
  return res.json();
}

// ===== INIT APP =====
async function initApp() {
  try {
    [allCategories, allProducts] = await Promise.all([
      apiGet('/api/categories'),
      apiGet('/api/products')
    ]);
    renderHomeCategories();
    renderFeaturedProducts();
    renderPopularProducts();
    renderMenuSidebar();
    renderMenuProducts(allProducts);
    if (currentUser) {
      try { await loadCart(); } catch (e) {}
      initPushNotifications();
    }
    updateLocationUI();
  } catch (error) {
    console.error('Init error:', error);
  }
}

// ===== SCROLL HEADER =====
function initScrollHeader() {
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    const scrollY = window.scrollY;
    header.classList.toggle('scrolled', scrollY > 10);
    lastScroll = scrollY;
  });
}

// ===== HERO SLIDER =====
function startHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dotsContainer = document.getElementById('hero-dots');
  const progressBar = document.getElementById('hero-progress');
  let current = 0;
  const INTERVAL = 5000;

  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.onclick = () => { goTo(i); resetTimer(); };
    dotsContainer.appendChild(dot);
  });

  function goTo(idx) {
    slides[current].classList.remove('active');
    document.querySelectorAll('.hero-dot')[current].classList.remove('active');
    current = idx;
    slides[current].classList.add('active');
    document.querySelectorAll('.hero-dot')[current].classList.add('active');
    progressBar.style.animation = 'none';
    progressBar.offsetHeight;
    progressBar.style.animation = '';
  }

  function resetTimer() {
    progressBar.style.animation = 'none';
    progressBar.offsetHeight;
    progressBar.style.animation = '';
  }

  heroProgressTimer = setInterval(() => {
    goTo((current + 1) % slides.length);
  }, INTERVAL);
}

// ===== NAVIGATION =====
function navigateTo(page, data) {
  // Cleanup tracking timers
  if (trackingInterval) { clearInterval(trackingInterval); trackingInterval = null; }
  if (trackingCountdown) { clearInterval(trackingCountdown); trackingCountdown = null; }
  if (ordersAutoRefresh) { clearInterval(ordersAutoRefresh); ordersAutoRefresh = null; }
  if (omAutoRefresh) { clearInterval(omAutoRefresh); omAutoRefresh = null; }
  
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');

  document.querySelectorAll('.bnav-item').forEach(b => b.classList.remove('active'));
  const idx = { home: 0, menu: 1, cart: 2, orders: 3 };
  const navItems = document.querySelectorAll('.bnav-item');
  if (idx[page] !== undefined && navItems[idx[page]]) {
    navItems[idx[page]].classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  switch (page) {
    case 'home': loadHomePage(); break;
    case 'menu': if (data) filterByCategory(data); break;
    case 'cart': if (!currentUser) { showAuthModal(); return; } loadCartPage(); break;
    case 'orders': if (!currentUser) { showAuthModal(); return; } loadOrdersPage(); startOrdersAutoRefresh(); break;
    case 'tracking': if (data) loadTrackingPage(data); break;
    case 'admin':
      if (!currentUser || currentUser.role !== 'admin') {
        showToast('مش مصرح ليك بالدخول');
        navigateTo('home');
        return;
      }
      loadAdminDashboard();
      break;
    case 'order-manager':
      if (!currentUser || currentUser.role !== 'admin') {
        showToast('مش مصرح ليك بالدخول');
        navigateTo('home');
        return;
      }
      loadOrderManager();
      startOMClock();
      startOMAutoRefresh();
      break;
  }
}

function loadHomePage() {
  renderHomeCategories();
  renderFeaturedProducts();
  renderPopularProducts();
}

// ===== SEARCH =====
function toggleSearch() {
  const el = document.getElementById('search-expand');
  const toggle = document.getElementById('search-toggle');
  el.classList.toggle('hidden');
  if (!el.classList.contains('hidden')) {
    document.getElementById('search-input').focus();
  }
}

let searchTimeout;
function handleSearch(value) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (currentPage !== 'menu') navigateTo('menu');
    if (!value.trim()) {
      renderMenuProducts(currentCategory ? allProducts.filter(p => p.category?._id === currentCategory) : allProducts);
      return;
    }
    const q = value.toLowerCase();
    const filtered = allProducts.filter(p =>
      p.nameAr.includes(value) || p.name.toLowerCase().includes(q) ||
      p.descriptionAr?.includes(value) || p.tags?.some(t => t.includes(q))
    );
    renderMenuProducts(filtered);
  }, 250);
}

// ===== CATEGORIES =====
function renderHomeCategories() {
  const c = document.getElementById('home-categories');
  c.innerHTML = allCategories.map(cat => `
    <div class="category-pill" onclick="navigateTo('menu', '${cat._id}')">
      <span class="category-pill-icon">${cat.icon}</span>
      <div class="category-pill-name">${cat.nameAr}</div>
    </div>
  `).join('');
}

function renderMenuSidebar() {
  const c = document.getElementById('menu-sidebar');
  c.innerHTML = `
    <div class="menu-sidebar-item active" onclick="filterByCategory(null, this)">
      <span class="menu-sidebar-icon">📋</span><span>الكل</span>
    </div>
    ${allCategories.map(cat => `
      <div class="menu-sidebar-item" onclick="filterByCategory('${cat._id}', this)">
        <span class="menu-sidebar-icon">${cat.icon}</span><span>${cat.nameAr}</span>
      </div>
    `).join('')}
  `;
}

function filterByCategory(catId, el) {
  currentCategory = catId;
  document.querySelectorAll('.menu-sidebar-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
  else if (catId) {
    const items = document.querySelectorAll('.menu-sidebar-item');
    items.forEach((item, idx) => {
      if (idx > 0 && allCategories[idx - 1]?._id === catId) item.classList.add('active');
    });
  }
  const filtered = catId ? allProducts.filter(p => p.category?._id === catId) : allProducts;
  const cat = allCategories.find(c => c._id === catId);
  document.getElementById('menu-title').textContent = cat ? cat.nameAr : 'القائمة';
  renderMenuProducts(filtered);
}

function filterProducts(filter, el) {
  document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  let filtered = currentCategory ? allProducts.filter(p => p.category?._id === currentCategory) : [...allProducts];
  if (filter === 'popular') filtered = filtered.filter(p => p.isPopular);
  if (filter === 'new') filtered = filtered.filter(p => p.isFeatured);
  renderMenuProducts(filtered);
}

// ===== PRODUCTS =====
function getProductEmoji(product) {
  const catName = product.category?.name || '';
  const map = { Pizza: '🍕', Manakish: '🫓', Sides: '🍟', Drinks: '🥤', Desserts: '🍰', Combo: '🍽️' };
  return map[catName] || '🍕';
}

function renderFeaturedProducts() {
  const c = document.getElementById('featured-products');
  const featured = allProducts.filter(p => p.isFeatured).slice(0, 8);
  c.innerHTML = featured.map(p => productCard(p)).join('');
}

function renderPopularProducts() {
  const c = document.getElementById('popular-products');
  const popular = allProducts.filter(p => p.isPopular).slice(0, 8);
  c.innerHTML = popular.map(p => productCard(p)).join('');
}

function renderMenuProducts(products) {
  const c = document.getElementById('menu-products');
  if (products.length === 0) {
    c.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-emoji">🔍</div><h3>مفيش منتجات</h3><p>جرّب تبحث عن حاجة تانية</p></div>';
    return;
  }
  c.innerHTML = products.map(p => productCard(p)).join('');
}

function productCard(p) {
  const emoji = getProductEmoji(p);
  const basePrice = p.sizes?.[0]?.price || p.price;
  const isFav = favorites.includes(p._id);

  let badges = '';
  if (p.isFeatured) badges += '<span class="product-badge featured">⭐ مميز</span>';
  if (p.isPopular) badges += '<span class="product-badge popular">🔥 الأكثر مبيعاً</span>';

  return `
    <div class="product-card" onclick="openProductModal('${p._id}')">
      <div class="product-img">
        <div class="product-img-bg"></div>
        ${p.image ? `<img src="${p.image}" alt="${p.nameAr}" style="width:100%;height:100%;object-fit:cover;border-radius:12px">` : `<span class="product-emoji">${emoji}</span>`}
        <div class="product-badges">${badges}</div>
        <button class="product-fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${p._id}')">
          ${isFav ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="product-body">
        <div class="product-name">${p.nameAr}</div>
        <div class="product-desc">${p.descriptionAr || p.description}</div>
        <div class="product-meta">
          <div class="product-price">${basePrice} <small>جنيه</small></div>
          <button class="product-add-btn" onclick="event.stopPropagation(); quickAdd('${p._id}')">+</button>
        </div>
      </div>
    </div>
  `;
}

// ===== FAVORITES =====
function toggleFavorite(productId) {
  const idx = favorites.indexOf(productId);
  if (idx > -1) favorites.splice(idx, 1);
  else favorites.push(productId);
  localStorage.setItem('qp_favorites', JSON.stringify(favorites));
  showToast(idx > -1 ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة ❤️');
  // Re-render current view
  if (currentPage === 'menu') {
    renderMenuProducts(currentCategory ? allProducts.filter(p => p.category?._id === currentCategory) : allProducts);
  } else {
    renderFeaturedProducts();
    renderPopularProducts();
  }
}

// ===== PRODUCT MODAL =====
function openProductModal(productId) {
  const product = allProducts.find(p => p._id === productId);
  if (!product) return;
  const emoji = getProductEmoji(product);
  const modal = document.getElementById('product-modal');
  const detail = document.getElementById('product-detail');

  let selectedSize = product.sizes?.[0] || null;
  let selectedToppings = [];

  function render() {
    const sizePrice = selectedSize ? selectedSize.price : product.price;
    const toppingsTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    const totalPrice = sizePrice + toppingsTotal;

    detail.innerHTML = `
      <div class="pd-image">${product.image ? `<img src="${product.image}" alt="${product.nameAr}" style="width:100%;height:100%;object-fit:cover">` : emoji}</div>
      <div class="pd-body">
        <div class="pd-name">${product.nameAr}</div>
        <div class="pd-desc">${product.descriptionAr || product.description}</div>
        <div class="pd-meta">
          ${product.calories ? `<div class="pd-meta-item">🔥 ${product.calories} سعرة</div>` : ''}
          ${product.prepTime ? `<div class="pd-meta-item">⏱️ ${product.prepTime} دقيقة</div>` : ''}
          ${product.spicyLevel > 0 ? `<div class="pd-meta-item">🌶️ ${'حار'.repeat(product.spicyLevel)}</div>` : ''}
        </div>
        ${product.sizes && product.sizes.length > 0 ? `
          <div class="pd-section-title">اختر الحجم</div>
          <div class="pd-sizes">
            ${product.sizes.map(s => `
              <button class="pd-size-btn ${selectedSize && selectedSize.name === s.name ? 'active' : ''}"
                onclick="window._selectSize('${s.name}')">
                ${s.nameAr}
                <span class="pd-size-price">${s.price} ج.م</span>
              </button>
            `).join('')}
          </div>
        ` : ''}
        ${product.toppings && product.toppings.length > 0 ? `
          <div class="pd-section-title">إضافات اختيارية</div>
          <div class="pd-toppings">
            ${product.toppings.map(t => `
              <label class="pd-topping">
                <input type="checkbox" ${selectedToppings.find(st => st.name === t.name) ? 'checked' : ''}
                  onchange="window._toggleTopping('${t.name}')">
                <span class="pd-topping-label">${t.nameAr}</span>
                <span class="pd-topping-price">+${t.price} ج.م</span>
              </label>
            `).join('')}
          </div>
        ` : ''}
        <div class="pd-footer">
          <div class="pd-total-price">${totalPrice} <small>جنيه</small></div>
          <button class="btn btn-primary btn-lg pd-add-btn" onclick="window._addToCartFromModal()">أضف للسلة 🛒</button>
        </div>
      </div>
    `;
  }

  modal.classList.remove('hidden');

  window._selectSize = (sizeName) => {
    selectedSize = product.sizes.find(s => s.name === sizeName);
    render();
  };

  window._toggleTopping = (toppingName) => {
    const t = product.toppings.find(x => x.name === toppingName);
    const idx = selectedToppings.findIndex(x => x.name === toppingName);
    if (idx > -1) selectedToppings.splice(idx, 1);
    else selectedToppings.push(t);
    render();
  };

  window._addToCartFromModal = async () => {
    if (!currentUser) { showAuthModal(); return; }
    const sizePrice = selectedSize ? selectedSize.price : product.price;
    const toppingsTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    const price = sizePrice + toppingsTotal;
    try {
      await addToCart(productId, 1, selectedSize?.name || '', selectedToppings.map(t => t.name), price);
      closeProductModal();
      showToast('تمت الإضافة للسلة ✅');
    } catch (e) {
      showToast('خطأ في الإضافة');
    }
  };

  render();
}

function closeProductModal() {
  document.getElementById('product-modal').classList.add('hidden');
}

// ===== CART =====
async function loadCart() {
  try {
    cartData = await apiGet('/api/cart');
    updateCartCount();
  } catch (e) {}
}

async function addToCart(productId, quantity = 1, size = '', toppings = [], price = 0) {
  cartData = await apiPost('/api/cart/add', { productId, quantity, size, toppings, price });
  updateCartCount();
  return cartData;
}

async function quickAdd(productId) {
  if (!currentUser) { showAuthModal(); return; }
  const product = allProducts.find(p => p._id === productId);
  const price = product.sizes?.[0]?.price || product.price;
  const size = product.sizes?.[0]?.name || '';
  try {
    await addToCart(productId, 1, size, [], price);
    showToast('تمت الإضافة للسلة ✅');
  } catch (e) {
    showToast('خطأ في الإضافة');
  }
}

function updateCartCount() {
  const count = cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const badge = document.getElementById('cart-count');
  const bottomBadge = document.getElementById('bottom-cart-count');
  badge.textContent = count;
  bottomBadge.textContent = count;
  badge.classList.toggle('show', count > 0);
  bottomBadge.classList.toggle('show', count > 0);
}

async function loadCartPage() {
  await loadCart();
  renderCart();
}

function renderCart() {
  const emptyEl = document.getElementById('empty-cart');
  const contentEl = document.getElementById('cart-content');
  const clearBtn = document.getElementById('clear-cart-btn');

  if (!cartData || cartData.items.length === 0) {
    emptyEl.classList.remove('hidden');
    contentEl.classList.add('hidden');
    clearBtn.style.display = 'none';
    return;
  }

  emptyEl.classList.add('hidden');
  contentEl.classList.remove('hidden');
  clearBtn.style.display = 'block';

  const phoneInput = document.getElementById('checkout-phone');
  if (phoneInput && currentUser?.phone && !phoneInput.value) {
    phoneInput.value = currentUser.phone;
  }

  const itemsContainer = document.getElementById('cart-items');
  itemsContainer.innerHTML = cartData.items.map(item => {
    const emoji = getProductEmoji(item.product || {});
    return `
      <div class="cart-item">
        <div class="cart-item-img">${emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-top">
            <div class="cart-item-name">${item.product?.nameAr || item.nameAr || 'منتج'}</div>
            <button class="cart-item-remove" onclick="removeCartItem('${item._id}')">✕</button>
          </div>
          <div class="cart-item-meta">
            ${item.size ? 'الحجم: ' + item.size : ''}
            ${item.toppings?.length ? ' • الإضافات: ' + item.toppings.join(', ') : ''}
          </div>
          <div class="cart-item-bottom">
            <div class="qty-control">
              <button class="qty-btn" onclick="updateCartItem('${item._id}', ${item.quantity - 1})">−</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn" onclick="updateCartItem('${item._id}', ${item.quantity + 1})">+</button>
            </div>
            <div class="cart-item-price">${item.price * item.quantity} ج.م</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  updateCartSummary();
  updateCartAddress();
}

function updateCartAddress() {
  const display = document.getElementById('cart-address-display');
  if (currentUser?.address?.city) {
    const a = currentUser.address;
    display.textContent = `${a.city}، ${a.district || ''} ${a.street || ''} ${a.building || ''}`;
    display.style.color = 'var(--text-primary)';
  }
}

async function updateCartItem(itemId, quantity) {
  try {
    if (quantity <= 0) { await removeCartItem(itemId); return; }
    cartData = await apiPut(`/api/cart/update/${itemId}`, { quantity });
    updateCartCount();
    renderCart();
  } catch (e) {
    showToast('خطأ في التحديث');
  }
}

async function removeCartItem(itemId) {
  try {
    cartData = await apiDelete(`/api/cart/remove/${itemId}`);
    updateCartCount();
    renderCart();
    showToast('تم الحذف من السلة');
  } catch (e) {
    showToast('خطأ في الحذف');
  }
}

async function clearCart() {
  if (!confirm('مسح كل حاجة من السلة؟')) return;
  try {
    await apiDelete('/api/cart/clear');
    cartData = { items: [] };
    updateCartCount();
    renderCart();
    showToast('تم مسح السلة');
  } catch (e) {
    showToast('خطأ');
  }
}

function updateCartSummary() {
  const subtotal = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = 15;
  const tax = Math.round(subtotal * 0.14);
  const discount = cartData.couponDiscount || 0;
  const total = Math.max(subtotal + delivery + tax - discount, 0);

  document.getElementById('cart-subtotal').textContent = subtotal + ' ج.م';
  document.getElementById('cart-delivery').textContent = delivery + ' ج.م';
  document.getElementById('cart-tax').textContent = tax + ' ج.م';
  document.getElementById('cart-total').textContent = total + ' ج.م';
  document.getElementById('order-total-btn').textContent = total + ' ج.م';

  const discountLine = document.getElementById('discount-line');
  if (discount > 0) {
    discountLine.classList.remove('hidden');
    document.getElementById('cart-discount').textContent = '-' + discount + ' ج.م';
  } else {
    discountLine.classList.add('hidden');
  }
}

function selectPayment(el) {
  selectedPayment = el.value;
  document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
  el.closest('.payment-option').classList.add('active');
}

async function applyPromo() {
  const code = document.getElementById('promo-input').value.trim().toUpperCase();
  if (!code) return showToast('ادخل كود الخصم');
  if (code === 'FREEQP') {
    showToast('تم تطبيق التوصيل المجاني! 🎉');
  } else if (code === 'QUICK20') {
    showToast('تم تطبيق خصم 20%!');
  } else {
    showToast('كود الخصم غير صالح');
  }
}

async function placeOrder() {
  if (!cartData || cartData.items.length === 0) return showToast('السلة فاضية');
  if (!currentUser?.address?.city) {
    showToast('من فضلك حدد عنوان التوصيل أولاً');
    openAddressModal();
    return;
  }
  const phoneInput = document.getElementById('checkout-phone');
  const phone = phoneInput?.value?.trim();
  if (!phone) {
    showToast('من فضلك اكتب رقم التليفون');
    phoneInput?.focus();
    return;
  }
  try {
    const specialInstructions = document.getElementById('special-instructions')?.value || '';
    const order = await apiPost('/api/orders', {
      paymentMethod: selectedPayment,
      specialInstructions,
      deliveryAddress: currentUser.address,
      phone
    });
    cartData = { items: [] };
    updateCartCount();
    showToast('تم تأكيد الطلب بنجاح! 🎉');
    navigateTo('tracking', order._id);
  } catch (e) {
    showToast(e.message || 'خطأ في تأكيد الطلب');
  }
}

// ===== ORDERS =====
let ordersAutoRefresh = null;

function startOrdersAutoRefresh() {
  if (ordersAutoRefresh) clearInterval(ordersAutoRefresh);
  ordersAutoRefresh = setInterval(() => {
    if (currentPage === 'orders' && currentUser) loadOrdersPage();
  }, 15000);
}

async function loadOrdersPage() {
  try {
    const orders = await apiGet('/api/orders');
    const emptyEl = document.getElementById('empty-orders');
    const listEl = document.getElementById('orders-list');

    if (orders.length === 0) {
      emptyEl.classList.remove('hidden');
      listEl.classList.add('hidden');
      return;
    }

    emptyEl.classList.add('hidden');
    listEl.classList.remove('hidden');

    listEl.innerHTML = '';

    // Active orders first
    const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'];
    const activeOrders = orders.filter(o => activeStatuses.includes(o.status));
    const pastOrders = orders.filter(o => !activeStatuses.includes(o.status));

    if (activeOrders.length > 0) {
      listEl.innerHTML += `<div style="margin-bottom:8px"><h3 style="font-size:16px;font-weight:800;color:var(--primary)">🔔 طلبات جارية <span class="live-dot"></span></h3></div>`;
      listEl.innerHTML += activeOrders.map(order => orderCardHTML(order, true)).join('');
    }
    if (pastOrders.length > 0) {
      listEl.innerHTML += `<div style="margin-top:20px;margin-bottom:8px"><h3 style="font-size:16px;font-weight:800;color:var(--text-muted)">📦 طلبات سابقة</h3></div>`;
      listEl.innerHTML += pastOrders.map(order => orderCardHTML(order, false)).join('');
    }
  } catch (e) {
    showToast('خطأ في تحميل الطلبات');
  }
}

function orderCardHTML(order, isActive) {
  const statusEmoji = { pending: '⏳', confirmed: '✅', preparing: '👨‍🍳', ready: '📦', out_for_delivery: '🚗', delivered: '🎉', cancelled: '❌' };
  return `
    <div class="order-card" onclick="navigateTo('tracking', '${order._id}')" ${isActive ? 'style="border-color:var(--primary);border-width:2px"' : ''}>
      <div class="order-header">
        <span class="order-number">${statusEmoji[order.status] || ''} #${order.orderNumber}</span>
        <span class="order-status ${order.status}">${getStatusText(order.status)}</span>
      </div>
      <div class="order-items-text">
        ${order.items.map(i => `${i.nameAr || i.name} ×${i.quantity}`).join(' • ')}
      </div>
      <div class="order-footer">
        <span class="order-date">${new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })} ${new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
        <span class="order-total">${order.total} ج.م</span>
      </div>
      ${isActive ? '<div style="margin-top:10px"><button class="btn btn-primary btn-sm btn-block" onclick="event.stopPropagation(); navigateTo(\'tracking\', \'' + order._id + '\')">تتبع الطلب</button></div>' : ''}
    </div>
  `;
}

function getStatusText(status) {
  const map = {
    pending: '⏳ قيد الانتظار',
    confirmed: '✅ تم التأكيد',
    preparing: '👨‍🍳 قيد التحضير',
    ready: '📦 جاهز',
    out_for_delivery: '🚗 في الطريق',
    delivered: '🎉 تم التوصيل',
    cancelled: '❌ ملغي'
  };
  return map[status] || status;
}

let trackingInterval = null;
let trackingCountdown = null;

async function loadTrackingPage(orderId) {
  if (trackingInterval) { clearInterval(trackingInterval); trackingInterval = null; }
  if (trackingCountdown) { clearInterval(trackingCountdown); trackingCountdown = null; }

  try {
    const order = await apiGet(`/api/orders/${orderId}`);
    renderTrackingPage(order);

    // Auto-refresh every 10s for active orders
    if (!['delivered', 'cancelled'].includes(order.status)) {
      trackingInterval = setInterval(async () => {
        try {
          const updated = await apiGet(`/api/orders/${orderId}`);
          renderTrackingPage(updated);
          if (['delivered', 'cancelled'].includes(updated.status)) {
            clearInterval(trackingInterval);
            clearInterval(trackingCountdown);
          }
        } catch (e) {}
      }, 10000);
    }
  } catch (e) {
    showToast('خطأ في تحميل تتبع الطلب');
  }
}

function renderTrackingPage(order) {
  const steps = [
    { key: 'pending', icon: '⏳', title: 'تم استلام الطلب', desc: 'طلبك في قائمة الانتظار', time: order.createdAt },
    { key: 'confirmed', icon: '✅', title: 'تم تأكيد الطلب', desc: 'المطعم أكد على طلبك' },
    { key: 'preparing', icon: '👨‍🍳', title: 'جاري التحضير', desc: 'الفريق بيحضر طلبك' },
    { key: 'ready', icon: '📦', title: 'الطلب جاهز', desc: 'طلبك جاهز يستلمه الدلفري' },
    { key: 'out_for_delivery', icon: '🚗', title: 'في الطريق ليك', desc: 'الدلفري في طريقلك' },
    { key: 'delivered', icon: '🎉', title: 'تم التوصيل', desc: 'بالهنا والشفا!' }
  ];
  const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
  const currentIdx = statusOrder.indexOf(order.status);
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  const statusEmoji = isCancelled ? '❌' : isDelivered ? '🎉' : steps[currentIdx]?.icon || '⏳';
  const statusText = isCancelled ? 'تم إلغاء الطلب' : isDelivered ? 'تم التوصيل بنجاح!' : steps[currentIdx]?.title || '';
  const eta = order.estimatedDelivery ? new Date(order.estimatedDelivery) : null;
  const now = new Date();
  const diff = eta ? Math.max(0, Math.floor((eta - now) / 1000)) : 0;
  const mins = Math.floor(diff / 60);
  const secs = diff % 60;

  const a = order.deliveryAddress || {};
  const addrText = [a.city, a.district, a.street, a.building, a.floor ? `دور ${a.floor}` : '', a.apartment ? `شقة ${a.apartment}` : ''].filter(Boolean).join('، ') || 'لم يتم التحديد';

  let countdownHTML = '';
  if (!isDelivered && !isCancelled && diff > 0) {
    countdownHTML = `
      <div class="track-countdown-wrap">
        <div class="track-countdown-label">الوقت المتبقي التقريبي</div>
        <div class="track-countdown">
          <div class="track-cd-box"><div class="track-cd-num" id="cd-min">${mins}</div><div class="track-cd-label">دقيقة</div></div>
          <div class="track-cd-box"><div class="track-cd-num" id="cd-sec">${String(secs).padStart(2, '0')}</div><div class="track-cd-label">ثانية</div></div>
        </div>
      </div>
    `;
  }

  const heroHTML = isDelivered ? `
    <div class="track-delivered-banner">
      <div class="track-hero-back" onclick="navigateTo('orders')">→ رجوع للطلبات</div>
      <div class="track-hero-emoji">🎉</div>
      <div class="track-hero-order">تم التوصيل بنجاح!</div>
      <div class="track-hero-status" style="opacity:0.8;margin-top:6px">بالهنا والشفا</div>
    </div>
  ` : isCancelled ? `
    <div class="track-hero" style="background:linear-gradient(135deg,#616161,#424242)">
      <div class="track-hero-back" onclick="navigateTo('orders')">→ رجوع للطلبات</div>
      <div class="track-hero-emoji">❌</div>
      <div class="track-hero-order">تم إلغاء الطلب</div>
    </div>
  ` : `
    <div class="track-hero">
      <div class="track-hero-back" onclick="navigateTo('orders')">→ رجوع للطلبات</div>
      <div class="track-hero-status">${statusText} <span class="live-dot"></span></div>
      <div class="track-hero-emoji">${statusEmoji}</div>
      <div class="track-hero-order">طلب #${order.orderNumber}</div>
      ${countdownHTML}
    </div>
  `;

  const stepsHTML = steps.map((step, idx) => `
    <div class="track-step ${idx < currentIdx ? 'done' : ''} ${idx === currentIdx && !isCancelled ? 'active' : ''}">
      <div class="step-dot">${idx < currentIdx ? '✓' : step.icon}</div>
      <div class="step-text">
        <h4>${step.title}</h4>
        <p>${step.desc}</p>
        ${step.time ? `<div class="step-time">${new Date(step.time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</div>` : ''}
      </div>
    </div>
  `).join('');

  const itemsHTML = order.items.map(item => `
    <div class="track-item">
      <div class="track-item-emoji">${getProductEmoji(item.product || {})}</div>
      <div class="track-item-info">
        <div class="track-item-name">${item.nameAr || item.name}</div>
        <div class="track-item-meta">
          الكمية: ${item.quantity}
          ${item.size ? ` • الحجم: ${item.size}` : ''}
          ${item.toppings?.length ? ` • ${item.toppings.join(', ')}` : ''}
        </div>
      </div>
      <div class="track-item-price">${item.price * item.quantity} ج.م</div>
    </div>
  `).join('');

  const paymentText = { cash: '💵 كاش', card: '💳 بطاقة', online: '📱 أونلاين' };

  let ratingHTML = '';
  if (isDelivered && !order.rating) {
    ratingHTML = `
      <div class="track-rating-card" id="rating-card">
        <div class="track-detail-title" style="justify-content:center">⭐ قيّم تجربتك</div>
        <h3>كيف كان الأكل؟</h3>
        <div class="track-rating-stars" id="rating-stars">
          <div class="track-star" data-v="1" onclick="setRating(1)">⭐</div>
          <div class="track-star" data-v="2" onclick="setRating(2)">⭐</div>
          <div class="track-star" data-v="3" onclick="setRating(3)">⭐</div>
          <div class="track-star" data-v="4" onclick="setRating(4)">⭐</div>
          <div class="track-star" data-v="5" onclick="setRating(5)">⭐</div>
        </div>
        <textarea class="track-rating-input" id="rating-text" placeholder="اكتب رأيك... (اختياري)"></textarea>
        <button class="btn btn-primary btn-lg" onclick="submitRating('${order._id}')">إرسال التقييم</button>
      </div>
    `;
  } else if (isDelivered && order.rating) {
    ratingHTML = `
      <div class="track-rating-card">
        <h3>تقييمك</h3>
        <div style="font-size:28px;margin:10px 0">${'⭐'.repeat(order.rating)}</div>
        ${order.review ? `<p style="color:var(--text-muted);font-size:14px">"${order.review}"</p>` : ''}
      </div>
    `;
  }

  document.getElementById('tracking-content').innerHTML = `
    ${heroHTML}
    <div class="track-steps-card">
      <div class="track-steps-title">تتبع الطلب</div>
      ${stepsHTML}
    </div>
    <div class="track-detail-grid">
      <div class="track-detail-card full">
        <div class="track-detail-title">📋 تفاصيل الطلب</div>
        ${itemsHTML}
        <div style="margin-top:12px">
          <div class="track-summary-line"><span>المجموع الفرعي</span><span>${order.subtotal} ج.م</span></div>
          <div class="track-summary-line"><span>التوصيل</span><span>${order.deliveryFee} ج.م</span></div>
          <div class="track-summary-line"><span>الضريبة</span><span>${order.tax} ج.م</span></div>
          <div class="track-summary-total"><span>الإجمالي</span><span>${order.total} ج.م</span></div>
        </div>
      </div>
      <div class="track-detail-card">
        <div class="track-detail-title">📍 عنوان التوصيل</div>
        <div class="track-addr-text">${addrText}</div>
      </div>
      <div class="track-detail-card">
        <div class="track-detail-title">💳 طريقة الدفع</div>
        <div style="font-size:15px;font-weight:700">${paymentText[order.paymentMethod] || order.paymentMethod}</div>
        ${order.specialInstructions ? `<div style="margin-top:8px;font-size:13px;color:var(--text-muted)">📝 ${order.specialInstructions}</div>` : ''}
      </div>
    </div>
    ${ratingHTML}
  `;

  // Start countdown timer
  if (!isDelivered && !isCancelled && diff > 0) {
    let remaining = diff;
    if (trackingCountdown) clearInterval(trackingCountdown);
    trackingCountdown = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(trackingCountdown);
        const cdEl = document.getElementById('cd-min');
        if (cdEl) { cdEl.textContent = '0'; document.getElementById('cd-sec').textContent = '00'; }
        return;
      }
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      const cdMin = document.getElementById('cd-min');
      const cdSec = document.getElementById('cd-sec');
      if (cdMin) cdMin.textContent = m;
      if (cdSec) cdSec.textContent = String(s).padStart(2, '0');
    }, 1000);
  }
}

let currentRating = 0;
function setRating(val) {
  currentRating = val;
  document.querySelectorAll('.track-star').forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.v) <= val);
  });
}

async function submitRating(orderId) {
  if (currentRating === 0) return showToast('اختار تقييم أولاً');
  try {
    const review = document.getElementById('rating-text')?.value || '';
    await apiPost(`/api/orders/${orderId}/rate`, { rating: currentRating, review });
    showToast('شكراً على تقييمك! ⭐');
    const order = await apiGet(`/api/orders/${orderId}`);
    renderTrackingPage(order);
  } catch (e) {
    showToast('خطأ في إرسال التقييم');
  }
}

// ===== AUTH =====
function handleAuthClick() {
  if (currentUser) showProfileModal();
  else showAuthModal();
}

function showAuthModal() {
  document.getElementById('auth-modal').classList.remove('hidden');
  showLogin();
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
}

function showLogin() {
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('register-form').classList.add('hidden');
}

function showRegister() {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-form').classList.remove('hidden');
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  btn.textContent = 'جاري تسجيل الدخول...';
  btn.disabled = true;
  try {
    const data = await apiPost('/api/auth/login', {
      email: document.getElementById('login-email').value,
      password: document.getElementById('login-password').value
    });
    saveToStorage(data.token, data.user);
    updateAuthUI();
    closeAuthModal();
    showToast('أهلاً بيك ' + data.user.name + '! 🎉');
    await loadCart();
    initPushNotifications();
    if (data.user.role === 'admin') {
      window.open('/orders.html', '_blank');
      navigateTo('home');
    }
  } catch (e) {
    showToast('بيانات الدخول غلط');
  } finally {
    btn.textContent = 'تسجيل الدخول';
    btn.disabled = false;
  }
}

async function handleRegister(e) {
  e.preventDefault();
  try {
    const data = await apiPost('/api/auth/register', {
      name: document.getElementById('reg-name').value,
      email: document.getElementById('reg-email').value,
      phone: document.getElementById('reg-phone').value,
      password: document.getElementById('reg-password').value
    });
    saveToStorage(data.token, data.user);
    updateAuthUI();
    closeAuthModal();
    initPushNotifications();
    showToast('تم الحساب بنجاح! 🎉');
  } catch (e) {
    showToast('البريد مسجل بالفعل');
  }
}

function updateAuthUI() {
  const authBtn = document.getElementById('auth-btn');
  const mobileAuthLink = document.getElementById('mobile-auth-link');
  const adminLink = document.getElementById('mobile-admin-link');
  if (currentUser) {
    const initial = currentUser.name?.charAt(0) || '👤';
    authBtn.innerHTML = `<span>${initial}</span>`;
    mobileAuthLink.querySelector('span:last-child').textContent = 'تسجيل الخروج';
    if (currentUser.role === 'admin') adminLink.style.display = 'flex';
    else adminLink.style.display = 'none';
  } else {
    authBtn.innerHTML = '<span>👤</span>';
    mobileAuthLink.querySelector('span:last-child').textContent = 'تسجيل الدخول';
    adminLink.style.display = 'none';
    document.getElementById('notif-btn').style.display = 'none';
  }
}

function updateLocationUI() {
  const label = document.getElementById('location-label');
  if (currentUser?.address?.city) {
    label.textContent = currentUser.address.city;
  }
}

// ===== PROFILE =====
function showProfileModal() {
  if (!currentUser) return;
  const modal = document.getElementById('profile-modal');
  const content = document.getElementById('profile-content');

  content.innerHTML = `
    <div class="profile-header-card">
      <div class="profile-avatar">${currentUser.name?.charAt(0) || '👤'}</div>
      <div class="profile-name">${currentUser.name}</div>
      <div class="profile-email">${currentUser.email}</div>
      <div class="profile-points">⭐ ${Math.floor(Math.random() * 500 + 100)} نقطة</div>
    </div>
    <div class="profile-menu-item" onclick="openAddressModal(); closeProfileModal()">
      <span class="profile-menu-icon">📍</span>
      <span>عناوين التوصيل</span>
      <span class="profile-menu-arrow">←</span>
    </div>
    <div class="profile-menu-item" onclick="closeProfileModal(); navigateTo('orders')">
      <span class="profile-menu-icon">📦</span>
      <span>طلباتي</span>
      <span class="profile-menu-arrow">←</span>
    </div>
    <div class="profile-menu-item" onclick="showFavorites()">
      <span class="profile-menu-icon">❤️</span>
      <span>المفضلة</span>
      <span class="profile-menu-arrow">←</span>
    </div>
    <div class="profile-menu-item" onclick="closeProfileModal()">
      <span class="profile-menu-icon">📞</span>
      <span>تواصل معنا</span>
      <span class="profile-menu-arrow">←</span>
    </div>
    <div class="profile-menu-item" onclick="handleLogout()" style="color:var(--danger);margin-top:8px">
      <span class="profile-menu-icon">🚪</span>
      <span>تسجيل الخروج</span>
      <span class="profile-menu-arrow">←</span>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeProfileModal() {
  document.getElementById('profile-modal').classList.add('hidden');
}

function showFavorites() {
  closeProfileModal();
  navigateTo('menu');
  if (favorites.length === 0) {
    showToast('مفيش منتجات في المفضلة');
    return;
  }
  const favProducts = allProducts.filter(p => favorites.includes(p._id));
  document.getElementById('menu-title').textContent = 'المفضلة ❤️';
  document.getElementById('menu-products').innerHTML = favProducts.map(p => productCard(p)).join('');
}

function handleLogout() {
  if (confirm('هل تريد تسجيل الخروج؟')) {
    clearStorage();
    updateAuthUI();
    closeProfileModal();
    navigateTo('home');
    showToast('تم تسجيل الخروج');
  }
}

// ===== ADDRESS =====
function openAddressModal() {
  const modal = document.getElementById('address-modal');
  if (currentUser?.address) {
    const a = currentUser.address;
    document.getElementById('addr-city').value = a.city || '';
    document.getElementById('addr-district').value = a.district || '';
    document.getElementById('addr-street').value = a.street || '';
    document.getElementById('addr-building').value = a.building || '';
    document.getElementById('addr-floor').value = a.floor || '';
    document.getElementById('addr-apartment').value = a.apartment || '';
    document.getElementById('addr-location').value = a.location || '';
  }
  modal.classList.remove('hidden');
}

function closeAddressModal() {
  document.getElementById('address-modal').classList.add('hidden');
}

async function saveAddress(e) {
  e.preventDefault();
  const address = {
    city: document.getElementById('addr-city').value,
    district: document.getElementById('addr-district').value,
    street: document.getElementById('addr-street').value,
    building: document.getElementById('addr-building').value,
    floor: document.getElementById('addr-floor').value,
    apartment: document.getElementById('addr-apartment').value,
    location: document.getElementById('addr-location').value
  };

  if (currentUser) {
    currentUser.address = address;
    localStorage.setItem('qp_user', JSON.stringify(currentUser));
    try {
      await apiPut('/api/auth/address', address);
    } catch (e) {}
  }

  updateLocationUI();
  if (currentPage === 'cart') updateCartAddress();
  closeAddressModal();
  showToast('تم حفظ العنوان ✅');
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
  document.getElementById('mobile-menu').classList.toggle('hidden');
}

// ===== ADMIN =====
let adminAutoRefreshInterval = null;
let adminCurrentTab = 'dashboard';

function toggleAdminAutoRefresh() {
  const checked = document.getElementById('admin-auto-refresh').checked;
  if (checked) startAdminAutoRefresh();
  else stopAdminAutoRefresh();
}

function startAdminAutoRefresh() {
  stopAdminAutoRefresh();
  adminAutoRefreshInterval = setInterval(() => {
    if (currentPage === 'admin') loadAdminDashboard();
  }, 10000);
}

function stopAdminAutoRefresh() {
  if (adminAutoRefreshInterval) { clearInterval(adminAutoRefreshInterval); adminAutoRefreshInterval = null; }
}

async function loadAdminDashboard() {
  try {
    const allOrders = await apiGet('/api/orders/all');
    const orders = allOrders.orders || [];
    const now = new Date();
    document.getElementById('admin-updated-at').textContent = 'آخر تحديث: ' + now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
    const stats = {
      total: orders.length,
      todayCount: todayOrders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      todayRevenue: todayOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0),
      totalRevenue: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0)
    };

    document.getElementById('admin-content').innerHTML = `
      <div class="admin-stats">
        <div class="stat-card" style="border-right:4px solid var(--primary)">
          <div class="stat-icon">📦</div>
          <div class="stat-value">${stats.total}</div>
          <div class="stat-label">إجمالي الطلبات</div>
        </div>
        <div class="stat-card" style="border-right:4px solid var(--warning)">
          <div class="stat-icon">⏳</div>
          <div class="stat-value">${stats.pending}</div>
          <div class="stat-label">قيد الانتظار</div>
        </div>
        <div class="stat-card" style="border-right:4px solid var(--info)">
          <div class="stat-icon">👨‍🍳</div>
          <div class="stat-value">${stats.preparing + stats.confirmed}</div>
          <div class="stat-label">قيد التحضير</div>
        </div>
        <div class="stat-card" style="border-right:4px solid var(--success)">
          <div class="stat-icon">🚗</div>
          <div class="stat-value">${stats.ready + stats.out_for_delivery}</div>
          <div class="stat-label">جاهز / في الطريق</div>
        </div>
        <div class="stat-card" style="border-right:4px solid var(--success)">
          <div class="stat-icon">💰</div>
          <div class="stat-value">${stats.totalRevenue} ج</div>
          <div class="stat-label">إجمالي الإيرادات</div>
        </div>
        <div class="stat-card" style="border-right:4px solid var(--danger)">
          <div class="stat-icon">❌</div>
          <div class="stat-value">${stats.cancelled}</div>
          <div class="stat-label">ملغي</div>
        </div>
      </div>

      <!-- Pending Orders - Urgent -->
      ${stats.pending > 0 ? `
        <div class="admin-section">
          <h3 class="admin-section-title">🔴 طلبات في الانتظار (${stats.pending})</h3>
          <div class="admin-orders-grid">
            ${orders.filter(o => o.status === 'pending').map(o => adminOrderCard(o)).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Confirmed / Preparing -->
      ${(stats.confirmed + stats.preparing) > 0 ? `
        <div class="admin-section">
          <h3 class="admin-section-title">👨‍🍳 قيد التحضير (${stats.confirmed + stats.preparing})</h3>
          <div class="admin-orders-grid">
            ${orders.filter(o => ['confirmed', 'preparing'].includes(o.status)).map(o => adminOrderCard(o)).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Ready / Out for Delivery -->
      ${(stats.ready + stats.out_for_delivery) > 0 ? `
        <div class="admin-section">
          <h3 class="admin-section-title">🚗 جاهز / في الطريق (${stats.ready + stats.out_for_delivery})</h3>
          <div class="admin-orders-grid">
            ${orders.filter(o => ['ready', 'out_for_delivery'].includes(o.status)).map(o => adminOrderCard(o)).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Recent Delivered -->
      <div class="admin-section">
        <h3 class="admin-section-title">✅ تم التوصيل (${stats.delivered})</h3>
        <div class="admin-orders-grid">
          ${orders.filter(o => o.status === 'delivered').slice(0, 6).map(o => adminOrderCard(o)).join('')}
          ${stats.delivered === 0 ? '<p style="color:var(--text-muted);font-size:14px">مفيش طلبات موصلاة لسه</p>' : ''}
        </div>
      </div>
    `;

    if (currentPage === 'admin' && adminCurrentTab === 'dashboard' && document.getElementById('admin-auto-refresh')?.checked) {
      startAdminAutoRefresh();
    }
  } catch (e) {
    document.getElementById('admin-content').innerHTML = '<div class="empty-state"><div class="empty-emoji">📊</div><h3>خطأ في تحميل البيانات</h3></div>';
  }
}

function adminOrderCard(order) {
  const statusConfig = {
    pending: { color: '#ff9800', bg: '#fff3e0', label: '⏳ قيد الانتظار', next: 'confirmed', nextLabel: '✅ تأكيد' },
    confirmed: { color: '#1976d2', bg: '#e3f2fd', label: '✅ تم التأكيد', next: 'preparing', nextLabel: '👨‍🍳 تحضير' },
    preparing: { color: '#d32f2f', bg: '#ffebee', label: '👨‍🍳 قيد التحضير', next: 'ready', nextLabel: '📦 جاهز' },
    ready: { color: '#7b1fa2', bg: '#f3e5f5', label: '📦 جاهز', next: 'out_for_delivery', nextLabel: '🚗 توصيل' },
    out_for_delivery: { color: '#00695c', bg: '#e0f2f1', label: '🚗 في الطريق', next: 'delivered', nextLabel: '🎉 تم التوصيل' },
    delivered: { color: '#388e3c', bg: '#e8f5e9', label: '🎉 تم التوصيل', next: null },
    cancelled: { color: '#757575', bg: '#f5f5f5', label: '❌ ملغي', next: null }
  };
  const cfg = statusConfig[order.status] || statusConfig.pending;
  const timeAgo = getTimeAgo(order.createdAt);
  const a = order.deliveryAddress || {};

  return `
    <div class="admin-order-card">
      <div class="aoc-header" style="border-left: 4px solid ${cfg.color}">
        <div>
          <div class="aoc-order-num">#${order.orderNumber}</div>
          <div class="aoc-time">${timeAgo}</div>
        </div>
        <span class="aoc-status" style="background:${cfg.bg};color:${cfg.color}">${cfg.label}</span>
      </div>
      <div class="aoc-body">
        <div class="aoc-customer">
          <span>👤</span> ${order.user?.name || 'غير معروف'}
          ${(order.phone || order.user?.phone) ? `<a href="tel:${order.phone || order.user?.phone}" class="aoc-phone">📞 ${order.phone || order.user?.phone}</a>` : ''}
        </div>
        <div class="aoc-items">
          ${order.items.map(i => `<div class="aoc-item"><span>${i.nameAr || i.name} ×${i.quantity}</span><span>${i.price * i.quantity} ج</span></div>`).join('')}
        </div>
        <div class="aoc-address">📍 ${[a.city, a.district, a.street, a.building].filter(Boolean).join('، ') || 'لم يحدد'}</div>
        ${order.specialInstructions ? `<div class="aoc-note">📝 ${order.specialInstructions}</div>` : ''}
        ${order.rating ? `<div class="aoc-rating">${'⭐'.repeat(order.rating)} ${order.review ? `"${order.review}"` : ''}</div>` : ''}
      </div>
      <div class="aoc-footer">
        <div class="aoc-total">${order.total} ج.م</div>
        <div class="aoc-actions">
          ${cfg.next ? `<button class="btn btn-primary btn-sm" onclick="updateOrderStatus('${order._id}', '${cfg.next}')">${cfg.nextLabel}</button>` : ''}
          ${order.status !== 'cancelled' && order.status !== 'delivered' ? `<button class="btn btn-outline btn-sm" style="color:var(--danger);border-color:var(--danger)" onclick="updateOrderStatus('${order._id}', 'cancelled')">❌ إلغاء</button>` : ''}
        </div>
      </div>
    </div>
  `;
}

function getTimeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  return `منذ ${Math.floor(diff / 86400)} يوم`;
}

async function loadAdminOrders() {
  try {
    const allOrders = await apiGet('/api/orders/all');
    const orders = allOrders.orders || [];

    document.getElementById('admin-content').innerHTML = `
      <div style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap" id="order-filter-bar">
        <button class="pill active" onclick="filterAdminOrders('all', this)">الكل (${orders.length})</button>
        <button class="pill" onclick="filterAdminOrders('pending', this)">⏳ انتظار (${orders.filter(o=>o.status==='pending').length})</button>
        <button class="pill" onclick="filterAdminOrders('confirmed', this)">✅ مؤكد (${orders.filter(o=>o.status==='confirmed').length})</button>
        <button class="pill" onclick="filterAdminOrders('preparing', this)">👨‍🍳 تحضير (${orders.filter(o=>o.status==='preparing').length})</button>
        <button class="pill" onclick="filterAdminOrders('ready', this)">📦 جاهز (${orders.filter(o=>o.status==='ready').length})</button>
        <button class="pill" onclick="filterAdminOrders('out_for_delivery', this)">🚗 طريق (${orders.filter(o=>o.status==='out_for_delivery').length})</button>
        <button class="pill" onclick="filterAdminOrders('delivered', this)">🎉 موصلاة (${orders.filter(o=>o.status==='delivered').length})</button>
        <button class="pill" onclick="filterAdminOrders('cancelled', this)">❌ ملغي (${orders.filter(o=>o.status==='cancelled').length})</button>
      </div>
      <div class="admin-orders-grid" id="admin-orders-grid">
        ${orders.map(o => adminOrderCard(o)).join('')}
      </div>
    `;
  } catch (e) {
    document.getElementById('admin-content').innerHTML = '<div class="empty-state"><h3>خطأ في تحميل الطلبات</h3></div>';
  }
}

function filterAdminOrders(status, el) {
  document.querySelectorAll('#order-filter-bar .pill').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  apiGet('/api/orders/all').then(allOrders => {
    const orders = allOrders.orders || [];
    const filtered = status === 'all' ? orders : orders.filter(o => o.status === status);
    document.getElementById('admin-orders-grid').innerHTML = filtered.map(o => adminOrderCard(o)).join('') || '<p style="color:var(--text-muted);text-align:center;padding:40px">مفيش طلبات في الحالة دي</p>';
  });
}

async function updateOrderStatus(orderId, status) {
  try {
    await apiPut(`/api/orders/${orderId}/status`, { status });
    showToast('تم تحديث حالة الطلب ✅');
    if (currentPage === 'admin') {
      if (adminCurrentTab === 'orders') loadAdminOrders();
      else loadAdminDashboard();
    }
  } catch (e) {
    showToast('خطأ في التحديث');
  }
}

function showAdminSection(section, el) {
  document.querySelectorAll('.admin-tab').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  adminCurrentTab = section;
  stopAdminAutoRefresh();
  if (section === 'dashboard') loadAdminDashboard();
  else if (section === 'orders') loadAdminOrders();
  else if (section === 'products') loadAdminProducts();
}

async function loadAdminProducts() {
  try {
    allProducts = await apiGet('/api/products');
  } catch (e) {}
  const content = document.getElementById('admin-content');
  content.innerHTML = `
    <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">
      <h3 style="font-weight:800">📦 المنتجات (${allProducts.length})</h3>
      <button class="btn btn-primary btn-sm" onclick="openAddProductModal()">➕ إضافة منتج</button>
    </div>
    <div class="admin-table">
      <table>
        <thead><tr><th>الصورة</th><th>المنتج</th><th>القسم</th><th>السعر</th><th>الحالة</th><th>إجراءات</th></tr></thead>
        <tbody>
          ${allProducts.map(p => `<tr>
            <td>${p.image ? `<img src="${p.image}" style="width:40px;height:40px;object-fit:cover;border-radius:6px">` : '<span style="font-size:24px">🍕</span>'}</td>
            <td><strong>${p.nameAr}</strong><br><small style="color:var(--text-muted)">${p.name}</small></td>
            <td>${p.category?.nameAr || 'N/A'}</td>
            <td>${p.price} ج</td>
            <td>${p.isAvailable ? '<span class="status-badge" style="background:var(--success-bg);color:var(--success)">متاح</span>' : '<span class="status-badge" style="background:var(--surface-3);color:var(--text-muted)">غير متاح</span>'}</td>
            <td style="white-space:nowrap">
              <button class="action-btn edit" onclick="openEditProductModal('${p._id}')">✏️</button>
              <button class="action-btn cancel" onclick="toggleProductAvailability('${p._id}', ${p.isAvailable})">${p.isAvailable ? '🚫' : '✅'}</button>
              <button class="action-btn delete" onclick="deleteProduct('${p._id}', '${p.nameAr}')">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openAddProductModal() {
  document.getElementById('pf-id').value = '';
  document.getElementById('pf-name').value = '';
  document.getElementById('pf-nameAr').value = '';
  document.getElementById('pf-desc').value = '';
  document.getElementById('pf-descAr').value = '';
  document.getElementById('pf-price').value = '';
  document.getElementById('pf-prepTime').value = '';
  document.getElementById('pf-calories').value = '';
  document.getElementById('pf-spicy').value = '0';
  document.getElementById('pf-tags').value = '';
  document.getElementById('pf-featured').checked = false;
  document.getElementById('pf-popular').checked = false;
  document.getElementById('pf-available').checked = true;
  document.getElementById('pf-image-url').value = '';
  document.getElementById('pf-image-file').value = '';
  document.getElementById('pf-image-preview').style.display = 'none';
  document.getElementById('product-form-title').textContent = '➕ إضافة منتج جديد';
  populateCategorySelect();
  document.getElementById('product-form-modal').classList.remove('hidden');
}

function openEditProductModal(productId) {
  const p = allProducts.find(x => x._id === productId);
  if (!p) return;
  document.getElementById('pf-id').value = p._id;
  document.getElementById('pf-name').value = p.name;
  document.getElementById('pf-nameAr').value = p.nameAr;
  document.getElementById('pf-desc').value = p.description || '';
  document.getElementById('pf-descAr').value = p.descriptionAr || '';
  document.getElementById('pf-price').value = p.price;
  document.getElementById('pf-prepTime').value = p.prepTime || '';
  document.getElementById('pf-calories').value = p.calories || '';
  document.getElementById('pf-spicy').value = p.spicyLevel || 0;
  document.getElementById('pf-tags').value = (p.tags || []).join(', ');
  document.getElementById('pf-featured').checked = p.isFeatured;
  document.getElementById('pf-popular').checked = p.isPopular;
  document.getElementById('pf-available').checked = p.isAvailable;
  document.getElementById('pf-image-file').value = '';
  if (p.image) {
    document.getElementById('pf-image-url').value = p.image;
    document.getElementById('pf-preview-img').src = p.image;
    document.getElementById('pf-image-preview').style.display = 'block';
  } else {
    document.getElementById('pf-image-url').value = '';
    document.getElementById('pf-image-preview').style.display = 'none';
  }
  document.getElementById('product-form-title').textContent = '✏️ تعديل المنتج';
  populateCategorySelect(p.category?._id);
  document.getElementById('product-form-modal').classList.remove('hidden');
}

function closeProductFormModal() {
  document.getElementById('product-form-modal').classList.add('hidden');
}

function populateCategorySelect(selectedId) {
  const sel = document.getElementById('pf-category');
  sel.innerHTML = '<option value="">اختر القسم</option>' +
    allCategories.map(c => `<option value="${c._id}" ${c._id === selectedId ? 'selected' : ''}>${c.icon} ${c.nameAr}</option>`).join('');
}

function previewProductImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('pf-preview-img').src = e.target.result;
      document.getElementById('pf-image-preview').style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function handleProductForm(e) {
  e.preventDefault();
  const id = document.getElementById('pf-id').value;
  const data = {
    name: document.getElementById('pf-name').value,
    nameAr: document.getElementById('pf-nameAr').value,
    description: document.getElementById('pf-desc').value,
    descriptionAr: document.getElementById('pf-descAr').value,
    price: Number(document.getElementById('pf-price').value),
    category: document.getElementById('pf-category').value,
    prepTime: Number(document.getElementById('pf-prepTime').value) || 0,
    calories: Number(document.getElementById('pf-calories').value) || 0,
    spicyLevel: Number(document.getElementById('pf-spicy').value),
    tags: document.getElementById('pf-tags').value.split(',').map(t => t.trim()).filter(Boolean),
    isFeatured: document.getElementById('pf-featured').checked,
    isPopular: document.getElementById('pf-popular').checked,
    isAvailable: document.getElementById('pf-available').checked
  };

  const fileInput = document.getElementById('pf-image-file');
  const existingImage = document.getElementById('pf-image-url').value;

  try {
    let imageUrl = existingImage;

    if (fileInput.files && fileInput.files[0]) {
      const formData = new FormData();
      formData.append('image', fileInput.files[0]);
      const token = localStorage.getItem('qp_token');
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (uploadData.url) imageUrl = uploadData.url;
    }

    if (imageUrl) data.image = imageUrl;
    if (id) {
      await apiPut(`/api/products/${id}`, data);
      showToast('تم تعديل المنتج بنجاح ✅');
    } else {
      data.sizes = [{ name: 'Regular', nameAr: 'عادي', price: data.price }];
      data.toppings = [];
      await apiPost('/api/products', data);
      showToast('تم إضافة المنتج بنجاح ✅');
    }
    closeProductFormModal();
    allProducts = await apiGet('/api/products');
    loadAdminProducts();
  } catch (e) {
    showToast('خطأ في حفظ المنتج: ' + e.message);
  }
}

async function toggleProductAvailability(productId, current) {
  try {
    await apiPut(`/api/products/${productId}`, { isAvailable: !current });
    showToast(current ? 'تم إخفاء المنتج' : 'تم إظهار المنتج');
    allProducts = await apiGet('/api/products');
    loadAdminProducts();
  } catch (e) {
    showToast('خطأ في التحديث');
  }
}

async function deleteProduct(productId, name) {
  if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
  try {
    await apiDelete(`/api/products/${productId}`);
    showToast('تم حذف المنتج');
    allProducts = await apiGet('/api/products');
    loadAdminProducts();
  } catch (e) {
    showToast('خطأ في الحذف');
  }
}

// ===== ORDER MANAGER (KDS) =====
let omAutoRefresh = null;
let omClockInterval = null;
let omFilter = 'all';
let omPreviousOrders = [];
let omAudioCtx = null;

function startOMClock() {
  if (omClockInterval) clearInterval(omClockInterval);
  function tick() {
    const el = document.getElementById('om-clock');
    if (el) el.textContent = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  tick();
  omClockInterval = setInterval(tick, 1000);
}

function startOMAutoRefresh() {
  if (omAutoRefresh) clearInterval(omAutoRefresh);
  if (document.getElementById('om-auto-toggle')?.checked) {
    omAutoRefresh = setInterval(() => {
      if (currentPage === 'order-manager') loadOrderManager();
    }, 8000);
  }
}

function toggleOMAutoRefresh() {
  if (document.getElementById('om-auto-toggle')?.checked) startOMAutoRefresh();
  else if (omAutoRefresh) { clearInterval(omAutoRefresh); omAutoRefresh = null; }
}

function playNotificationSound() {
  try {
    if (!omAudioCtx) omAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = omAudioCtx.createOscillator();
    const gain = omAudioCtx.createGain();
    osc.connect(gain); gain.connect(omAudioCtx.destination);
    osc.frequency.value = 800; osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, omAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, omAudioCtx.currentTime + 0.3);
    osc.start(); osc.stop(omAudioCtx.currentTime + 0.3);
  } catch (e) {}
}

async function loadOrderManager() {
  try {
    const allOrders = await apiGet('/api/orders/all');
    const orders = allOrders.orders || [];

    const newCount = orders.filter(o => o.status === 'pending').length;
    const prevPending = omPreviousOrders.filter(o => o.status === 'pending').length;
    if (newCount > prevPending && omPreviousOrders.length > 0) playNotificationSound();
    omPreviousOrders = [...orders];

    const pending = orders.filter(o => o.status === 'pending');
    const confirmed = orders.filter(o => o.status === 'confirmed');
    const preparing = orders.filter(o => o.status === 'preparing');
    const ready = orders.filter(o => o.status === 'ready');
    const outForDelivery = orders.filter(o => o.status === 'out_for_delivery');
    const delivered = orders.filter(o => o.status === 'delivered');
    const cancelled = orders.filter(o => o.status === 'cancelled');
    const active = [...confirmed, ...preparing, ...ready, ...outForDelivery];
    const revenue = delivered.reduce((s, o) => s + o.total, 0);

    document.getElementById('om-count-all').textContent = orders.length;
    document.getElementById('om-count-pending').textContent = pending.length;
    document.getElementById('om-count-active').textContent = active.length;
    document.getElementById('om-count-delivered').textContent = delivered.length;

    document.getElementById('om-stats-strip').innerHTML = `
      <div class="om-stat-item s-pending"><div class="om-stat-num">${pending.length}</div><div class="om-stat-label">جديد</div></div>
      <div class="om-stat-item s-preparing"><div class="om-stat-num">${confirmed.length + preparing.length}</div><div class="om-stat-label">تحضير</div></div>
      <div class="om-stat-item s-ready"><div class="om-stat-num">${ready.length + outForDelivery.length}</div><div class="om-stat-label">جاهز / توصيل</div></div>
      <div class="om-stat-item s-delivered"><div class="om-stat-num">${delivered.length}</div><div class="om-stat-label">تم التوصيل</div></div>
      <div class="om-stat-item s-revenue"><div class="om-stat-num">${revenue} ج</div><div class="om-stat-label">إيرادات اليوم</div></div>
    `;

    let filtered;
    switch (omFilter) {
      case 'pending': filtered = pending; break;
      case 'active': filtered = active; break;
      case 'delivered': filtered = delivered; break;
      default: filtered = orders.filter(o => o.status !== 'cancelled'); break;
    }

    const grid = document.getElementById('om-orders-grid');
    const empty = document.getElementById('om-empty');

    if (filtered.length === 0) {
      grid.classList.add('hidden');
      empty.style.display = 'flex';
    } else {
      grid.classList.remove('hidden');
      empty.style.display = 'none';
      grid.innerHTML = filtered.map(o => omOrderCard(o)).join('');
    }
  } catch (e) {
    console.error('OM load error:', e);
  }
}

function omFilterOrders(filter, el) {
  omFilter = filter;
  document.querySelectorAll('.om-filter').forEach(f => f.classList.remove('active'));
  if (el) el.classList.add('active');
  loadOrderManager();
}

function omOrderCard(order) {
  const statusMap = {
    pending: { label: 'جديد', cls: 'om-status-pending', next: 'confirmed', nextBtn: '✅ تأكيد', nextCls: 'om-btn-confirm' },
    confirmed: { label: 'مؤكد', cls: 'om-status-confirmed', next: 'preparing', nextBtn: '👨‍🍳 تحضير', nextCls: 'om-btn-prepare' },
    preparing: { label: 'قيد التحضير', cls: 'om-status-preparing', next: 'ready', nextBtn: '📦 جاهز', nextCls: 'om-btn-ready' },
    ready: { label: 'جاهز', cls: 'om-status-ready', next: 'out_for_delivery', nextBtn: '🚗 توصيل', nextCls: 'om-btn-deliver' },
    out_for_delivery: { label: 'في الطريق', cls: 'om-status-out_for_delivery', next: 'delivered', nextBtn: '🎉 تم التوصيل', nextCls: 'om-btn-deliver' },
    delivered: { label: 'تم التوصيل', cls: 'om-status-delivered', next: null },
    cancelled: { label: 'ملغي', cls: 'om-status-cancelled', next: null }
  };
  const cfg = statusMap[order.status] || statusMap.pending;
  const elapsed = Math.floor((Date.now() - new Date(order.createdAt)) / 1000);
  const mins = Math.floor(elapsed / 60);
  const timerClass = mins > 30 ? 'timer-danger' : mins > 15 ? 'timer-warning' : '';
  const a = order.deliveryAddress || {};
  const isNew = order.status === 'pending';

  return `
    <div class="om-card ${isNew ? 'pulse-new' : ''}" id="om-card-${order._id}">
      <div class="om-card-top">
        <div>
          <div class="om-card-order">#${order.orderNumber}</div>
          <div class="om-card-time">
            <span class="om-card-timer ${timerClass}">${mins} دقيقة</span>
            <span>•</span>
            <span>${new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <span class="om-card-status ${cfg.cls}">${cfg.label}</span>
      </div>
      <div class="om-card-body">
        <div class="om-card-customer">👤 ${order.user?.name || 'غير معروف'} ${(order.phone || order.user?.phone) ? `| 📞 ${order.phone || order.user?.phone}` : ''}</div>
        <div class="om-card-items">
          ${order.items.map(i => `
            <div class="om-card-item">
              <span class="om-card-item-name">${i.nameAr || i.name}</span>
              <span class="om-card-item-qty">×${i.quantity}</span>
              <span class="om-card-item-price">${i.price * i.quantity} ج</span>
            </div>
          `).join('')}
        </div>
        ${order.specialInstructions ? `<div class="om-card-note">📝 ${order.specialInstructions}</div>` : ''}
        <div class="om-card-addr">📍 ${[a.city, a.district, a.street, a.building].filter(Boolean).join('، ') || 'لم يحدد'}</div>
      </div>
      <div class="om-card-footer">
        <div class="om-card-total">${order.total} ج.م</div>
        ${cfg.next ? `<button class="om-action-btn ${cfg.nextCls}" onclick="omUpdateStatus('${order._id}', '${cfg.next}')">${cfg.nextBtn}</button>` : ''}
        ${order.status !== 'cancelled' && order.status !== 'delivered' ? `<button class="om-action-btn om-btn-cancel" onclick="omUpdateStatus('${order._id}', 'cancelled')">✕</button>` : ''}
      </div>
    </div>
  `;
}

async function omUpdateStatus(orderId, status) {
  try {
    await apiPut(`/api/orders/${orderId}/status`, { status });
    if (status === 'delivered' || status === 'cancelled') playNotificationSound();
    loadOrderManager();
  } catch (e) {
    showToast('خطأ في التحديث');
  }
}

// ===== PWA SERVICE WORKER =====
let deferredPrompt = null;

// ===== PWA SERVICE WORKER =====
let deferredPrompt = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('SW registered:', reg.scope);
    }).catch(err => console.log('SW error:', err));
  });
}

function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         localStorage.getItem('qp_app_installed') === 'true';
}

if (isAppInstalled()) {
  const banner = document.getElementById('install-banner');
  const section = document.getElementById('install-section');
  if (banner) banner.classList.add('hidden');
  if (section) section.style.display = 'none';
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const banner = document.getElementById('install-banner');
  const section = document.getElementById('install-section');
  if (banner) banner.classList.remove('hidden');
  if (section) section.style.display = '';
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  localStorage.setItem('qp_app_installed', 'true');
  const banner = document.getElementById('install-banner');
  const section = document.getElementById('install-section');
  if (banner) banner.classList.add('hidden');
  if (section) section.style.display = 'none';
  showToast('تم تثبيت التطبيق! ✅');
});

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choice => {
      if (choice.outcome === 'accepted') {
        showToast('تم تثبيت التطبيق! ✅');
        const banner = document.getElementById('install-banner');
        if (banner) banner.classList.add('hidden');
        const section = document.getElementById('install-section');
        if (section) section.style.display = 'none';
      }
      deferredPrompt = null;
    });
  } else {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      showToast('اضflate Share ⬆️ في Safari ← أضف إلى الشاشة الرئيسية');
      alert('خطوات التثبيت على iPhone:\n\n1. اضغط زر المشاركة ⬆️ أسفل الشاشة\n2. مرر لأسفل واختر "إضافة إلى الشاشة الرئيسية"\n3. اضغط "إضافة" في الأعلى\n\nكده التطبيق هيتحمّل على موبايلك!');
    } else if (isAndroid) {
      showToast('افتح قائمة Chrome ← "تثبيت على جهازك"');
      alert('خطوات التثبيت على Android:\n\n1. اضغط على النقاط الثلاث ⋮ في أعلى يمين Chrome\n2. اختر "تثبيت على جهازك" أو "إضافة إلى الشاشة الرئيسية"\n3. اضغط "تثبيت"\n\nكده التطبيق هيتحمّل على موبايلك!');
    } else {
      showToast('افتح الموقع من موبايل Chrome أو Safari');
    }
  }
}

function dismissInstall() {
  localStorage.setItem('qp_app_installed', 'true');
  const banner = document.getElementById('install-banner');
  const section = document.getElementById('install-section');
  if (banner) banner.classList.add('hidden');
  if (section) section.style.display = 'none';
}

// ===== OFFLINE DETECTION =====
window.addEventListener('online', () => {
  const el = document.getElementById('offline-indicator');
  if (el) el.classList.remove('show');
});
window.addEventListener('offline', () => {
  const el = document.getElementById('offline-indicator');
  if (el) el.classList.add('show');
});

// ===== PUSH NOTIFICATIONS =====
async function initPushNotifications() {
  if (!currentUser || !('serviceWorker' in navigator) || !('PushManager' in window)) return;

  document.getElementById('notif-btn').style.display = 'flex';
  loadNotifCount();

  const permission = Notification.permission;
  if (permission === 'default') {
    setTimeout(() => {
      if (confirm('عندك إشعارات كويك بيتزا! عايز يتبلغلك لما طلبك يتغير؟')) {
        requestNotifPermission();
      }
    }, 5000);
  } else if (permission === 'granted') {
    subscribeToPush();
  }
}

async function requestNotifPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await subscribeToPush();
      showToast('تم تفعيل الإشعارات! 🔔');
    }
  } catch (e) {
    console.log('Notification permission error:', e);
  }
}

async function subscribeToPush() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const keyRes = await fetch('/api/notifications/vapid-public-key');
    const { publicKey } = await keyRes.json();

    const existingSub = await reg.pushManager.getSubscription();
    if (existingSub) {
      await saveSubscription(existingSub);
      return;
    }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
    await saveSubscription(sub);
  } catch (e) {
    console.log('Push subscribe error:', e);
  }
}

async function saveSubscription(sub) {
  try {
    await apiPost('/api/notifications/subscribe', { subscription: sub.toJSON() });
  } catch (e) {
    console.log('Save subscription error:', e);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr;
}

let notifPanelOpen = false;
function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  notifPanelOpen = !notifPanelOpen;
  if (notifPanelOpen) {
    panel.classList.remove('hidden');
    loadNotifications();
  } else {
    panel.classList.add('hidden');
  }
}

async function loadNotifications() {
  try {
    const notifs = await apiGet('/api/notifications/user-notifications');
    const list = document.getElementById('notif-list');
    if (notifs.length === 0) {
      list.innerHTML = '<div class="notif-empty">مفيش إشعارات لسه</div>';
      return;
    }
    list.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" onclick="readNotif('${n._id}', '${n.url || '/'}')">
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-body">${n.body}</div>
        <div class="notif-item-time">${getTimeAgo(n.createdAt)}</div>
      </div>
    `).join('');
  } catch (e) {}
}

async function loadNotifCount() {
  try {
    const { count } = await apiGet('/api/notifications/unread-count');
    const badge = document.getElementById('notif-count');
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  } catch (e) {}
}

async function readNotif(id, url) {
  try {
    await apiPut(`/api/notifications/${id}/read`);
    if (url && url !== '/') window.location.hash = url;
    toggleNotifPanel();
    loadNotifCount();
  } catch (e) {}
}

async function markAllNotifsRead() {
  try {
    await apiPut('/api/notifications/read-all');
    loadNotifications();
    loadNotifCount();
  } catch (e) {}
}

// ===== TOAST =====
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ===== BACKUP =====
async function downloadBackup() {
  try {
    showToast('جاري تجهيز الباك أب...');
    const token = localStorage.getItem('qp_token');
    const res = await fetch('/api/backup', { headers: { 'Authorization': 'Bearer ' + token } });
    if (!res.ok) throw new Error('Backup failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quick-pizza-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تحميل الباك أب ✅');
  } catch (e) {
    showToast('خطأ في الباك أب');
  }
}

// Close notif panel on outside click
document.addEventListener('click', (e) => {
  const panel = document.getElementById('notif-panel');
  const btn = document.getElementById('notif-btn');
  if (notifPanelOpen && panel && !panel.contains(e.target) && !btn?.contains(e.target)) {
    notifPanelOpen = false;
    panel.classList.add('hidden');
  }
});
