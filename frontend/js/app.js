/* ===== Quick Pizza - App.js ===== */
const API = '';
let currentUser = null;
let cartData = null;
let allProducts = [];
let allCategories = [];
let currentPage = 'home';
let currentCategory = null;
let favorites = JSON.parse(localStorage.getItem('qp_favorites') || '[]');
let heroTimer = null;
let heroProgressTimer = null;

// ===== I18N =====
let currentLang = localStorage.getItem('qp_lang') || 'ar';
const translations = {
  en: {
    home: 'Home', menu: 'Menu', cart: 'Cart', orders: 'Orders', profile: 'Profile',
    login: 'Login', logout: 'Logout', register: 'Register',
    search: 'Search for pizza, pies, drinks...',
    addToCart: 'Add to Cart', orderNow: 'Order Now',
    popular: 'Popular', featured: 'Featured', all: 'All',
    delivery: 'Delivery Fee', subtotal: 'Subtotal', total: 'Total',
    phone: 'Phone Number', notes: 'Special Notes', confirmOrder: 'Confirm Order',
    emptyCart: 'Cart is Empty', browseMenu: 'Browse Menu',
    noOrders: 'No orders yet', startOrder: 'Start your first order!',
    pending: 'Pending', confirmed: 'Confirmed', preparing: 'Preparing',
    ready: 'Ready', outForDelivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled',
    egp: 'EGP', save: 'Save', close: 'Close',
    homeHeroTitle: 'We found no one to compete with... so we compete with ourselves',
    homeHeroSub: 'Quick Pizza - Fastest delivery in Luxor',
    lang: 'AR', langTitle: 'العربية',
    categories: 'Categories', browseByCat: 'Browse by category',
    ourPicks: 'Our picks for you', viewAll: 'View all →',
    mostOrdered: 'Most ordered',
    cartTitle: '🛒 Cart', clearAll: 'Clear All',
    startOrderMsg: 'Add items to start ordering!',
    paymentMethod: '💳 Payment', cash: '💵 Cash', card: '💳 Card', online: '📱 Online',
    address: '📍 Delivery Address', change: 'Change',
    orderSummary: 'Order Summary', specialNotes: '📝 Special Notes',
    deliveryAddress: '📍 Delivery Address', placeOrder: 'Confirm Order',
    newItems: 'New', ordersTitle: '📦 My Orders',
    activeOrders: '🔔 Active Orders', pastOrders: '📦 Past Orders',
    tracking: 'Order Tracking', details: 'Order Details', paymentMethodLabel: '💳 Payment Method',
    chooseSize: 'Choose Size', addons: 'Optional Add-ons',
    qty: 'Qty', size: 'Size', toppings: 'Toppings', noProducts: 'No products found',
    trySearch: 'Try searching for something else',
    saveAddress: 'Save Address', selectAddress: 'Select delivery address',
    free: 'Free', mins: 'min', estTime: 'Estimated remaining time',
    rateOrder: 'Rate your experience', howWasFood: 'How was the food?',
    submitRating: 'Submit Rating', yourRating: 'Your Rating',
    phoneHint: 'Phone number so we can contact you',
    notesHint: 'e.g. No onions, extra sauce...',
    areaPrompt: 'Choose your area', city: 'City', street: 'Street',
    landmark: 'Landmark (optional)', area: 'Area',
    addToFav: 'Added to favorites', removeFav: 'Removed from favorites',
    addedToCart: 'Added to cart',
    activeNow: 'Active', filterAll: 'All',
    noOrdersYet: 'No orders yet',
    addNote: 'Add a note...',
    saveBtn: 'Save', cancelBtn: 'Cancel',
    orderReceived: 'Order received',
    orderConfirmed: 'Order confirmed',
    beingPrepared: 'Being prepared',
    orderReady: 'Order ready',
    outForDel: 'Out for delivery',
    deliveredMsg: 'Enjoy your meal!',
    orderNum: 'Order #',
    totalAmount: 'Total',
    adminPanel: 'Dashboard',
    welcomeBack: 'Welcome back!',
    loginToContinue: 'Login to continue your order',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    noAccount: "Don't have an account?",
    registerNow: 'Register now',
    createAccount: 'Create account',
    startOrdering: 'Start ordering from Quick Pizza',
    fullNamePlaceholder: 'Full name',
    phonePlaceholder: 'Phone number',
    passwordMinPlaceholder: 'Password (6+ characters)',
    haveAccount: 'Already have an account?',
    loginNow: 'Login now',
    footerBrand: 'Quick Pizza',
    copyright: '© 2026 Quick Pizza - All Rights Reserved'
  },
  ar: {
    home: 'الرئيسية', menu: 'القائمة', cart: 'السلة', orders: 'طلباتي', profile: 'حسابي',
    login: 'تسجيل الدخول', logout: 'تسجيل الخروج', register: 'إنشاء حساب',
    search: 'ابحث عن بيتزا، فطاير، مشروبات...',
    addToCart: 'أضف للسلة', orderNow: 'اطلب الآن',
    popular: 'الأكثر مبيعاً', featured: 'المميزة', all: 'الكل',
    delivery: 'رسوم التوصيل', subtotal: 'المجموع الفرعي', total: 'الإجمالي',
    phone: 'رقم التليفون', notes: 'ملاحظات خاصة', confirmOrder: 'تأكيد الطلب',
    emptyCart: 'السلة فاضية', browseMenu: 'تصفح القائمة',
    noOrders: 'مفيش طلبات لسه', startOrder: 'ابدأ أول طلب ليك!',
    pending: 'قيد الانتظار', confirmed: 'تم التأكيد', preparing: 'قيد التحضير',
    ready: 'جاهز', outForDelivery: 'في الطريق', delivered: 'تم التوصيل', cancelled: 'ملغي',
    egp: 'ج.م', save: 'حفظ', close: 'إلغاء',
    homeHeroTitle: 'لم نجد من ننافسه... فنافسنا أنفسنا',
    homeHeroSub: 'كويك بيتزا - أسرع توصيل في الأقصر',
    lang: 'EN', langTitle: 'English',
    categories: 'الأقسام', browseByCat: 'تصفح حسب القسم',
    ourPicks: 'اختياراتنا لك', viewAll: 'عرض الكل ←',
    mostOrdered: 'الأكثر طلباً',
    cartTitle: '🛒 سلة الطلب', clearAll: 'مسح الكل',
    startOrderMsg: 'عشان تبدأ تطلب أحلى أكل',
    paymentMethod: '💳 طريقة الدفع', cash: '💵 كاش', card: '💳 بطاقة', online: '📱 أونلاين',
    address: '📍 عنوان التوصيل', change: 'تغيير',
    orderSummary: 'ملخص الطلب', specialNotes: '📝 ملاحظات خاصة',
    deliveryAddress: '📍 عنوان التوصيل', placeOrder: 'تأكيد الطلب',
    newItems: 'جديد', ordersTitle: '📦 طلباتي',
    activeOrders: '🔔 طلبات جارية', pastOrders: '📦 طلبات سابقة',
    tracking: 'تتبع الطلب', details: 'تفاصيل الطلب', paymentMethodLabel: '💳 طريقة الدفع',
    chooseSize: 'اختر الحجم', addons: 'إضافات اختيارية',
    qty: 'الكمية', size: 'الحجم', toppings: 'الإضافات', noProducts: 'مفيش منتجات',
    trySearch: 'جرّب تبحث عن حاجة تانية',
    saveAddress: 'حفظ العنوان', selectAddress: 'اختر عنوان التوصيل',
    free: 'مجاني', mins: 'دقيقة', estTime: 'الوقت المتبقي التقريبي',
    rateOrder: 'قيّم تجربتك', howWasFood: 'كيف كان الأكل؟',
    submitRating: 'إرسال التقييم', yourRating: 'تقييمك',
    phoneHint: 'رقم التليفون عشان نتواصل معاك',
    notesHint: 'مثلاً: بدون بصل، صوص زيادة، بيتزا مشوية...',
    areaPrompt: 'اختر المنطقة', city: 'المدينة', street: 'الشارع',
    landmark: 'وصف قريب (اختياري)', area: 'المنطقة',
    addToFav: 'تمت الإضافة للمفضلة ❤️', removeFav: 'تمت الإزالة من المفضلة',
    addedToCart: 'تمت الإضافة للسلة ✅',
    activeNow: 'جارية', filterAll: 'الكل',
    noOrdersYet: 'مفيش طلبات لسه',
    addNote: 'أضف ملاحظة...',
    saveBtn: 'حفظ', cancelBtn: 'إلغاء',
    orderReceived: 'تم استلام الطلب',
    orderConfirmed: 'تم تأكيد الطلب',
    beingPrepared: 'جاري التحضير',
    orderReady: 'الطلب جاهز',
    outForDel: 'في الطريق ليك',
    deliveredMsg: 'بالهنا والشفا!',
    orderNum: 'طلب #',
    totalAmount: 'الإجمالي',
    adminPanel: 'لوحة التحكم',
    welcomeBack: 'أهلاً بيك تاني!',
    loginToContinue: 'سجل دخولك عشان تكمل طلبك',
    emailPlaceholder: 'البريد الإلكتروني',
    passwordPlaceholder: 'كلمة المرور',
    noAccount: 'مش عندك حساب؟',
    registerNow: 'سجل الآن',
    createAccount: 'اعمل حساب جديد',
    startOrdering: 'ابدأ تطلب من كويك بيتزا',
    fullNamePlaceholder: 'الاسم الكامل',
    phonePlaceholder: 'رقم الموبايل',
    passwordMinPlaceholder: 'كلمة المرور (6 أحرف على الأقل)',
    haveAccount: 'عندك حساب؟',
    loginNow: 'سجل دخول',
    footerBrand: 'كويك بيتزا',
    copyright: '© 2026 كويك بيتزا - جميع الحقوق محفوظة'
  }
};

function t(key) { return translations[currentLang]?.[key] || key; }
function ln(item) { if (!item) return ''; return currentLang === 'en' ? (item.name || item.nameAr || '') : (item.nameAr || item.name || ''); }
function ld(item) { if (!item) return ''; return currentLang === 'en' ? (item.description || item.descriptionAr || '') : (item.descriptionAr || item.description || ''); }

function toggleLang() {
  currentLang = currentLang === 'ar' ? 'en' : 'ar';
  localStorage.setItem('qp_lang', currentLang);
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLang;
  document.getElementById('lang-btn').innerHTML = `<span>${t('lang')}</span>`;
  document.getElementById('lang-btn').title = t('langTitle');
  // Re-render current page
  if (currentPage === 'home') loadHomePage();
  else if (currentPage === 'menu') {
    renderMenuSidebar();
    const cat = currentCategory;
    renderMenuProducts(cat ? allProducts.filter(p => p.category?._id === cat) : allProducts);
  } else if (currentPage === 'cart') renderCart();
  else if (currentPage === 'orders') loadOrdersPage();
  // Update fixed elements
  updateUILang();
}

function updateUILang() {
  document.title = currentLang === 'ar' ? 'كويك بيتزا | Quick Pizza' : 'Quick Pizza | كويك بيتزا';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.placeholder = t('search');
  const heroTitle = document.querySelector('.home-hero-title');
  if (heroTitle) heroTitle.innerHTML = t('homeHeroTitle').replace('...', '<br>');
  const heroSub = document.querySelector('.home-hero-subtitle');
  if (heroSub) heroSub.textContent = t('homeHeroSub');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLang;
  document.getElementById('lang-btn').innerHTML = `<span>${t('lang')}</span>`;
  document.getElementById('lang-btn').title = t('langTitle');
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
    checkRestaurantStatus();
  } catch (error) {
    console.error('Init error:', error);
  }
}

let _closeTimer = null;

function checkRestaurantStatus() {
  const egyptOffset = 2 * 60 * 60 * 1000;
  let _hidden = false;

  function showOverlay(remaining) {
    let existing = document.getElementById('closed-overlay');
    if (existing) existing.remove();
    _hidden = false;

    const hrs = Math.floor(remaining / 3600);
    const mins = Math.floor((remaining % 3600) / 60);
    const secs = remaining % 60;
    const timeStr = (hrs > 0 ? hrs + ' ساعة ' : '') + (mins > 0 || hrs > 0 ? mins + ' دقيقة ' : '') + secs + ' ثانية';

    const el = document.createElement('div');
    el.id = 'closed-overlay';
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)';
    el.innerHTML =
      '<div style="background:var(--surface,#fff);border-radius:20px;max-width:360px;width:100%;padding:32px 24px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:fadeIn 0.3s ease">' +
        '<div style="font-size:64px;margin-bottom:12px">😴</div>' +
        '<h2 style="margin:0 0 8px;font-size:20px;font-weight:800">المطعم مغلق الآن</h2>' +
        '<p style="margin:0 0 12px;color:var(--text-muted,#666);font-size:14px">مواعيد العمل: 9 صباحاً لـ 4 صباحاً</p>' +
        '<div style="direction:ltr;font-size:36px;font-weight:900;color:var(--primary,#d32f2f);font-variant-numeric:tabular-nums;margin-bottom:20px;font-family:monospace" id="close-timer">' + timeStr + '</div>' +
      '</div>';
    el.addEventListener('click', e => { if (e.target === el) { el.remove(); _hidden = true; } });
    document.body.appendChild(el);
  }

  function update() {
    const now = new Date();
    const egyptTime = new Date(now.getTime() + egyptOffset);
    const totalSeconds = egyptTime.getUTCHours() * 3600 + egyptTime.getUTCMinutes() * 60 + egyptTime.getUTCSeconds();

    const openStart = 9 * 3600, openEnd = 4 * 3600;
    const daySecs = 24 * 3600;
    const isOpen = totalSeconds >= openStart || totalSeconds < openEnd;

    const overlay = document.getElementById('closed-overlay');

    if (isOpen) {
      if (overlay) overlay.remove();
      return;
    }

    const remaining = totalSeconds < openStart ? openStart - totalSeconds : daySecs - totalSeconds + openStart;

    if (overlay) {
      const timerEl = document.getElementById('close-timer');
      if (timerEl) {
        const hrs = Math.floor(remaining / 3600);
        const mins = Math.floor((remaining % 3600) / 60);
        const secs = remaining % 60;
        timerEl.textContent = (hrs > 0 ? hrs + ' ساعة ' : '') + (mins > 0 || hrs > 0 ? mins + ' دقيقة ' : '') + secs + ' ثانية';
      }
    }
  }

  function onAnyClick() {
    if (_hidden && !document.getElementById('closed-overlay')) {
      const now = new Date();
      const egyptTime = new Date(now.getTime() + egyptOffset);
      const totalSeconds = egyptTime.getUTCHours() * 3600 + egyptTime.getUTCMinutes() * 60 + egyptTime.getUTCSeconds();
      const openStart = 9 * 3600, openEnd = 4 * 3600;
      const daySecs = 24 * 3600;
      const isOpen = totalSeconds >= openStart || totalSeconds < openEnd;
      if (!isOpen) {
        const remaining = totalSeconds < openStart ? openStart - totalSeconds : daySecs - totalSeconds + openStart;
        showOverlay(remaining);
      }
    }
  }

  if (_closeTimer) clearInterval(_closeTimer);
  const now = new Date();
  const egyptTime = new Date(now.getTime() + egyptOffset);
  const totalSeconds = egyptTime.getUTCHours() * 3600 + egyptTime.getUTCMinutes() * 60 + egyptTime.getUTCSeconds();
  const openStart = 9 * 3600, openEnd = 4 * 3600;
  const daySecs = 24 * 3600;
  const isOpen = totalSeconds >= openStart || totalSeconds < openEnd;

  if (!isOpen) {
    const remaining = totalSeconds < openStart ? openStart - totalSeconds : daySecs - totalSeconds + openStart;
    showOverlay(remaining);
  }

  update();
  _closeTimer = setInterval(update, 1000);
  document.addEventListener('click', onAnyClick);
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
  // Single static hero - no slider needed
}

// ===== NAVIGATION =====
let navHistory = [];

function goBack() {
  const prev = navHistory.pop();
  if (prev) navigateTo(prev);
  else navigateTo('home');
}

function navigateTo(page, data) {
  // Cleanup tracking timers
  if (trackingInterval) { clearInterval(trackingInterval); trackingInterval = null; }
  if (trackingCountdown) { clearInterval(trackingCountdown); trackingCountdown = null; }
  if (ordersAutoRefresh) { clearInterval(ordersAutoRefresh); ordersAutoRefresh = null; }
  if (omAutoRefresh) { clearInterval(omAutoRefresh); omAutoRefresh = null; }
  
  if (currentPage && currentPage !== page && currentPage !== 'tracking') {
    navHistory.push(currentPage);
  }
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
      adminRequestNotif();
      loadAdminDashboard();
      startEndOfDayCheck();
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
  updateUILang();
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
function scrollCategories(dir) {
  const row = document.getElementById('home-categories');
  if (!row) return;
  const scrollAmount = row.clientWidth * 0.6;
  row.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
}

function renderHomeCategories() {
  const c = document.getElementById('home-categories');
  c.innerHTML = allCategories.map(cat => `
    <div class="category-pill" onclick="navigateTo('menu', '${cat._id}')" style="background-image:url('${cat.image || ''}')">
      <div class="category-pill-overlay"></div>
      <span class="category-pill-icon">${cat.icon}</span>
      <div class="category-pill-name">${ln(cat)}</div>
    </div>
  `).join('');
}

function renderMenuSidebar() {
  const c = document.getElementById('menu-sidebar');
  c.innerHTML = `
    <div class="menu-sidebar-item active" onclick="filterByCategory(null, this)">
      <span class="menu-sidebar-icon">📋</span><span>${t('all')}</span>
    </div>
    ${allCategories.map(cat => `
      <div class="menu-sidebar-item" onclick="filterByCategory('${cat._id}', this)">
        <span class="menu-sidebar-icon">${cat.icon}</span><span>${ln(cat)}</span>
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
  document.getElementById('menu-title').textContent = cat ? ln(cat) : (currentLang === 'en' ? 'Menu' : 'القائمة');
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
  const map = {
    Pizza: '🍕', 'Savory Pies': '🫓', Sandwiches: '🥪', Panini: '🥖',
    'Grill & BBQ': '🥩', Extras: '➕', Soup: '🍜', 'Savory Crepes': '🥞',
    Calzone: '🥟', 'Italian Pasta': '🍝', 'Sweet Pies': '🥮', 'Sweet Crepes': '🫓',
    'Salads & Appetizers': '🥗', Beverages: '🥤'
  };
  return map[catName] || '🍕';
}
function getProductGradient(product) {
  const catName = product.category?.name || '';
  const map = {
    Pizza: 'linear-gradient(135deg, #e53935, #c62828)',
    'Savory Pies': 'linear-gradient(135deg, #f9a825, #f57f17)',
    Sandwiches: 'linear-gradient(135deg, #ff8f00, #ff6f00)',
    Panini: 'linear-gradient(135deg, #8d6e63, #5d4037)',
    'Grill & BBQ': 'linear-gradient(135deg, #d84315, #bf360c)',
    Extras: 'linear-gradient(135deg, #7b1fa2, #4a148c)',
    Soup: 'linear-gradient(135deg, #ffb300, #ff8f00)',
    'Savory Crepes': 'linear-gradient(135deg, #43a047, #2e7d32)',
    Calzone: 'linear-gradient(135deg, #e65100, #bf360c)',
    'Italian Pasta': 'linear-gradient(135deg, #c62828, #8e0000)',
    'Sweet Pies': 'linear-gradient(135deg, #ec407a, #ad1457)',
    'Sweet Crepes': 'linear-gradient(135deg, #ab47bc, #6a1b9a)',
    'Salads & Appetizers': 'linear-gradient(135deg, #66bb6a, #2e7d32)',
    Beverages: 'linear-gradient(135deg, #29b6f6, #0277bd)'
  };
  return map[catName] || 'linear-gradient(135deg, #ef5350, #b71c1c)';
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
    c.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-emoji">🔍</div><h3>${t('noProducts')}</h3><p>${t('trySearch')}</p></div>`;
    return;
  }
  c.innerHTML = products.map(p => productCard(p)).join('');
}

function productCard(p) {
  const emoji = getProductEmoji(p);
  const basePrice = p.sizes?.[0]?.price || p.price;
  const isFav = favorites.includes(p._id);

  let badges = '';
  if (p.isFeatured) badges += `<span class="product-badge featured">⭐ ${t('featured')}</span>`;
  if (p.isPopular) badges += `<span class="product-badge popular">🔥 ${t('popular')}</span>`;

  const gradient = getProductGradient(p);

  const imgTag = p.image
    ? `<img src="${p.image}" alt="${ln(p)}" class="product-card-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" onclick="event.stopPropagation(); openImageZoom('${p.image}')">
       <span class="product-emoji" style="display:none">${emoji}</span>`
    : `<span class="product-emoji" style="background:${gradient};width:100%;height:100%;border-radius:16px 16px 0 0;display:flex;align-items:center;justify-content:center;font-size:48px">${emoji}</span>`;

  return `
    <div class="product-card" onclick="openProductModal('${p._id}')">
      <div class="product-img">
        <div class="product-img-bg"></div>
        ${imgTag}
        <div class="product-badges">${badges}</div>
        <button class="product-fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${p._id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        </button>
        <div class="product-img-overlay">
          <div class="product-img-name">${ln(p)}</div>
          <div class="product-img-price">${basePrice} <small>${t('egp')}</small></div>
          <button class="product-img-add" onclick="event.stopPropagation(); quickAdd('${p._id}')">+</button>
        </div>
      </div>
    </div>
  `;
}

function openImageZoom(src) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:20000;display:flex;align-items:center;justify-content:center;padding:20px;cursor:zoom-out';
  overlay.innerHTML = `<img src="${src}" style="max-width:100%;max-height:100%;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.5);object-fit:contain">`;
  overlay.onclick = () => overlay.remove();
  document.body.appendChild(overlay);
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

    const c = currentLang === 'en' ? { cal: 'cal', min: 'min', hot: '🔥 Hot', chooseSize: t('chooseSize'), addons: t('addons'), addToCart: t('addToCart'), egp: t('egp') } : { cal: 'سعرة', min: 'دقيقة', hot: '🌶️ ', chooseSize: t('chooseSize'), addons: t('addons'), addToCart: t('addToCart'), egp: t('egp') };
    detail.innerHTML = `
      <div class="pd-image">${product.image ? `<img src="${product.image}" alt="${ln(product)}" style="width:100%;height:100%;object-fit:cover;cursor:zoom-in" onclick="event.stopPropagation(); openImageZoom('${product.image}')">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:64px;background:${getProductGradient(product)}">${emoji}</div>`}</div>
      <div class="pd-body">
        <div class="pd-name">${ln(product)}</div>
        <div class="pd-desc">${ld(product)}</div>
        <div class="pd-meta">
          ${product.calories ? `<div class="pd-meta-item">🔥 ${product.calories} ${c.cal}</div>` : ''}
          ${product.prepTime ? `<div class="pd-meta-item">⏱️ ${product.prepTime} ${c.min}</div>` : ''}
          ${product.spicyLevel > 0 ? `<div class="pd-meta-item">${'🌶️ '.repeat(product.spicyLevel)}${currentLang === 'en' ? 'Hot' : 'حار'}</div>` : ''}
        </div>
        ${product.sizes && product.sizes.length > 0 ? `
          <div class="pd-section-title">${c.chooseSize}</div>
          <div class="pd-sizes">
            ${product.sizes.map(s => `
              <button class="pd-size-btn ${selectedSize && selectedSize.name === s.name ? 'active' : ''}"
                onclick="window._selectSize('${s.name}')">
                ${ln(s)}
                <span class="pd-size-price">${s.price} ${c.egp}</span>
              </button>
            `).join('')}
          </div>
        ` : ''}
        ${product.toppings && product.toppings.length > 0 ? `
          <div class="pd-section-title">${c.addons}</div>
          <div class="pd-toppings">
            ${product.toppings.map(t => `
              <label class="pd-topping">
                <input type="checkbox" ${selectedToppings.find(st => st.name === t.name) ? 'checked' : ''}
                  onchange="window._toggleTopping('${t.name}')">
                <span class="pd-topping-label">${ln(t)}</span>
                <span class="pd-topping-price">+${t.price} ${c.egp}</span>
              </label>
            `).join('')}
          </div>
        ` : ''}
        <div class="pd-footer">
          <div class="pd-total-price">${totalPrice} <small>${c.egp}</small></div>
          <button class="btn btn-primary btn-lg pd-add-btn" onclick="window._addToCartFromModal()">${c.addToCart} 🛒</button>
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
      showToast(t('addedToCart'));
    } catch (e) {
      showToast(currentLang === 'en' ? 'Error adding to cart' : 'خطأ في الإضافة');
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
    showToast(t('addedToCart'));
  } catch (e) {
    showToast(currentLang === 'en' ? 'Error adding to cart' : 'خطأ في الإضافة');
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
            <div class="cart-item-name">${ln(item.product || item)}</div>
            <button class="cart-item-remove" onclick="removeCartItem('${item._id}')">✕</button>
          </div>
          <div class="cart-item-meta">
            ${item.size ? t('size') + ': ' + (currentLang === 'ar' ? ({ Small: 'صغير', Medium: 'وسط', Large: 'كبير', Slice: 'شريحة' }[item.size] || item.size) : item.size) : ''}
            ${item.toppings?.length ? ' • ' + t('addons') + ': ' + item.toppings.join(', ') : ''}
          </div>
          <div class="cart-item-bottom">
            <div class="qty-control">
              <button class="qty-btn" onclick="updateCartItem('${item._id}', ${item.quantity - 1})">−</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn" onclick="updateCartItem('${item._id}', ${item.quantity + 1})">+</button>
            </div>
            <div class="cart-item-price">${item.price * item.quantity} ${t('egp')}</div>
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
    const fee = getDeliveryFee(a.deliveryArea);
    const feeText = fee > 0 ? ` (${t('delivery')} ${fee} ${t('egp')})` : ` (${t('free')})`;
    display.textContent = `${a.city}، ${a.district || a.street || ''} ${feeText}`;
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
    showToast(currentLang === 'en' ? 'Error updating' : 'خطأ في التحديث');
  }
}

async function removeCartItem(itemId) {
  try {
    cartData = await apiDelete(`/api/cart/remove/${itemId}`);
    updateCartCount();
    renderCart();
    showToast(currentLang === 'en' ? 'Removed from cart' : 'تم الحذف من السلة');
  } catch (e) {
    showToast(currentLang === 'en' ? 'Error removing' : 'خطأ في الحذف');
  }
}

async function clearCart() {
  if (!confirm(currentLang === 'en' ? 'Clear everything from cart?' : 'مسح كل حاجة من السلة؟')) return;
  try {
    await apiDelete('/api/cart/clear');
    cartData = { items: [] };
    updateCartCount();
    renderCart();
    showToast(currentLang === 'en' ? 'Cart cleared' : 'تم مسح السلة');
  } catch (e) {
    showToast(currentLang === 'en' ? 'Error' : 'خطأ');
  }
}

function updateCartSummary() {
  try {
    const subtotal = cartData?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const deliveryArea = currentUser?.address?.deliveryArea || '';
    const delivery = getDeliveryFee(deliveryArea);
    const total = Math.max(subtotal + delivery, 0);

    document.getElementById('cart-subtotal').textContent = subtotal + ' ' + t('egp');
    document.getElementById('cart-delivery').textContent = delivery + ' ' + t('egp');
    document.getElementById('cart-total').textContent = total + ' ' + t('egp');
    document.getElementById('order-total-btn').textContent = total + ' ' + t('egp');
  } catch (e) {}
}

async function placeOrder() {
  if (!cartData || cartData.items.length === 0) return showToast(currentLang === 'en' ? 'Cart is empty' : 'السلة فاضية');
  if (!currentUser?.address?.city) {
    showToast(currentLang === 'en' ? 'Please add delivery address first' : 'من فضلك حدد عنوان التوصيل أولاً');
    openAddressModal();
    return;
  }
  if (!currentUser?.address?.deliveryArea) {
    showToast(currentLang === 'en' ? 'Please choose delivery area' : 'من فضلك اختر منطقة التوصيل');
    openAddressModal();
    return;
  }
  const phoneInput = document.getElementById('checkout-phone');
  const phone = phoneInput?.value?.trim();
  if (!phone) {
    showToast(currentLang === 'en' ? 'Please enter phone number' : 'من فضلك اكتب رقم التليفون');
    phoneInput?.focus();
    return;
  }
  if (!/^01\d{9}$/.test(phone)) {
    showToast(currentLang === 'en' ? 'Phone must be 11 digits starting with 01' : 'رقم التليفون يجب أن يكون 11 رقم يبدأ بـ 01');
    phoneInput?.focus();
    return;
  }
  try {
    const specialInstructions = document.getElementById('special-instructions')?.value || '';
    const order = await apiPost('/api/orders', {
      specialInstructions,
      deliveryAddress: currentUser.address,
      phone
    });
    document.getElementById('special-instructions').value = '';
    cartData = { items: [] };
    updateCartCount();
    showToast(currentLang === 'en' ? 'Order confirmed! 🎉' : 'تم تأكيد الطلب بنجاح! 🎉');
    navigateTo('tracking', order._id);
  } catch (e) {
    showToast(e.message || (currentLang === 'en' ? 'Error confirming order' : 'خطأ في تأكيد الطلب'));
    // Reload cart in case server cleared it
    const newCart = await apiGet('/api/cart').catch(() => null);
    if (newCart) cartData = newCart;
    updateCartCount();
    renderCart();
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
      listEl.innerHTML += `<div style="margin-bottom:8px"><h3 style="font-size:16px;font-weight:800;color:var(--primary)">${t('activeOrders')} <span class="live-dot"></span></h3></div>`;
      listEl.innerHTML += activeOrders.map(order => orderCardHTML(order, true)).join('');
    }
    if (pastOrders.length > 0) {
      listEl.innerHTML += `<div style="margin-top:20px;margin-bottom:8px"><h3 style="font-size:16px;font-weight:800;color:var(--text-muted)">${t('pastOrders')}</h3></div>`;
      listEl.innerHTML += pastOrders.map(order => orderCardHTML(order, false)).join('');
    }
  } catch (e) {
    showToast(currentLang === 'en' ? 'Error loading orders' : 'خطأ في تحميل الطلبات');
  }
}

function orderCardHTML(order, isActive) {
  const statusEmoji = { pending: '⏳', confirmed: '✅', preparing: '👨‍🍳', ready: '📦', out_for_delivery: '🚗', delivered: '🎉', cancelled: '❌' };
  const locale = currentLang === 'en' ? 'en-US' : 'ar-EG';
  return `
    <div class="order-card" onclick="navigateTo('tracking', '${order._id}')" ${isActive ? 'style="border-color:var(--primary);border-width:2px"' : ''}>
      <div class="order-header">
        <span class="order-number">${statusEmoji[order.status] || ''} ${t('orderNum')}${order.orderNumber}</span>
        <span class="order-status ${order.status}">${getStatusText(order.status)}</span>
      </div>
      <div class="order-items-text">
        ${order.items.map(i => `${ln(i)} ×${i.quantity}`).join(' • ')}
      </div>
      <div class="order-footer">
        <span class="order-date">${new Date(order.createdAt).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })} ${new Date(order.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
        <span class="order-total">${order.total} ${t('egp')}</span>
      </div>
      ${isActive ? `<div style="margin-top:10px"><button class="btn btn-primary btn-sm btn-block" onclick="event.stopPropagation(); navigateTo('tracking', '${order._id}')">${t('tracking')}</button></div>` : ''}
    </div>
  `;
}

function getStatusText(status) {
  const map = {
    pending: t('pending'), confirmed: t('confirmed'), preparing: t('preparing'),
    ready: t('ready'), out_for_delivery: t('outForDelivery'),
    delivered: t('delivered'), cancelled: t('cancelled')
  };
  const emojis = { pending: '⏳ ', confirmed: '✅ ', preparing: '👨‍🍳 ', ready: '📦 ', out_for_delivery: '🚗 ', delivered: '🎉 ', cancelled: '❌ ' };
  return (emojis[status] || '') + (map[status] || status);
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
    showToast(currentLang === 'en' ? 'Error loading order tracking' : 'خطأ في تحميل تتبع الطلب');
  }
}

function renderTrackingPage(order) {
  const steps = [
    { key: 'pending', icon: '⏳', title: t('orderReceived'), desc: t('pending'), time: order.createdAt },
    { key: 'confirmed', icon: '✅', title: t('orderConfirmed'), desc: t('confirmed') },
    { key: 'preparing', icon: '👨‍🍳', title: t('beingPrepared'), desc: t('preparing') },
    { key: 'ready', icon: '📦', title: t('orderReady'), desc: t('ready') },
    { key: 'out_for_delivery', icon: '🚗', title: t('outForDel'), desc: t('outForDelivery') },
    { key: 'delivered', icon: '🎉', title: t('delivered'), desc: t('deliveredMsg') }
  ];
  const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
  const currentIdx = statusOrder.indexOf(order.status);
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  const statusEmoji = isCancelled ? '❌' : isDelivered ? '🎉' : steps[currentIdx]?.icon || '⏳';
  const statusText = isCancelled ? t('cancelled') : isDelivered ? t('delivered') : steps[currentIdx]?.title || '';
  const eta = order.estimatedDelivery ? new Date(order.estimatedDelivery) : null;
  const now = new Date();
  const diff = eta ? Math.max(0, Math.floor((eta - now) / 1000)) : 0;
  const mins = Math.floor(diff / 60);
  const secs = diff % 60;
  const locale = currentLang === 'en' ? 'en-US' : 'ar-EG';

  const a = order.deliveryAddress || {};
  const areaName = a.deliveryArea ? (a.district || a.deliveryArea) : '';
  const addrText = [a.city, areaName, a.street, a.location].filter(Boolean).join(currentLang === 'en' ? ', ' : '، ') || (currentLang === 'en' ? 'Not set' : 'لم يتم التحديد');

  let countdownHTML = '';
  if (!isDelivered && !isCancelled && diff > 0) {
    countdownHTML = `
      <div class="track-countdown-wrap">
        <div class="track-countdown-label">${t('estTime')}</div>
        <div class="track-countdown">
          <div class="track-cd-box"><div class="track-cd-num" id="cd-min">${mins}</div><div class="track-cd-label">${t('mins')}</div></div>
          <div class="track-cd-box"><div class="track-cd-num" id="cd-sec">${String(secs).padStart(2, '0')}</div><div class="track-cd-label">${currentLang === 'en' ? 'sec' : 'ثانية'}</div></div>
        </div>
      </div>
    `;
  }

  const heroHTML = isDelivered ? `
    <div class="track-delivered-banner">
      <div class="track-hero-back" onclick="goBack()">→ ${t('orders')}</div>
      <div class="track-hero-emoji">🎉</div>
      <div class="track-hero-order">${t('delivered')}</div>
      <div class="track-hero-status" style="opacity:0.8;margin-top:6px">${t('deliveredMsg')}</div>
    </div>
  ` : isCancelled ? `
    <div class="track-hero" style="background:linear-gradient(135deg,#616161,#424242)">
      <div class="track-hero-back" onclick="goBack()">→ ${t('orders')}</div>
      <div class="track-hero-emoji">❌</div>
      <div class="track-hero-order">${t('cancelled')}</div>
    </div>
  ` : `
    <div class="track-hero">
      <div class="track-hero-back" onclick="goBack()">→ ${t('orders')}</div>
      <div class="track-hero-status">${statusText} <span class="live-dot"></span></div>
      <div class="track-hero-emoji">${statusEmoji}</div>
      <div class="track-hero-order">${t('orderNum')}${order.orderNumber}</div>
      ${countdownHTML}
    </div>
  `;

  const stepsHTML = steps.map((step, idx) => `
    <div class="track-step ${idx < currentIdx ? 'done' : ''} ${idx === currentIdx && !isCancelled ? 'active' : ''}">
      <div class="step-dot">${idx < currentIdx ? '✓' : step.icon}</div>
      <div class="step-text">
        <h4>${step.title}</h4>
        <p>${step.desc}</p>
        ${step.time ? `<div class="step-time">${new Date(step.time).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</div>` : ''}
      </div>
    </div>
  `).join('');

  const itemsHTML = order.items.map(item => `
    <div class="track-item">
      <div class="track-item-emoji">${getProductEmoji(item.product || {})}</div>
      <div class="track-item-info">
        <div class="track-item-name">${ln(item)}</div>
        <div class="track-item-meta">
          ${t('qty')}: ${item.quantity}
          ${item.size ? ` • ${t('size')}: ${item.size}` : ''}
          ${item.toppings?.length ? ` • ${item.toppings.join(', ')}` : ''}
        </div>
      </div>
      <div class="track-item-price">${item.price * item.quantity} ${t('egp')}</div>
    </div>
  `).join('');

  let ratingHTML = '';
  if (isDelivered && !order.rating) {
    ratingHTML = `
      <div class="track-rating-card" id="rating-card">
        <div class="track-detail-title" style="justify-content:center">⭐ ${t('rateOrder')}</div>
        <h3>${t('howWasFood')}</h3>
        <div class="track-rating-stars" id="rating-stars">
          <div class="track-star" data-v="1" onclick="setRating(1)">⭐</div>
          <div class="track-star" data-v="2" onclick="setRating(2)">⭐</div>
          <div class="track-star" data-v="3" onclick="setRating(3)">⭐</div>
          <div class="track-star" data-v="4" onclick="setRating(4)">⭐</div>
          <div class="track-star" data-v="5" onclick="setRating(5)">⭐</div>
        </div>
        <textarea class="track-rating-input" id="rating-text" placeholder="${currentLang === 'en' ? 'Write your review... (optional)' : 'اكتب رأيك... (اختياري)'}"></textarea>
        <button class="btn btn-primary btn-lg" onclick="submitRating('${order._id}')">${t('submitRating')}</button>
      </div>
    `;
  } else if (isDelivered && order.rating) {
    ratingHTML = `
      <div class="track-rating-card">
        <h3>${t('yourRating')}</h3>
        <div style="font-size:28px;margin:10px 0">${'⭐'.repeat(order.rating)}</div>
        ${order.review ? `<p style="color:var(--text-muted);font-size:14px">"${order.review}"</p>` : ''}
      </div>
    `;
  }

  document.getElementById('tracking-content').innerHTML = `
    ${heroHTML}
    <div class="track-steps-card">
      <div class="track-steps-title">${t('tracking')}</div>
      ${stepsHTML}
    </div>
    <div class="track-detail-grid">
      <div class="track-detail-card full">
        <div class="track-detail-title">📋 ${t('details')}</div>
        ${itemsHTML}
        <div style="margin-top:12px">
          <div class="track-summary-line"><span>${t('subtotal')}</span><span>${order.subtotal} ${t('egp')}</span></div>
          <div class="track-summary-line"><span>${t('delivery')}</span><span>${order.deliveryFee} ${t('egp')}</span></div>
          <div class="track-summary-total"><span>${t('total')}</span><span>${order.total} ${t('egp')}</span></div>
        </div>
      </div>
      <div class="track-detail-card">
        <div class="track-detail-title">📍 ${t('deliveryAddress')}</div>
        <div class="track-addr-text">${addrText}</div>
        ${order.specialInstructions ? `<div style="margin-top:10px;font-size:13px;color:var(--text-muted);border-top:1px solid var(--border);padding-top:10px">📝 ${order.specialInstructions}</div>` : ''}
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
  if (currentRating === 0) return showToast(currentLang === 'en' ? 'Choose a rating first' : 'اختار تقييم أولاً');
  try {
    const review = document.getElementById('rating-text')?.value || '';
    await apiPost(`/api/orders/${orderId}/rate`, { rating: currentRating, review });
    showToast(currentLang === 'en' ? 'Thanks for rating! ⭐' : 'شكراً على تقييمك! ⭐');
    const order = await apiGet(`/api/orders/${orderId}`);
    renderTrackingPage(order);
  } catch (e) {
    showToast(currentLang === 'en' ? 'Error submitting rating' : 'خطأ في إرسال التقييم');
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
  btn.textContent = currentLang === 'en' ? 'Logging in...' : 'جاري تسجيل الدخول...';
  btn.disabled = true;
  try {
    const data = await apiPost('/api/auth/login', {
      email: document.getElementById('login-email').value,
      password: document.getElementById('login-password').value
    });
    saveToStorage(data.token, data.user);
    updateAuthUI();
    closeAuthModal();
    showToast((currentLang === 'en' ? 'Welcome ' : 'أهلاً بيك ') + data.user.name + '! 🎉');
    await loadCart();
    initPushNotifications();
    if (data.user.role === 'admin') {
      navigateTo('admin');
    }
  } catch (e) {
    showToast(currentLang === 'en' ? 'Invalid email or password' : 'بيانات الدخول غلط');
  } finally {
    btn.textContent = currentLang === 'en' ? 'Login' : 'تسجيل الدخول';
    btn.disabled = false;
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const phone = document.getElementById('reg-phone').value.trim();
  if (!/^01\d{9}$/.test(phone)) {
    showToast(currentLang === 'en' ? 'Phone must be 11 digits starting with 01' : 'رقم الموبايل يجب أن يكون 11 رقم يبدأ بـ 01');
    return;
  }
  try {
    const data = await apiPost('/api/auth/register', {
      name: document.getElementById('reg-name').value,
      email: document.getElementById('reg-email').value,
      phone,
      password: document.getElementById('reg-password').value
    });
    saveToStorage(data.token, data.user);
    updateAuthUI();
    closeAuthModal();
    initPushNotifications();
    showToast(currentLang === 'en' ? 'Account created! 🎉' : 'تم الحساب بنجاح! 🎉');
  } catch (e) {
    showToast(currentLang === 'en' ? 'Email already registered' : 'البريد مسجل بالفعل');
  }
}

function updateAuthUI() {
  const authBtn = document.getElementById('auth-btn');
  const mobileAuthLink = document.getElementById('mobile-auth-link');
  const adminLink = document.getElementById('mobile-admin-link');
  const ordersLink = document.getElementById('mobile-orders-link');
  const adminHeaderBtn = document.getElementById('admin-header-btn');
  if (currentUser) {
    const initial = currentUser.name?.charAt(0) || '👤';
    authBtn.innerHTML = `<span>${initial}</span>`;
    mobileAuthLink.querySelector('span:last-child').textContent = 'تسجيل الخروج';
    if (currentUser.role === 'admin') {
      adminLink.style.display = 'flex';
      ordersLink.style.display = 'flex';
      if (adminHeaderBtn) adminHeaderBtn.style.display = 'inline-flex';
    } else {
      adminLink.style.display = 'none';
      ordersLink.style.display = 'none';
      if (adminHeaderBtn) adminHeaderBtn.style.display = 'none';
    }
  } else {
    authBtn.innerHTML = '<span>👤</span>';
    mobileAuthLink.querySelector('span:last-child').textContent = 'تسجيل الدخول';
    if (adminHeaderBtn) adminHeaderBtn.style.display = 'none';
    adminLink.style.display = 'none';
    ordersLink.style.display = 'none';
    document.getElementById('notif-btn').style.display = 'none';
  }
}

function updateLocationUI() {
  const label = document.getElementById('location-label');
  if (currentUser?.address?.deliveryArea) {
    const fee = getDeliveryFee(currentUser.address.deliveryArea);
    label.textContent = currentUser.address.deliveryArea + (fee > 0 ? ` (${fee} ${t('egp')})` : '');
  } else if (currentUser?.address?.city) {
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
    <div class="profile-menu-item" onclick="showContactInfo()">
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

function showContactInfo() {
  closeProfileModal();
  const info = `
    <div style="padding:20px;text-align:center;direction:rtl">
      <div style="font-size:40px;margin-bottom:12px">📍</div>
      <h3 style="margin:0 0 16px;font-size:20px;font-weight:800">تواصل مع كويك بيتزا</h3>
      <div style="background:var(--surface-2);border-radius:12px;padding:16px;margin-bottom:12px;text-align:right">
        <p style="margin:6px 0"><strong>📍 الفرع:</strong> الأقصر - شارع التلفزيون</p>
        <p style="margin:6px 0"><strong>📞 تليفون:</strong> 2272970 - 2282002</p>
        <p style="margin:6px 0"><strong>📱 موبايل:</strong> 01111053251 - 01028700900 - 01281078250</p>
        <p style="margin:6px 0"><strong>🌐 الموقع:</strong> <a href="https://quick-pizza-production.up.railway.app" target="_blank" rel="noopener" style="color:var(--primary)">quick-pizza-production.up.railway.app</a></p>
      </div>
      <p style="color:var(--text-muted);font-size:13px">ننتظرك من 9 صباحاً لـ 4 صباحاً</p>
      <button onclick="this.closest('div[style]').remove()" style="margin-top:16px;padding:10px 32px;border:none;border-radius:8px;background:var(--primary);color:#fff;font-size:15px;font-weight:700;cursor:pointer">تم</button>
    </div>
  `;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = `<div style="background:#fff;border-radius:16px;max-width:380px;width:100%;box-shadow:0 16px 48px rgba(0,0,0,0.3)">${info}</div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function showFavorites() {
  closeProfileModal();
  navigateTo('menu');
  if (favorites.length === 0) {
    showToast(currentLang === 'en' ? 'No favorite products' : 'مفيش منتجات في المفضلة');
    return;
  }
  const favProducts = allProducts.filter(p => favorites.includes(p._id));
  document.getElementById('menu-title').textContent = (currentLang === 'en' ? 'Favorites ❤️' : 'المفضلة ❤️');
  document.getElementById('menu-products').innerHTML = favProducts.map(p => productCard(p)).join('');
}

function handleLogout() {
  if (confirm(currentLang === 'en' ? 'Are you sure you want to logout?' : 'هل تريد تسجيل الخروج؟')) {
    clearStorage();
    updateAuthUI();
    closeProfileModal();
    navigateTo('home');
    showToast(currentLang === 'en' ? 'Logged out' : 'تم تسجيل الخروج');
  }
}

// ===== ADDRESS =====
function openAddressModal() {
  const modal = document.getElementById('address-modal');
  if (currentUser?.address) {
    const a = currentUser.address;
    document.getElementById('addr-city').value = a.city || 'الأقصر';
    document.getElementById('addr-area').value = a.deliveryArea || '';
    document.getElementById('addr-street').value = a.street || '';
    document.getElementById('addr-location').value = a.location || '';
  }
  modal.classList.remove('hidden');
}

function closeAddressModal() {
  document.getElementById('address-modal').classList.add('hidden');
}

function getDeliveryFee(area) {
  const fees = {
    'داخل الأقصر': 0, 'القرنه': 70, 'الزنيه قبلي': 25, 'ارمنت الحيط': 50,
    'الضبعيه': 30, 'طيبه': 70, 'العشي': 50, 'المدامود': 35, 'المنشاه': 25,
    'الحبيل': 25, 'البغدادي': 35, 'المراسي': 25, 'الطود': 25, 'الرضوانيه': 25,
    'العديسات': 70, 'الحيط': 50, 'ارمنت الوابورات': 70, 'الصعايده': 30, 'الأقالته': 70
  };
  return fees[area] ?? 0;
}

async function saveAddress(e) {
  e.preventDefault();
  const area = document.getElementById('addr-area').value;
  const address = {
    city: document.getElementById('addr-city').value,
    district: area,
    street: document.getElementById('addr-street').value,
    location: document.getElementById('addr-location').value,
    deliveryArea: area
  };

  if (currentUser) {
    currentUser.address = address;
    localStorage.setItem('qp_user', JSON.stringify(currentUser));
    try {
      await apiPut('/api/auth/address', address);
    } catch (e) {}
  }

  updateLocationUI();
  if (currentPage === 'cart') { updateCartAddress(); updateCartSummary(); }
  closeAddressModal();
  showToast(currentLang === 'en' ? 'Address saved ✅' : 'تم حفظ العنوان ✅');
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

let prevAdminOrders = [];
let adminAudioCtx = null;
let adminPrevTitle = document.title;
let adminTitleFlashInterval = null;
let adminSoundEnabled = true;

function adminRequestNotif() {
  if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
}

function adminPlaySound() {
  if (!adminSoundEnabled) return;
  try {
    if (!adminAudioCtx) adminAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [660, 880, 1100].forEach((f, i) => {
      const o = adminAudioCtx.createOscillator();
      const g = adminAudioCtx.createGain();
      o.connect(g); g.connect(adminAudioCtx.destination);
      o.frequency.value = f; o.type = 'sine';
      const t = adminAudioCtx.currentTime + i * 0.12;
      g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      o.start(t); o.stop(t + 0.15);
    });
  } catch (e) {}
}

function adminShowNotif(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try { const n = new Notification(title, { body, icon: '/icons/icon-192.png', tag: 'admin-order', silent: true }); setTimeout(() => n.close(), 6000); } catch (e) {}
}

function adminFlashTitle(on) {
  if (adminTitleFlashInterval) { clearInterval(adminTitleFlashInterval); adminTitleFlashInterval = null; }
  if (on) {
    adminTitleFlashInterval = setInterval(() => {
      document.title = document.title === adminPrevTitle ? '🔔 طلب جديد!' : adminPrevTitle;
    }, 1000);
  } else { document.title = adminPrevTitle; }
}

function adminUpdateBadge(count) {
  const badge = document.getElementById('admin-notif-badge');
  if (!badge) return;
  if (count > 0) { badge.textContent = count > 9 ? '9+' : count; badge.classList.add('show'); }
  else { badge.classList.remove('show'); }
}

function adminToggleSound() {
  adminSoundEnabled = !adminSoundEnabled;
  const btn = document.getElementById('admin-sound-btn');
  if (btn) btn.textContent = adminSoundEnabled ? '🔊' : '🔇';
}

async function loadAdminDashboard() {
  try {
    const [allOrders, dailyRev] = await Promise.all([
      apiGet('/api/orders/all'),
      apiGet('/api/orders/revenue/current').catch(() => null)
    ]);
    const orders = allOrders.orders || [];
    const now = new Date();
    document.getElementById('admin-updated-at').textContent = 'آخر تحديث: ' + now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newPending = orders.filter(o => o.status === 'pending');
    const oldPendingIds = new Set(prevAdminOrders.filter(o => o.status === 'pending').map(o => o._id));
    const freshOrders = prevAdminOrders.length > 0 ? newPending.filter(o => !oldPendingIds.has(o._id)) : [];
    if (freshOrders.length > 0) {
      adminPlaySound();
      adminShowNotif('🍕 طلب جديد!', `طلب #${freshOrders[0].orderNumber} من ${freshOrders[0].user?.name || 'عميل'}`);
      adminUpdateBadge(freshOrders.length);
      adminFlashTitle(true);
      setTimeout(() => adminFlashTitle(false), 8000);
    } else if (newPending.length === 0) {
      adminUpdateBadge(0);
    }
    prevAdminOrders = [...orders];

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

    const dailyTotal = dailyRev?.totalRevenue || 0;
    const dailyOrders = dailyRev?.totalOrders || 0;

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
        <div class="stat-card" style="border:2px solid var(--primary)">
          <div class="stat-icon">📊</div>
          <div class="stat-value">${dailyTotal} ج</div>
          <div class="stat-label">إيرادات اليوم (${dailyOrders} طلب)</div>
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
          ${order.items.map(i => `<div class="aoc-item"><span>${i.nameAr || i.name}${i.size ? ` (${({Small:'صغير',Medium:'وسط',Large:'كبير',Regular:'عادي',Slice:'شريحة'}[i.size]||i.size)})` : ''} ×${i.quantity}</span><span>${i.price * i.quantity} ج</span></div>`).join('')}
        </div>
        <div class="aoc-address">📍 ${[a.city, a.deliveryArea || a.district, a.street].filter(Boolean).join('، ') || 'لم يحدد'}</div>
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
  document.getElementById('pf-price').value = '0';
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
  renderSizeRows([{ name: 'Regular', nameAr: 'عادي', price: '' }]);
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
  renderSizeRows((p.sizes && p.sizes.length > 0) ? p.sizes : [{ name: 'Regular', nameAr: 'عادي', price: p.price }]);
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

function renderSizeRows(sizes) {
  const container = document.getElementById('pf-sizes-container');
  if (!container) return;
  container.innerHTML = sizes.map((s, i) => `
    <div class="size-row" data-index="${i}">
      <span class="size-name">${s.name}</span>
      <span class="size-name-ar">(${s.nameAr})</span>
      <input type="number" class="size-price-input" value="${s.price !== undefined && s.price !== '' ? s.price : ''}" placeholder="السعر" min="0" required>
      ${s.name !== 'Regular' ? `<button type="button" class="size-del-btn" onclick="this.closest('.size-row').remove()">✕</button>` : ''}
      <input type="hidden" class="size-name-input" value="${s.name}">
      <input type="hidden" class="size-nameAr-input" value="${s.nameAr}">
    </div>
  `).join('');
}

function addSizeRow() {
  const container = document.getElementById('pf-sizes-container');
  if (!container) return;
  const i = container.children.length;
  const div = document.createElement('div');
  div.className = 'size-row';
  div.innerHTML = `
    <input class="size-name-input" style="min-width:90px;padding:6px 10px;border:1px solid var(--border);border-radius:6px;font-family:'Cairo';font-size:13px;text-align:center" placeholder="مثل Large">
    <input class="size-nameAr-input" style="min-width:70px;padding:6px 10px;border:1px solid var(--border);border-radius:6px;font-family:'Cairo';font-size:13px;text-align:center" placeholder="مثل كبيرة">
    <input type="number" class="size-price-input" style="width:100px;padding:6px 10px;border:1px solid var(--border);border-radius:6px;font-family:'Cairo';font-size:14px;text-align:center" placeholder="السعر" min="0" required>
    <button type="button" class="size-del-btn" onclick="this.closest('.size-row').remove()">✕</button>
  `;
  container.appendChild(div);
}

function getSizesFromForm() {
  const rows = document.querySelectorAll('#pf-sizes-container .size-row');
  return Array.from(rows).map(row => ({
    name: row.querySelector('.size-name-input')?.value || row.querySelector('.size-name')?.textContent.trim() || 'Regular',
    nameAr: row.querySelector('.size-nameAr-input')?.value || row.querySelector('.size-name-ar')?.textContent.replace(/[()]/g, '').trim() || 'عادي',
    price: Number(row.querySelector('.size-price-input').value) || 0
  }));
}

async function handleProductForm(e) {
  e.preventDefault();
  const id = document.getElementById('pf-id').value;
  const sizes = getSizesFromForm();
  const basePrice = sizes.length > 0 ? sizes[0].price : 0;
  const data = {
    name: document.getElementById('pf-name').value,
    nameAr: document.getElementById('pf-nameAr').value,
    description: document.getElementById('pf-desc').value,
    descriptionAr: document.getElementById('pf-descAr').value,
    price: basePrice,
    sizes: sizes,
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
      const phone = order.phone || order.user?.phone || 'لم يحدد';

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
            <div class="om-card-customer">👤 ${order.user?.name || 'غير معروف'} | 📞 ${phone === 'لم يحدد' ? phone : `<a href="tel:${phone}" style="color:#58a6ff;text-decoration:none">${phone}</a>`}</div>
        <div class="om-card-items">
          ${order.items.map(i => `
            <div class="om-card-item">
              <span class="om-card-item-name">${i.nameAr || i.name}${i.size ? ` (${({Small:'صغير',Medium:'وسط',Large:'كبير',Regular:'عادي',Slice:'شريحة'}[i.size]||i.size)})` : ''}</span>
              <span class="om-card-item-qty">×${i.quantity}</span>
              <span class="om-card-item-price">${i.price * i.quantity} ج</span>
            </div>
          `).join('')}
        </div>
        ${order.specialInstructions ? `<div class="om-card-note">📝 ${order.specialInstructions}</div>` : ''}
        ${order.rating ? `<div class="om-card-note" style="border-color:#f59e0b;background:rgba(245,158,11,0.08)">⭐ ${order.rating}/5 ${order.review ? `— "${order.review}"` : ''}</div>` : ''}
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

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(reg => {
      reg.update();
      console.log('SW registered:', reg.scope);
    }).catch(err => console.log('SW error:', err));
  });
}

function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         localStorage.getItem('qp_app_installed') === 'true';
}

function updateInstallUI() {
  const installed = isAppInstalled();
  const banner = document.getElementById('install-banner');
  const section = document.getElementById('install-section');
  if (installed) {
    if (banner) banner.classList.add('hidden');
    if (section) section.style.display = 'none';
  } else {
    if (banner) banner.classList.remove('hidden');
    if (section) section.style.display = '';
  }
}

updateInstallUI();

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  updateInstallUI();
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  localStorage.setItem('qp_app_installed', 'true');
  updateInstallUI();
  showToast(currentLang === 'en' ? 'App installed! ✅' : 'تم تثبيت التطبيق! ✅');
});

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choice => {
      if (choice.outcome === 'accepted') {
        showToast(currentLang === 'en' ? 'App installed! ✅' : 'تم تثبيت التطبيق! ✅');
        deferredPrompt = null;
        updateInstallUI();
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

// ===== BACKUP / RESTORE =====
async function restoreBackup() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!confirm(currentLang === 'en' ? 'This will restore data from backup. Continue?' : 'سيتم إضافة بيانات الباك أب. هل تريد الاستمرار؟')) return;
    try {
      showToast(currentLang === 'en' ? 'Restoring...' : 'جاري الاستعادة...');
      const text = await file.text();
      const backup = JSON.parse(text);
      const token = localStorage.getItem('qp_token');
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(backup)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Restore failed');
      showToast(currentLang === 'en' ? 'Restore complete ✅' : 'تم الاستعادة ✅');
      if (typeof loadAdminDashboard === 'function') loadAdminDashboard();
    } catch (err) {
      showToast(currentLang === 'en' ? 'Error: ' + err.message : 'خطأ: ' + err.message);
      console.error(err);
    }
  };
  input.click();
}

async function downloadExcel() {
  try {
    showToast('جاري تجهيز ملف Excel...');
    const token = localStorage.getItem('qp_token');
    const res = await fetch('/api/orders/export', { headers: { 'Authorization': 'Bearer ' + token } });
    if (!res.ok) throw new Error('Export failed');
    const data = await res.json();
    const orders = data.orders || [];
    const stats = data.stats || {};
    const todayOrders = data.todayOrders || [];

    function fmtDate(d) {
      return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
    function fmtTime(d) {
      return new Date(d).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    }
    function statusAr(s) {
      return { pending: 'بانتظار', confirmed: 'مؤكد', preparing: 'تحضير', ready: 'جاهز', out_for_delivery: 'في الطريق', delivered: 'تم التوصيل', cancelled: 'ملغي' }[s] || s;
    }

    const rows = orders.map(o => [
      '#' + (o.orderNumber || ''),
      fmtDate(o.createdAt),
      fmtTime(o.createdAt),
      o.user?.name || 'غير معروف',
      o.phone || o.user?.phone || '',
      o.items.map(i => `${i.nameAr || i.name}${i.size ? ' (' + ({Small:'صغير',Medium:'وسط',Large:'كبير',Slice:'شريحة',Regular:'عادي'}[i.size]||i.size) + ')' : ''} ×${i.quantity}`).join('\n'),
      o.subtotal,
      o.deliveryFee,
      o.total,
      statusAr(o.status),
      [o.deliveryAddress?.city, o.deliveryAddress?.district, o.deliveryAddress?.street].filter(Boolean).join(' - '),
      o.rating ? `${o.rating}/5 ${o.review ? '- ' + o.review : ''}` : '',
      o.specialInstructions || ''
    ]);

    const wb = XLSX.utils.book_new();

    // Sheet 1: كل الطلبات
    const ws1 = XLSX.utils.aoa_to_sheet([
      ['📊 كويك بيتزا - تقرير الطلبات'],
      ['تاريخ التقرير:', new Date().toLocaleDateString('ar-EG')],
      ['إجمالي الطلبات:', stats.total, '', 'إيرادات:', stats.revenue + ' ج.م'],
      ['طلبات اليوم:', stats.today, '', 'إيرادات اليوم:', stats.todayRevenue + ' ج.م'],
      ['بانتظار:', stats.pending, '', 'تم التوصيل:', stats.delivered, '', 'ملغي:', stats.cancelled],
      [],
      ['رقم', 'التاريخ', 'الوقت', 'العميل', 'الهاتف', 'الأصناف', 'الفرعي', 'التوصيل', 'الإجمالي', 'الحالة', 'العنوان', 'التقييم', 'ملاحظات'],
      ...rows
    ]);
    XLSX.utils.book_append_sheet(wb, ws1, 'كل الطلبات');

    // Sheet 2: ملخص اليوم
    const todayRows = todayOrders.map(o => [
      '#' + (o.orderNumber || ''),
      fmtTime(o.createdAt),
      o.user?.name || '',
      o.total,
      statusAr(o.status)
    ]);
    const ws2 = XLSX.utils.aoa_to_sheet([
      ['📅 تقرير اليوم - ' + new Date().toLocaleDateString('ar-EG')],
      [],
      ['رقم', 'الوقت', 'العميل', 'الإجمالي', 'الحالة'],
      ...todayRows
    ]);
    XLSX.utils.book_append_sheet(wb, ws2, 'اليوم');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_الطلبات_${new Date().toISOString().slice(0,10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تحميل ملف Excel ✅');
  } catch (e) {
    showToast('خطأ: ' + e.message);
    console.error(e);
  }
}

let _endOfDayInterval = null;

async function checkEndOfDay() {
  try {
    const token = localStorage.getItem('qp_token');
    if (!token) return;
    const res = await fetch('/api/orders/day-end-status', { headers: { 'Authorization': 'Bearer ' + token } });
    if (!res.ok) return;
    const data = await res.json();
    const reminderKey = 'qp_eod_reminder_' + data.todayStr;

    // Auto-export if within 30 min of day end and not done yet
    if (data.dayEndsInMin > 0 && data.dayEndsInMin <= 30 && !data.autoExportDone) {
      const exportRes = await fetch('/api/orders/auto-export', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const exportData = await exportRes.json();
      if (exportRes.ok && !exportData.cached) {
        showToast('✅ تم حفظ التقرير اليومي تلقائياً: ' + exportData.filename);
        if (data.dayEndsInMin <= 5 && !localStorage.getItem(reminderKey)) {
          if (confirm('📊 تم إنشاء تقرير اليوم! هل تريد فتحه؟')) {
            window.open('/exports/' + exportData.filename, '_blank');
          }
        }
        localStorage.setItem(reminderKey, 'done');
      }
    }

    // Show reminder if in window (after 11 PM or before 6 AM) and not done
    if (data.inReminderWindow && !data.autoExportDone && !localStorage.getItem(reminderKey)) {
      const hoursLeft = Math.floor(data.dayEndsInMin / 60);
      const minsLeft = data.dayEndsInMin % 60;
      const msg = data.dayEndsInMin > 0
        ? `⚠️ اليوم على وشك الانتهاء! متبقي ${hoursLeft} ساعة و ${minsLeft} دقيقة.\nهل تريد تحميل تقرير Excel الآن؟`
        : '⚠️ اليوم على وشك الانتهاء! هل تريد تحميل تقرير Excel الآن؟';
      if (confirm(msg + '\n\n(سيتم التأكيد تلقائياً قبل 5 دقائق من انتهاء اليوم)')) {
        await downloadExcel();
        localStorage.setItem(reminderKey, 'done');
      } else {
        // Remind again in 15 min
        localStorage.setItem(reminderKey, 'snooze');
        setTimeout(() => localStorage.removeItem(reminderKey), 15 * 60 * 1000);
      }
    }
  } catch (e) {
    console.error('End-of-day check error:', e);
  }
}

function startEndOfDayCheck() {
  if (_endOfDayInterval) clearInterval(_endOfDayInterval);
  checkEndOfDay();
  _endOfDayInterval = setInterval(checkEndOfDay, 60000);
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
