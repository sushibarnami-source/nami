/* =========================================================
   NAMI — Waiter order-taking app (admin/waiter.html)
   Staff pick a table, build an order, and send it straight to
   the kitchen printer. Shares the admin login (requireAuth).
   ========================================================= */
(() => {
  'use strict';

  let currentUser = null;
  let tableCount = 12;
  let openOrdersByTable = {}; // table_number -> [{ id, status, items }]
  let menuItems = [];
  let menuLoaded = false;
  let currentCategory = 'rolls';
  let currentTable = null;
  const cart = {}; // menu_item id -> { item, qty }

  const toastEl = document.getElementById('toast');
  const tableGridEl = document.getElementById('tableGrid');
  const tablesScreen = document.getElementById('waiterTablesScreen');
  const orderScreen = document.getElementById('waiterOrderScreen');
  const waiterTableTitle = document.getElementById('waiterTableTitle');
  const waiterOpenOrdersEl = document.getElementById('waiterOpenOrders');
  const wMenuLoading = document.getElementById('wMenuLoading');
  const wMenuTabs = document.getElementById('wMenuTabs');
  const wMenuGrid = document.getElementById('wMenuGrid');
  const cartBar = document.getElementById('cartBar');
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');
  const cartModal = document.getElementById('cartModal');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartModalTotal = document.getElementById('cartModalTotal');
  const cartError = document.getElementById('cartError');
  const submitOrderBtn = document.getElementById('submitOrderBtn');
  const printAreaEl = document.getElementById('printArea');

  function showToast(message, isError) {
    toastEl.textContent = message;
    toastEl.classList.toggle('is-error', !!isError);
    toastEl.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { toastEl.hidden = true; }, 3200);
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
  function formatMoney(n) { return n.toFixed(2) + ' ₾'; }

  /* ---------------------------------------------------------
     Auth guard — same rules as dashboard.html
  --------------------------------------------------------- */
  async function requireAuth() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
      tableGridEl.innerHTML = '<p class="admin-empty">Couldn\'t reach the login service. Check your connection and reload. — ვერ ხერხდება სერვისთან დაკავშირება.</p>';
      return false;
    }
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) { window.location.href = 'login.html'; return false; }
    // Staff (waiters) and admins can both take orders here; only admins
    // also get the link back to the full dashboard.
    const { data: isStaff } = await supabaseClient.rpc('is_staff');
    if (!isStaff) { await supabaseClient.auth.signOut(); window.location.href = 'login.html'; return false; }
    currentUser = session.user;
    document.getElementById('userEmail').textContent = currentUser.email || '';
    const { data: isAdmin } = await supabaseClient.rpc('is_admin');
    document.getElementById('dashboardLink').hidden = !isAdmin;
    return true;
  }

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
  });

  /* ---------------------------------------------------------
     Tables: how many, and which have an open round right now
  --------------------------------------------------------- */
  async function loadTableCount() {
    const { data } = await supabaseClient.from('site_settings').select('table_count').eq('id', 1).single();
    if (data && data.table_count) tableCount = data.table_count;
  }

  async function loadOpenOrders() {
    const { data: orderRows } = await supabaseClient
      .from('orders')
      .select('*')
      .in('status', ['new', 'preparing', 'served'])
      .order('created_at', { ascending: true });

    const orderIds = (orderRows || []).map(o => o.id);
    const { data: itemRows } = await supabaseClient
      .from('order_items')
      .select('*')
      .in('order_id', orderIds.length ? orderIds : ['00000000-0000-0000-0000-000000000000']);

    const itemsByOrder = {};
    (itemRows || []).forEach(it => { (itemsByOrder[it.order_id] = itemsByOrder[it.order_id] || []).push(it); });

    openOrdersByTable = {};
    (orderRows || []).forEach(o => {
      const order = { ...o, items: itemsByOrder[o.id] || [] };
      (openOrdersByTable[o.table_number] = openOrdersByTable[o.table_number] || []).push(order);
    });
  }

  function renderTableGrid() {
    let html = '';
    for (let n = 1; n <= tableCount; n++) {
      const open = openOrdersByTable[n] || [];
      const itemCount = open.reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0), 0);
      html += `
        <button type="button" class="waiter-table-btn ${open.length ? 'has-open-order' : ''}" data-table="${n}">
          <span class="waiter-table-num">${n}</span>
          ${open.length ? `<span class="waiter-table-badge">${itemCount} 🍣</span>` : ''}
        </button>
      `;
    }
    tableGridEl.innerHTML = html;
  }

  tableGridEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-table]');
    if (!btn) return;
    selectTable(parseInt(btn.dataset.table, 10));
  });

  document.getElementById('refreshTablesBtn').addEventListener('click', async () => {
    await loadOpenOrders();
    renderTableGrid();
  });

  document.getElementById('backToTablesBtn').addEventListener('click', () => goToTables());

  async function goToTables() {
    currentTable = null;
    Object.keys(cart).forEach(k => delete cart[k]);
    renderCart();
    orderScreen.hidden = true;
    tablesScreen.hidden = false;
    await loadOpenOrders();
    renderTableGrid();
  }

  /* ---------------------------------------------------------
     Order builder for one table
  --------------------------------------------------------- */
  function renderOpenOrdersForTable() {
    const open = openOrdersByTable[currentTable] || [];
    if (!open.length) { waiterOpenOrdersEl.innerHTML = ''; return; }
    waiterOpenOrdersEl.innerHTML = `
      <div class="waiter-open-orders-box">
        <p class="content-help" style="margin-bottom:8px;">უკვე გაგზავნილია — Already sent:</p>
        ${open.map(o => `
          <p class="order-note" style="font-style:normal; margin-bottom:6px;">
            ${o.items.map(it => `${it.quantity}× ${escapeHtml(it.name_ka || it.name_en)}`).join(', ')}
            <span class="post-row-badge status-${o.status}">${o.status}</span>
          </p>
        `).join('')}
      </div>
    `;
  }

  async function selectTable(n) {
    currentTable = n;
    Object.keys(cart).forEach(k => delete cart[k]);
    renderCart();
    waiterTableTitle.textContent = `მაგიდა ${n} — Table ${n}`;
    tablesScreen.hidden = true;
    orderScreen.hidden = false;
    renderOpenOrdersForTable();

    if (!menuLoaded) await loadMenu();
    if (menuLoaded) renderMenu(currentCategory);
  }

  async function loadMenu() {
    if (!supabaseClient) { wMenuLoading.textContent = "Couldn't load the menu. — მენიუ ვერ ჩაიტვირთა."; return; }
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
      }));
      menuLoaded = true;
      wMenuLoading.hidden = true;
      wMenuTabs.hidden = false;
    } catch (e) {
      wMenuLoading.textContent = "Couldn't load the menu. Check your connection. — მენიუ ვერ ჩაიტვირთა.";
    }
  }

  function qtyFor(id) { return (cart[id] && cart[id].qty) || 0; }
  function setQty(item, qty) {
    if (qty <= 0) delete cart[item.id];
    else cart[item.id] = { item, qty };
    renderCart();
    const el = wMenuGrid.querySelector(`[data-item-id="${item.id}"] .qty-value`);
    if (el) el.textContent = qtyFor(item.id);
  }

  function renderMenu(category) {
    currentCategory = category;
    const items = menuItems.filter(i => i.category === category);
    if (!items.length) { wMenuGrid.innerHTML = '<p class="menu-empty">ამ კატეგორიაში კერძები არ არის.</p>'; return; }
    wMenuGrid.innerHTML = items.map(item => `
      <article class="menu-item" data-item-id="${item.id}">
        <div class="menu-item-top">
          <h3 class="menu-item-name">${escapeHtml(item.name.ka || item.name.en)}</h3>
          <span class="menu-item-price">${escapeHtml(item.price)}</span>
        </div>
        <div class="qty-stepper">
          <button type="button" class="qty-btn" data-qty-minus>−</button>
          <span class="qty-value">${qtyFor(item.id)}</span>
          <button type="button" class="qty-btn" data-qty-plus>+</button>
        </div>
      </article>
    `).join('');
  }

  wMenuGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.menu-item');
    if (!card) return;
    const item = menuItems.find(i => i.id === card.dataset.itemId);
    if (!item) return;
    if (e.target.closest('[data-qty-plus]')) setQty(item, qtyFor(item.id) + 1);
    else if (e.target.closest('[data-qty-minus]')) setQty(item, Math.max(0, qtyFor(item.id) - 1));
  });

  wMenuTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.menu-tab');
    if (!btn) return;
    wMenuTabs.querySelectorAll('.menu-tab').forEach(b => b.classList.toggle('active', b === btn));
    renderMenu(btn.dataset.category);
  });

  /* ---------------------------------------------------------
     Cart (this round for the selected table)
  --------------------------------------------------------- */
  function cartEntries() { return Object.values(cart); }
  function cartTotalValue() { return cartEntries().reduce((s, e) => s + parsePrice(e.item.price) * e.qty, 0); }

  function renderCart() {
    const entries = cartEntries();
    const count = entries.reduce((n, e) => n + e.qty, 0);
    cartBar.hidden = count === 0 || currentTable === null;
    cartCount.textContent = count;
    document.getElementById('cartTitle').textContent = currentTable
      ? `მაგიდა ${currentTable} — This round`
      : 'ეს რაუნდი — This round';
    cartTotal.textContent = formatMoney(cartTotalValue());
    cartModalTotal.textContent = formatMoney(cartTotalValue());

    cartItemsList.innerHTML = entries.map(({ item, qty }) => `
      <div class="order-cart-row">
        <div>
          <p style="margin:0; font-weight:600;">${escapeHtml(item.name.ka || item.name.en)}</p>
          <div class="qty-stepper">
            <button type="button" class="qty-btn" data-cart-minus="${item.id}">−</button>
            <span class="qty-value">${qty}</span>
            <button type="button" class="qty-btn" data-cart-plus="${item.id}">+</button>
            <button type="button" class="order-cart-row-remove" data-cart-remove="${item.id}">წაშლა</button>
          </div>
        </div>
        <span style="white-space:nowrap; font-weight:600;">${formatMoney(parsePrice(item.price) * qty)}</span>
      </div>
    `).join('');
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
     Send to kitchen: insert the order, print a kitchen ticket
  --------------------------------------------------------- */
  function printHtml(html) {
    printAreaEl.innerHTML = html;
    document.body.classList.add('is-printing');
    window.print();
  }
  window.addEventListener('afterprint', () => {
    document.body.classList.remove('is-printing');
    printAreaEl.innerHTML = '';
  });

  function buildKitchenTicketHtml(order) {
    const itemsHtml = (order.items || [])
      .map(it => `<li><strong>${it.quantity}×</strong> ${escapeHtml(it.name_ka || it.name_en)}</li>`)
      .join('');
    const time = new Date(order.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `
      <div class="receipt is-kitchen">
        <div class="receipt-header">
          <p class="receipt-logo">სამზარეულო — KITCHEN</p>
        </div>
        <p class="receipt-table">მაგიდა #${order.table_number}</p>
        <p class="receipt-meta">${time}</p>
        <hr>
        <ul class="receipt-kitchen-list">${itemsHtml}</ul>
        ${order.note ? `<p class="receipt-note">⚠ ${escapeHtml(order.note)}</p>` : ''}
      </div>
    `;
  }

  submitOrderBtn.addEventListener('click', async () => {
    cartError.hidden = true;
    const entries = cartEntries();
    if (!entries.length) { cartError.textContent = 'ჯერ დაამატეთ კერძი — add a dish first'; cartError.hidden = false; return; }

    submitOrderBtn.disabled = true;
    submitOrderBtn.textContent = 'იგზავნება… — Sending…';

    try {
      const orderId = crypto.randomUUID();
      const note = document.getElementById('orderNote').value.trim();
      const createdAt = new Date().toISOString();

      const { error: orderErr } = await supabaseClient.from('orders').insert({
        id: orderId, table_number: currentTable, status: 'new', note, created_at: createdAt,
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

      const order = { id: orderId, table_number: currentTable, note, created_at: createdAt, items: itemRows };
      printKitchenTicket(order);

      showToast(`შეკვეთა გაიგზავნა — მაგიდა ${currentTable} — Sent to kitchen.`);
      cartModal.hidden = true;
      Object.keys(cart).forEach(k => delete cart[k]);
      document.getElementById('orderNote').value = '';
      renderCart();

      await loadOpenOrders();
      setTimeout(() => { if (currentTable !== null) goToTables(); }, 700);
    } catch (e) {
      cartError.textContent = "შეკვეთის გაგზავნა ვერ მოხერხდა, სცადეთ თავიდან. — Couldn't send the order.";
      cartError.hidden = false;
    } finally {
      submitOrderBtn.disabled = false;
      submitOrderBtn.textContent = 'გაგზავნა სამზარეულოში — Send to kitchen';
    }
  });

  function printKitchenTicket(order) { printHtml(buildKitchenTicketHtml(order)); }

  /* ---------------------------------------------------------
     Init
  --------------------------------------------------------- */
  (async () => {
    const ok = await requireAuth();
    if (!ok) return;
    await loadTableCount();
    await loadOpenOrders();
    renderTableGrid();
  })();
})();
