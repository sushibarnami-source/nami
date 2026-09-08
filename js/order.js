/* =========================================================
   NAMI — Table ordering page (order.html)
   ========================================================= */
(() => {
  'use strict';

  const SUPPORTED_LANGS = ['en', 'ka', 'ru'];
  let currentLang = (() => {
    try {
      const saved = localStorage.getItem('nami_lang');
      if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
    } catch (e) { /* localStorage unavailable */ }
    return 'ka';
  })();

  const UI = {
    en: {
      badge_table: 'Table',
      gate_eyebrow: 'NAMI • ნამი',
      gate_title: 'Which table are you at?',
      gate_lead: 'Enter the table number to start ordering.',
      gate_btn: 'Continue',
      gate_error_range: 'Please enter a valid table number (1–{max}).',
      menu_loading: 'Loading menu…',
      menu_error: "Couldn't load the menu. Please check your connection and reload.",
      menu_empty: 'No dishes in this category yet.',
      tab_rolls: 'Rolls', tab_nigiri: 'Nigiri', tab_maki: 'Maki', tab_futomaki: 'Futomaki',
      tab_tempuraRoll: 'Hot Rolls', tab_sets: 'Sets', tab_noodles: 'Noodles',
      tab_appetizers: 'Appetizers', tab_desserts: 'Desserts', tab_drinks: 'Drinks',
      cart_items_label: 'items',
      cart_title: 'Your order',
      cart_total_label: 'Total',
      cart_note_placeholder: 'Note for the kitchen (optional)',
      cart_submit: 'Send order',
      cart_sending: 'Sending…',
      cart_empty_error: 'error placing order',
      cart_error_generic: "Couldn't send your order. Please try again or tell a member of staff.",
      cart_remove: 'Remove',
      success_title: 'Order sent!',
      success_lead: 'Your order for table {table} is on its way to the kitchen.',
      success_another: 'Order more',
    },
    ka: {
      badge_table: 'მაგიდა',
      gate_eyebrow: 'NAMI • ნამი',
      gate_title: 'რომელ მაგიდასთან ხართ?',
      gate_lead: 'შეიყვანეთ მაგიდის ნომერი შეკვეთის დასაწყებად.',
      gate_btn: 'გაგრძელება',
      gate_error_range: 'გთხოვთ, შეიყვანოთ სწორი მაგიდის ნომერი (1–{max}).',
      menu_loading: 'მენიუ იტვირთება…',
      menu_error: 'მენიუს ჩატვირთვა ვერ მოხერხდა. შეამოწმეთ ინტერნეტი და განაახლეთ გვერდი.',
      menu_empty: 'ამ კატეგორიაში კერძები ჯერ არ არის.',
      tab_rolls: 'როლი', tab_nigiri: 'ნიგირი', tab_maki: 'მაკი', tab_futomaki: 'ფუტომაკი',
      tab_tempuraRoll: 'ცხელი როლი', tab_sets: 'სეტი', tab_noodles: 'ატრია',
      tab_appetizers: 'ხემსი', tab_desserts: 'დესერტი', tab_drinks: 'სასმელი',
      cart_items_label: 'ერთეული',
      cart_title: 'თქვენი შეკვეთა',
      cart_total_label: 'ჯამი',
      cart_note_placeholder: 'შენიშვნა სამზარეულოსთვის (არასავალდებულო)',
      cart_submit: 'შეკვეთის გაგზავნა',
      cart_sending: 'იგზავნება…',
      cart_empty_error: 'ჯერ დაამატეთ კერძი',
      cart_error_generic: 'შეკვეთის გაგზავნა ვერ მოხერხდა. სცადეთ თავიდან ან მიმართეთ პერსონალს.',
      cart_remove: 'წაშლა',
      success_title: 'შეკვეთა გაიგზავნა!',
      success_lead: 'თქვენი შეკვეთა (მაგიდა {table}) უკვე სამზარეულოშია.',
      success_another: 'კიდევ შეკვეთა',
    },
    ru: {
      badge_table: 'Стол',
      gate_eyebrow: 'NAMI • ნამи',
      gate_title: 'За каким вы столом?',
      gate_lead: 'Введите номер стола, чтобы начать заказ.',
      gate_btn: 'Продолжить',
      gate_error_range: 'Введите правильный номер стола (1–{max}).',
      menu_loading: 'Загрузка меню…',
      menu_error: 'Не удалось загрузить меню. Проверьте соединение и обновите страницу.',
      menu_empty: 'В этой категории пока нет блюд.',
      tab_rolls: 'Роллы', tab_nigiri: 'Нигири', tab_maki: 'Маки', tab_futomaki: 'Футомаки',
      tab_tempuraRoll: 'Темпура роллы', tab_sets: 'Сеты', tab_noodles: 'Лапша',
      tab_appetizers: 'Закуски', tab_desserts: 'Десерты', tab_drinks: 'Напитки',
      cart_items_label: 'позиций',
      cart_title: 'Ваш заказ',
      cart_total_label: 'Итого',
      cart_note_placeholder: 'Комментарий для кухни (необязательно)',
      cart_submit: 'Отправить заказ',
      cart_sending: 'Отправка…',
      cart_empty_error: 'сначала добавьте блюдо',
      cart_error_generic: 'Не удалось отправить заказ. Попробуйте снова или обратитесь к персоналу.',
      cart_remove: 'Удалить',
      success_title: 'Заказ отправлен!',
      success_lead: 'Ваш заказ (стол {table}) уже на кухне.',
      success_another: 'Заказать ещё',
    },
  };

  function t(key, vars) {
    let s = (UI[currentLang] && UI[currentLang][key]) || UI.en[key] || key;
    if (vars) Object.keys(vars).forEach(k => { s = s.replace(`{${k}}`, vars[k]); });
    return s;
  }

  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function parsePrice(price) {
    const m = String(price || '0').match(/[\d]+([.,]\d+)?/);
    return m ? parseFloat(m[0].replace(',', '.')) : 0;
  }

  function formatMoney(n) {
    return n.toFixed(2) + ' ₾';
  }

  /* ---------------------------------------------------------
     State
  --------------------------------------------------------- */
  let tableNumber = null;
  let tableCount = 12; // matches the site_settings default until the real value loads
  let menuItems = []; // flat list from Supabase
  let currentCategory = 'rolls';
  const cart = {}; // menu_item id -> { item, qty }

  const tableGate = document.getElementById('tableGate');
  const orderMenuSection = document.getElementById('orderMenuSection');
  const orderSuccessSection = document.getElementById('orderSuccessSection');
  const tableBadge = document.getElementById('tableBadge');
  const tableBadgeNum = document.getElementById('tableBadgeNum');
  const menuLoading = document.getElementById('menuLoading');
  const menuTabs = document.getElementById('menuTabs');
  const menuGrid = document.getElementById('menuGrid');
  const cartBar = document.getElementById('cartBar');
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');
  const cartModal = document.getElementById('cartModal');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartModalTotal = document.getElementById('cartModalTotal');
  const cartError = document.getElementById('cartError');
  const submitOrderBtn = document.getElementById('submitOrderBtn');

  /* ---------------------------------------------------------
     Language switch
  --------------------------------------------------------- */
  document.getElementById('langSwitch').addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-btn');
    if (!btn) return;
    currentLang = btn.dataset.lang;
    try { localStorage.setItem('nami_lang', currentLang); } catch (e2) { /* ignore */ }
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.getElementById('htmlRoot').lang = currentLang;
    applyI18n();
    if (menuItems.length) renderMenu(currentCategory);
    renderCart();
  });

  /* ---------------------------------------------------------
     Table gate
  --------------------------------------------------------- */
  function showTableError(msg) {
    const el = document.getElementById('tableError');
    el.textContent = msg;
    el.hidden = false;
  }

  function enterTable(num) {
    tableNumber = num;
    tableGate.hidden = true;
    orderMenuSection.hidden = false;
    tableBadge.hidden = false;
    tableBadgeNum.textContent = num;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('table', String(num));
      window.history.replaceState({}, '', url);
    } catch (e) { /* ignore */ }
  }

  document.getElementById('tableForm').addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('tableError').hidden = true;
    const val = parseInt(document.getElementById('tableInput').value, 10);
    if (!val || val < 1 || val > tableCount) {
      showTableError(t('gate_error_range', { max: tableCount }));
      return;
    }
    enterTable(val);
  });

  /* ---------------------------------------------------------
     Menu: load + render
  --------------------------------------------------------- */
  async function loadMenu() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
      menuLoading.textContent = t('menu_error');
      return;
    }
    try {
      const { data, error } = await supabaseClient
        .from('menu_items')
        .select('*')
        .eq('published', true)
        .order('category', { ascending: true })
        .order('sort_order', { ascending: false });

      if (error || !data) throw error || new Error('no data');

      menuItems = data.map(row => ({
        id: row.id,
        category: row.category,
        price: row.price,
        photo: row.photo_url || null,
        name: { en: row.name_en, ka: row.name_ka, ru: row.name_ru },
        desc: { en: row.desc_en, ka: row.desc_ka, ru: row.desc_ru },
      }));

      menuLoading.hidden = true;
      menuTabs.hidden = false;
      renderMenu(currentCategory);
    } catch (e) {
      menuLoading.textContent = t('menu_error');
    }
  }

  function qtyFor(id) { return (cart[id] && cart[id].qty) || 0; }

  function setQty(item, qty) {
    if (qty <= 0) { delete cart[item.id]; }
    else { cart[item.id] = { item, qty }; }
    renderCart();
    const stepper = menuGrid.querySelector(`[data-item-id="${item.id}"] .qty-value`);
    if (stepper) stepper.textContent = qtyFor(item.id);
  }

  function renderMenu(category) {
    currentCategory = category;
    const items = menuItems.filter(i => i.category === category);
    if (!items.length) {
      menuGrid.innerHTML = `<p class="menu-empty">${t('menu_empty')}</p>`;
      return;
    }
    menuGrid.innerHTML = items.map(item => {
      const name = item.name[currentLang] || item.name.en;
      const desc = item.desc[currentLang] || item.desc.en;
      const photoHtml = item.photo
        ? `<div class="menu-item-photo-wrap"><img class="menu-item-photo" src="${item.photo}" alt="${escapeHtml(name)}" loading="lazy"></div>`
        : '';
      return `
        <article class="menu-item" data-item-id="${item.id}">
          ${photoHtml}
          <div class="menu-item-top">
            <h3 class="menu-item-name">${escapeHtml(name)}</h3>
            <span class="menu-item-price">${escapeHtml(item.price)}</span>
          </div>
          <p class="menu-item-desc">${escapeHtml(desc)}</p>
          <div class="qty-stepper">
            <button type="button" class="qty-btn" data-qty-minus>−</button>
            <span class="qty-value">${qtyFor(item.id)}</span>
            <button type="button" class="qty-btn" data-qty-plus>+</button>
          </div>
        </article>
      `;
    }).join('');
  }

  menuGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.menu-item');
    if (!card) return;
    const id = card.dataset.itemId;
    const item = menuItems.find(i => i.id === id);
    if (!item) return;
    if (e.target.closest('[data-qty-plus]')) setQty(item, qtyFor(id) + 1);
    else if (e.target.closest('[data-qty-minus]')) setQty(item, Math.max(0, qtyFor(id) - 1));
  });

  menuTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.menu-tab');
    if (!btn) return;
    menuTabs.querySelectorAll('.menu-tab').forEach(b => b.classList.toggle('active', b === btn));
    renderMenu(btn.dataset.category);
  });

  /* ---------------------------------------------------------
     Cart
  --------------------------------------------------------- */
  function cartEntries() { return Object.values(cart); }

  function cartTotalValue() {
    return cartEntries().reduce((sum, e) => sum + parsePrice(e.item.price) * e.qty, 0);
  }

  function renderCart() {
    const entries = cartEntries();
    const count = entries.reduce((n, e) => n + e.qty, 0);
    cartBar.hidden = count === 0;
    cartCount.textContent = count;
    const total = formatMoney(cartTotalValue());
    cartTotal.textContent = total;
    cartModalTotal.textContent = total;

    cartItemsList.innerHTML = entries.map(({ item, qty }) => {
      const name = item.name[currentLang] || item.name.en;
      const lineTotal = formatMoney(parsePrice(item.price) * qty);
      return `
        <div class="order-cart-row">
          <div>
            <p style="margin:0; font-weight:600;">${escapeHtml(name)}</p>
            <div class="qty-stepper">
              <button type="button" class="qty-btn" data-cart-minus="${item.id}">−</button>
              <span class="qty-value">${qty}</span>
              <button type="button" class="qty-btn" data-cart-plus="${item.id}">+</button>
              <button type="button" class="order-cart-row-remove" data-cart-remove="${item.id}">${t('cart_remove')}</button>
            </div>
          </div>
          <span style="white-space:nowrap; font-weight:600;">${lineTotal}</span>
        </div>
      `;
    }).join('');
  }

  cartItemsList.addEventListener('click', (e) => {
    const plus = e.target.closest('[data-cart-plus]');
    const minus = e.target.closest('[data-cart-minus]');
    const remove = e.target.closest('[data-cart-remove]');
    const id = plus ? plus.dataset.cartPlus : minus ? minus.dataset.cartMinus : remove ? remove.dataset.cartRemove : null;
    if (!id || !cart[id]) return;
    const item = cart[id].item;
    if (plus) setQty(item, qtyFor(id) + 1);
    else if (minus) setQty(item, Math.max(0, qtyFor(id) - 1));
    else if (remove) setQty(item, 0);
  });

  document.getElementById('openCartBtn').addEventListener('click', () => { cartModal.hidden = false; });
  document.getElementById('cartCloseBtn').addEventListener('click', () => { cartModal.hidden = true; });
  document.getElementById('cartBackdrop').addEventListener('click', () => { cartModal.hidden = true; });

  /* ---------------------------------------------------------
     Submit order
  --------------------------------------------------------- */
  submitOrderBtn.addEventListener('click', async () => {
    cartError.hidden = true;
    const entries = cartEntries();
    if (!entries.length) { cartError.textContent = t('cart_empty_error'); cartError.hidden = false; return; }

    submitOrderBtn.disabled = true;
    submitOrderBtn.textContent = t('cart_sending');

    try {
      const orderId = crypto.randomUUID();
      const note = document.getElementById('orderNote').value.trim();

      const { error: orderErr } = await supabaseClient.from('orders').insert({
        id: orderId,
        table_number: tableNumber,
        status: 'new',
        note,
      });
      if (orderErr) throw orderErr;

      const itemRows = entries.map(({ item, qty }) => ({
        order_id: orderId,
        menu_item_id: item.id,
        name_en: item.name.en,
        name_ka: item.name.ka,
        name_ru: item.name.ru,
        price: item.price,
        quantity: qty,
      }));
      const { error: itemsErr } = await supabaseClient.from('order_items').insert(itemRows);
      if (itemsErr) throw itemsErr;

      showSuccess(entries);
    } catch (e) {
      cartError.textContent = t('cart_error_generic');
      cartError.hidden = false;
    } finally {
      submitOrderBtn.disabled = false;
      submitOrderBtn.textContent = t('cart_submit');
    }
  });

  function showSuccess(entries) {
    cartModal.hidden = true;
    orderMenuSection.hidden = true;
    cartBar.hidden = true;
    orderSuccessSection.hidden = false;
    document.getElementById('successLead').textContent = t('success_lead', { table: tableNumber });

    document.getElementById('successRecap').innerHTML = entries.map(({ item, qty }) => {
      const name = item.name[currentLang] || item.name.en;
      return `<div class="order-cart-row"><span>${qty}× ${escapeHtml(name)}</span><span>${formatMoney(parsePrice(item.price) * qty)}</span></div>`;
    }).join('') + `<div class="order-cart-total-row"><span>${t('cart_total_label')}</span><span>${formatMoney(entries.reduce((s, e) => s + parsePrice(e.item.price) * e.qty, 0))}</span></div>`;

    Object.keys(cart).forEach(k => delete cart[k]);
    document.getElementById('orderNote').value = '';
  }

  document.getElementById('orderAnotherBtn').addEventListener('click', () => {
    orderSuccessSection.hidden = true;
    orderMenuSection.hidden = false;
    renderMenu(currentCategory);
    renderCart();
  });

  /* ---------------------------------------------------------
     Init
  --------------------------------------------------------- */
  async function init() {
    document.getElementById('htmlRoot').lang = currentLang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === currentLang));
    applyI18n();

    if (supabaseClient) {
      try {
        const { data } = await supabaseClient.from('site_settings').select('table_count').eq('id', 1).single();
        if (data && data.table_count) tableCount = data.table_count;
      } catch (e) { /* keep default */ }
    }
    document.getElementById('tableInput').max = tableCount;

    await loadMenu();

    const params = new URLSearchParams(window.location.search);
    const fromUrl = parseInt(params.get('table'), 10);
    if (fromUrl && fromUrl >= 1 && fromUrl <= tableCount) {
      enterTable(fromUrl);
    }
  }

  init();
})();
