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
  let openTakeoutOrders = []; // [{ id, status, items }] — table_number is null
  let menuItems = [];
  let menuLoaded = false;
  let currentCategory = 'rolls';
  let currentTable = null;
  let currentOrderType = 'dine_in'; // 'dine_in' | 'takeout'
  const cart = {}; // menu_item id -> { item, qty }
  let allOrders = []; // for the Orders/Sales tabs — every order (not just open ones)

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
  const takeoutBtn = document.getElementById('takeoutBtn');
  const takeoutBadge = document.getElementById('takeoutBadge');
  const openCheckoutBtn = document.getElementById('openCheckoutBtn');
  const takeoutCustomerFields = document.getElementById('takeoutCustomerFields');
  const takeoutCustomerName = document.getElementById('takeoutCustomerName');
  const takeoutCustomerPhone = document.getElementById('takeoutCustomerPhone');
  const takeoutCustomerAddress = document.getElementById('takeoutCustomerAddress');
  const takeoutDeliveryFee = document.getElementById('takeoutDeliveryFee');

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
      .in('status', ['new', 'preparing', 'ready', 'served'])
      .order('created_at', { ascending: true });

    const orderIds = (orderRows || []).map(o => o.id);
    const { data: itemRows } = await supabaseClient
      .from('order_items')
      .select('*')
      .in('order_id', orderIds.length ? orderIds : ['00000000-0000-0000-0000-000000000000']);

    const itemsByOrder = {};
    (itemRows || []).forEach(it => { (itemsByOrder[it.order_id] = itemsByOrder[it.order_id] || []).push(it); });

    openOrdersByTable = {};
    openTakeoutOrders = [];
    (orderRows || []).forEach(o => {
      const order = { ...o, items: itemsByOrder[o.id] || [] };
      if (o.order_type === 'takeout') {
        openTakeoutOrders.push(order);
      } else {
        (openOrdersByTable[o.table_number] = openOrdersByTable[o.table_number] || []).push(order);
      }
    });
  }

  function renderTakeoutBadge() {
    const itemCount = openTakeoutOrders.reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0), 0);
    const isReady = openTakeoutOrders.some(o => o.status === 'ready');
    takeoutBtn.classList.toggle('has-ready-order', isReady);
    takeoutBtn.classList.toggle('has-open-order', !isReady && openTakeoutOrders.length > 0);
    takeoutBadge.hidden = openTakeoutOrders.length === 0;
    takeoutBadge.textContent = isReady ? '🔔 მზადაა' : `${itemCount} 🍣`;
  }

  function renderTableGrid() {
    let html = '';
    for (let n = 1; n <= tableCount; n++) {
      const open = openOrdersByTable[n] || [];
      const itemCount = open.reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0), 0);
      const isReady = open.some(o => o.status === 'ready');
      const cls = isReady ? 'has-ready-order' : (open.length ? 'has-open-order' : '');
      html += `
        <button type="button" class="waiter-table-btn ${cls}" data-table="${n}">
          <span class="waiter-table-num">${n}</span>
          ${open.length ? `<span class="waiter-table-badge">${isReady ? '🔔 მზადაა' : `${itemCount} 🍣`}</span>` : ''}
        </button>
      `;
    }
    tableGridEl.innerHTML = html;
    renderTakeoutBadge();
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
    currentOrderType = 'dine_in';
    Object.keys(cart).forEach(k => delete cart[k]);
    renderCart();
    orderScreen.hidden = true;
    tablesScreen.hidden = false;
    await loadOpenOrders();
    renderTableGrid();
  }

  /* ---------------------------------------------------------
     Order builder for one table, or for takeout
  --------------------------------------------------------- */
  function renderOpenOrdersForTable() {
    const open = currentOrderType === 'takeout' ? openTakeoutOrders : (openOrdersByTable[currentTable] || []);
    if (!open.length) { waiterOpenOrdersEl.innerHTML = ''; return; }
    waiterOpenOrdersEl.innerHTML = `
      <div class="waiter-open-orders-box">
        <p class="content-help" style="margin-bottom:8px;">უკვე გაგზავნილია — Already sent:</p>
        ${open.map(o => `
          <p class="order-note" style="font-style:normal; margin-bottom:6px;">
            ${o.items.map(it => `${it.quantity}× ${escapeHtml(it.name_ka || it.name_en)}`).join(', ')}
            ${currentOrderType === 'takeout' && o.customer_name ? ` — ${escapeHtml(o.customer_name)}` : ''}
            <span class="post-row-badge status-${o.status}">${o.status}</span>
          </p>
        `).join('')}
      </div>
    `;
  }

  async function selectTable(n) {
    currentTable = n;
    currentOrderType = 'dine_in';
    Object.keys(cart).forEach(k => delete cart[k]);
    renderCart();
    waiterTableTitle.textContent = `მაგიდა ${n} — Table ${n}`;
    openCheckoutBtn.hidden = false;
    takeoutCustomerFields.hidden = true;
    wPackagingSection.hidden = true;
    tablesScreen.hidden = true;
    orderScreen.hidden = false;
    renderOpenOrdersForTable();

    if (!menuLoaded) await loadMenu();
    if (menuLoaded) renderMenu(currentCategory);
  }

  async function selectTakeout() {
    currentTable = null;
    currentOrderType = 'takeout';
    Object.keys(cart).forEach(k => delete cart[k]);
    renderCart();
    waiterTableTitle.textContent = '🥡 გასატანი — Takeout';
    openCheckoutBtn.hidden = true;
    takeoutCustomerFields.hidden = false;
    takeoutCustomerName.value = '';
    takeoutCustomerPhone.value = '';
    takeoutCustomerAddress.value = '';
    takeoutDeliveryFee.value = '';
    wPackagingSection.hidden = false;
    tablesScreen.hidden = true;
    orderScreen.hidden = false;
    renderOpenOrdersForTable();

    if (!menuLoaded) await loadMenu();
    if (menuLoaded) { renderMenu(currentCategory); renderPackaging(); }
  }

  takeoutBtn.addEventListener('click', () => selectTakeout());

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
    // Search the whole page, not just one grid — this item's card could
    // be in the food menu grid or the packaging grid.
    const el = document.querySelector(`[data-item-id="${item.id}"] .qty-value`);
    if (el) el.textContent = qtyFor(item.id);
  }

  function itemCardHtml(item) {
    return `
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
    `;
  }

  function renderMenu(category) {
    currentCategory = category;
    const items = menuItems.filter(i => i.category === category);
    if (!items.length) { wMenuGrid.innerHTML = '<p class="menu-empty">ამ კატეგორიაში კერძები არ არის.</p>'; return; }
    wMenuGrid.innerHTML = items.map(itemCardHtml).join('');
  }

  function onQtyGridClick(e) {
    const card = e.target.closest('.menu-item');
    if (!card) return;
    const item = menuItems.find(i => i.id === card.dataset.itemId);
    if (!item) return;
    if (e.target.closest('[data-qty-plus]')) setQty(item, qtyFor(item.id) + 1);
    else if (e.target.closest('[data-qty-minus]')) setQty(item, Math.max(0, qtyFor(item.id) - 1));
  }

  wMenuGrid.addEventListener('click', onQtyGridClick);

  /* ---------------------------------------------------------
     Packaging — containers/bags added to takeout orders only
  --------------------------------------------------------- */
  const wPackagingSection = document.getElementById('wPackagingSection');
  const wPackagingGrid = document.getElementById('wPackagingGrid');

  function renderPackaging() {
    const items = menuItems.filter(i => i.category === 'packaging');
    wPackagingGrid.innerHTML = items.map(itemCardHtml).join('');
  }

  wPackagingGrid.addEventListener('click', onQtyGridClick);

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
    cartBar.hidden = count === 0;
    cartCount.textContent = count;
    document.getElementById('cartTitle').textContent = currentOrderType === 'takeout'
      ? '🥡 გასატანი — Takeout'
      : currentTable
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
    const headerLine = order.order_type === 'takeout'
      ? `🥡 გასატანი${order.customer_name ? ` — ${escapeHtml(order.customer_name)}` : ''}${order.customer_phone ? ` (${escapeHtml(order.customer_phone)})` : ''}`
      : `მაგიდა #${order.table_number}`;
    return `
      <div class="receipt is-kitchen">
        <div class="receipt-header">
          <p class="receipt-logo">სამზარეულო — KITCHEN</p>
        </div>
        <p class="receipt-table">${headerLine}</p>
        ${order.order_type === 'takeout' && order.customer_address ? `<p class="receipt-note">📍 ${escapeHtml(order.customer_address)}</p>` : ''}
        ${order.order_type === 'takeout' && order.delivery_fee ? `<p class="receipt-note">🚕 მიწოდება: ${Number(order.delivery_fee).toFixed(2)} ₾</p>` : ''}
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

    const isTakeout = currentOrderType === 'takeout';
    const customerName = isTakeout ? takeoutCustomerName.value.trim() : '';
    const customerPhone = isTakeout ? takeoutCustomerPhone.value.trim() : '';
    const customerAddress = isTakeout ? takeoutCustomerAddress.value.trim() : '';
    const deliveryFee = isTakeout ? (parseFloat(takeoutDeliveryFee.value) || 0) : 0;
    if (isTakeout && !customerName) {
      cartError.textContent = 'შეიყვანეთ მომხმარებლის სახელი — enter a customer name';
      cartError.hidden = false;
      return;
    }
    if (isTakeout && !customerAddress) {
      cartError.textContent = 'შეიყვანეთ მისამართი — enter a delivery address';
      cartError.hidden = false;
      return;
    }

    submitOrderBtn.disabled = true;
    submitOrderBtn.textContent = 'იგზავნება… — Sending…';

    try {
      const orderId = crypto.randomUUID();
      const note = document.getElementById('orderNote').value.trim();
      const createdAt = new Date().toISOString();

      const { error: orderErr } = await supabaseClient.from('orders').insert({
        id: orderId,
        table_number: isTakeout ? null : currentTable,
        order_type: currentOrderType,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        delivery_fee: deliveryFee,
        status: 'new', note, created_at: createdAt,
        created_by: currentUser.email || '',
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

      const order = {
        id: orderId, table_number: isTakeout ? null : currentTable, order_type: currentOrderType,
        customer_name: customerName, customer_phone: customerPhone, customer_address: customerAddress,
        delivery_fee: deliveryFee, note, created_at: createdAt, items: itemRows,
      };
      printKitchenTicket(order);

      showToast(isTakeout
        ? `შეკვეთა გაიგზავნა — გასატანი (${customerName}) — Sent to kitchen.`
        : `შეკვეთა გაიგზავნა — მაგიდა ${currentTable} — Sent to kitchen.`);
      cartModal.hidden = true;
      Object.keys(cart).forEach(k => delete cart[k]);
      document.getElementById('orderNote').value = '';
      renderCart();

      await loadOpenOrders();
      setTimeout(() => goToTables(), 700);
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
     Checkout: bill everything open for a table, print, close it
  --------------------------------------------------------- */
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutItemsList = document.getElementById('checkoutItemsList');
  const checkoutTotal = document.getElementById('checkoutTotal');
  const checkoutError = document.getElementById('checkoutError');
  const printCheckoutBtn = document.getElementById('printCheckoutBtn');

  function tableBillItems() {
    const open = (openOrdersByTable[currentTable] || []).filter(o => o.status !== 'cancelled');
    const items = [];
    open.forEach(o => o.items.forEach(it => items.push(it)));
    return { orders: open, items };
  }

  document.getElementById('openCheckoutBtn').addEventListener('click', () => {
    checkoutError.hidden = true;
    const { items } = tableBillItems();
    if (!items.length) {
      checkoutError.textContent = 'ამ მაგიდას ჯერ არაფერი შეუკვეთავს. — Nothing on this table yet.';
      checkoutError.hidden = false;
    }
    const total = items.reduce((sum, it) => sum + parsePrice(it.price) * it.quantity, 0);
    checkoutItemsList.innerHTML = items.map(it => `
      <div class="order-cart-row">
        <span>${it.quantity}× ${escapeHtml(it.name_ka || it.name_en)}</span>
        <span style="white-space:nowrap; font-weight:600;">${formatMoney(parsePrice(it.price) * it.quantity)}</span>
      </div>
    `).join('') || '<p class="admin-empty">—</p>';
    checkoutTotal.textContent = formatMoney(total);
    checkoutModal.hidden = false;
  });
  document.getElementById('checkoutCloseBtn').addEventListener('click', () => { checkoutModal.hidden = true; });
  document.getElementById('checkoutBackdrop').addEventListener('click', () => { checkoutModal.hidden = true; });

  function buildCheckoutReceiptHtml(table, items, total) {
    const itemsHtml = items.map(it => `
      <tr>
        <td>${it.quantity}×</td>
        <td>${escapeHtml(it.name_ka || it.name_en)}</td>
        <td>${formatMoney(parsePrice(it.price) * it.quantity)}</td>
      </tr>
    `).join('');
    return `
      <div class="receipt">
        <div class="receipt-header">
          <p class="receipt-logo">NAMI • ნამი</p>
          <p>წინასწარი ჩეკი — PRE-BILL</p>
        </div>
        <p class="receipt-table">მაგიდა #${table}</p>
        <p class="receipt-meta">${new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        <hr>
        <table class="receipt-items">${itemsHtml}</table>
        <hr>
        <p class="receipt-total">ჯამი: ${formatMoney(total)}</p>
        <p class="receipt-footer">გმადლობთ! 🙏</p>
      </div>
    `;
  }

  // Print-only: shows the customer the total, does not touch the order's
  // status — the table stays open until closeTableBtn is used, once
  // they've actually paid.
  printCheckoutBtn.addEventListener('click', () => {
    const { items } = tableBillItems();
    if (!items.length) return;
    const total = items.reduce((sum, it) => sum + parsePrice(it.price) * it.quantity, 0);
    printHtml(buildCheckoutReceiptHtml(currentTable, items, total));
  });

  document.getElementById('closeTableBtn').addEventListener('click', async () => {
    const { orders, items } = tableBillItems();
    if (!items.length) return;

    const closeBtn = document.getElementById('closeTableBtn');
    closeBtn.disabled = true;
    try {
      const orderIds = orders.map(o => o.id);
      const { error } = await supabaseClient.from('orders').update({ status: 'paid' }).in('id', orderIds);
      if (error) throw error;

      showToast(`მაგიდა ${currentTable} დაანგარიშდა — Table closed.`);
      checkoutModal.hidden = true;
      await loadOpenOrders();
      goToTables();
    } catch (e) {
      checkoutError.textContent = "ვერ დაიხურა მაგიდა, სცადეთ თავიდან. — Couldn't close the table.";
      checkoutError.hidden = false;
    } finally {
      closeBtn.disabled = false;
    }
  });

  /* ---------------------------------------------------------
     Main tabs: Tables / Orders / Sales
  --------------------------------------------------------- */
  const waiterTabPanes = {
    tables: document.getElementById('waiterTablesPane'),
    orders: document.getElementById('waiterOrdersPane'),
    sales: document.getElementById('waiterSalesPane'),
  };
  document.querySelectorAll('.admin-main-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-main-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
      const key = btn.dataset.wtab;
      Object.entries(waiterTabPanes).forEach(([k, pane]) => { pane.hidden = k !== key; });
      if (key === 'orders' || key === 'sales') loadAllOrders();
    });
  });

  /* ---------------------------------------------------------
     Orders tab — every order, with a status dropdown so a waiter
     can move it along and "close" it themselves (pick Paid).
     Sales tab — a read-only log of paid orders, same as dashboard.
  --------------------------------------------------------- */
  const ORDER_STATUSES = ['new', 'preparing', 'ready', 'served', 'paid', 'cancelled'];
  const ORDER_STATUS_LABELS = {
    new: 'New — ახალი',
    preparing: 'Preparing — მზადდება',
    ready: 'Ready — მზადაა',
    served: 'Served — მიწოდებული',
    paid: 'Paid — გადახდილი',
    cancelled: 'Cancelled — გაუქმებული',
  };

  const waiterOrderListEl = document.getElementById('waiterOrderList');
  const waiterOrderStatusFilter = document.getElementById('waiterOrderStatusFilter');
  const waiterNewOrderBadgeEl = document.getElementById('waiterNewOrderBadge');
  const waiterSalesListEl = document.getElementById('waiterSalesList');
  const waiterSalesPeriodFilter = document.getElementById('waiterSalesPeriodFilter');

  function orderTotal(order) {
    const itemsTotal = (order.items || []).reduce((sum, it) => sum + parsePrice(it.price) * it.quantity, 0);
    return itemsTotal + (Number(order.delivery_fee) || 0);
  }
  function formatOrderDate(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  async function loadAllOrders() {
    waiterOrderListEl.innerHTML = '<p class="admin-loading">Loading orders… — იტვირთება...</p>';
    const { data: orderRows, error } = await supabaseClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      waiterOrderListEl.innerHTML = `<p class="admin-empty">Couldn't load orders: ${escapeHtml(error.message)} — ვერ ჩაიტვირთა</p>`;
      return;
    }

    const orderIds = (orderRows || []).map(o => o.id);
    const { data: itemRows } = await supabaseClient
      .from('order_items')
      .select('*')
      .in('order_id', orderIds.length ? orderIds : ['00000000-0000-0000-0000-000000000000']);

    const itemsByOrder = {};
    (itemRows || []).forEach(it => { (itemsByOrder[it.order_id] = itemsByOrder[it.order_id] || []).push(it); });

    allOrders = (orderRows || []).map(o => ({ ...o, items: itemsByOrder[o.id] || [] }));
    renderWaiterOrderList();
    renderWaiterOrderStats();
    renderWaiterSalesList();
  }

  function renderWaiterOrderList() {
    const filter = waiterOrderStatusFilter.value;
    let filtered = allOrders;
    if (filter === '') filtered = allOrders.filter(o => o.status !== 'paid' && o.status !== 'cancelled');
    else if (filter !== 'everything') filtered = allOrders.filter(o => o.status === filter);

    if (!filtered.length) {
      waiterOrderListEl.innerHTML = '<p class="admin-empty">No orders here. — შეკვეთები არ არის.</p>';
      return;
    }

    waiterOrderListEl.innerHTML = filtered.map(o => {
      const itemsHtml = (o.items || [])
        .map(it => `<li>${it.quantity}× ${escapeHtml(it.name_ka || it.name_en)} — ${escapeHtml(it.price)}</li>`)
        .join('');
      const statusOptions = ORDER_STATUSES
        .map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${ORDER_STATUS_LABELS[s]}</option>`)
        .join('');
      return `
        <div class="post-row order-row status-${o.status}">
          <div class="post-row-icon">${o.order_type === 'takeout' ? '🥡' : '🍣'}</div>
          <div class="post-row-main">
            <p class="post-row-title">
              ${o.order_type === 'takeout'
                ? `Takeout — გასატანი${o.customer_name ? ` (${escapeHtml(o.customer_name)})` : ''}`
                : `Table ${o.table_number} — მაგიდა ${o.table_number}`}
              <span class="post-row-badge status-${o.status}">${ORDER_STATUS_LABELS[o.status]}</span>
            </p>
            ${o.order_type === 'takeout' && o.customer_phone ? `<p class="post-row-meta">📞 ${escapeHtml(o.customer_phone)}</p>` : ''}
            ${o.order_type === 'takeout' && o.customer_address ? `<p class="post-row-meta">📍 ${escapeHtml(o.customer_address)}</p>` : ''}
            ${o.order_type === 'takeout' ? `<p class="post-row-meta">🚕 მიწოდება: <input type="number" step="0.01" min="0" class="order-delivery-fee-input" data-order-delivery-fee="${o.id}" value="${Number(o.delivery_fee) || 0}" style="width:80px; padding:2px 6px; border-radius:4px; border:1px solid var(--border); font-family:var(--font-body);"> ₾</p>` : ''}
            <p class="post-row-meta">${formatOrderDate(o.created_at)} · <span class="order-row-total">${formatMoney(orderTotal(o))}</span></p>
            <ul class="order-items-list">${itemsHtml}</ul>
            ${o.note ? `<p class="order-note">📝 ${escapeHtml(o.note)}</p>` : ''}
          </div>
          <div class="post-row-actions">
            <select class="order-status-select" data-order-status="${o.id}">${statusOptions}</select>
            <button class="admin-btn-secondary" data-print-order="${o.id}">Print — ბეჭდვა</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderWaiterOrderStats() {
    document.getElementById('waiterStatNewOrders').textContent = allOrders.filter(o => o.status === 'new').length;
    document.getElementById('waiterStatPreparingOrders').textContent = allOrders.filter(o => o.status === 'preparing').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const paidToday = allOrders.filter(o => o.status === 'paid' && new Date(o.created_at) >= today);
    document.getElementById('waiterStatTodayRevenue').textContent = formatMoney(paidToday.reduce((sum, o) => sum + orderTotal(o), 0));

    const newCount = allOrders.filter(o => o.status === 'new').length;
    waiterNewOrderBadgeEl.hidden = newCount === 0;
    waiterNewOrderBadgeEl.textContent = String(newCount);
  }

  function periodStart(period) {
    const d = new Date();
    if (period === 'today') { d.setHours(0, 0, 0, 0); return d; }
    if (period === 'week') { d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - d.getDay()); return d; }
    if (period === 'month') { d.setHours(0, 0, 0, 0); d.setDate(1); return d; }
    return null; // all time
  }

  function renderWaiterSalesList() {
    const start = periodStart(waiterSalesPeriodFilter.value);
    const sold = allOrders
      .filter(o => o.status === 'paid')
      .filter(o => !start || new Date(o.created_at) >= start)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    document.getElementById('waiterStatSalesCount').textContent = String(sold.length);
    document.getElementById('waiterStatSalesRevenue').textContent = formatMoney(sold.reduce((sum, o) => sum + orderTotal(o), 0));

    if (!sold.length) {
      waiterSalesListEl.innerHTML = '<p class="admin-empty">No sales in this period. — ამ პერიოდში გაყიდვები არ არის.</p>';
      return;
    }

    waiterSalesListEl.innerHTML = sold.map(o => {
      const itemsHtml = (o.items || [])
        .map(it => `<li>${it.quantity}× ${escapeHtml(it.name_ka || it.name_en)} — ${escapeHtml(it.price)}</li>`)
        .join('');
      return `
        <div class="post-row order-row status-paid">
          <div class="post-row-icon">${o.order_type === 'takeout' ? '🥡' : '🍣'}</div>
          <div class="post-row-main">
            <p class="post-row-title">
              ${o.order_type === 'takeout'
                ? `Takeout — გასატანი${o.customer_name ? ` (${escapeHtml(o.customer_name)})` : ''}`
                : `Table ${o.table_number} — მაგიდა ${o.table_number}`}
            </p>
            <p class="post-row-meta">${formatOrderDate(o.created_at)} · <span class="order-row-total">${formatMoney(orderTotal(o))}</span></p>
            <ul class="order-items-list">${itemsHtml}</ul>
          </div>
          <div class="post-row-actions">
            <button class="admin-btn-secondary" data-print-order="${o.id}">Print — ბეჭდვა</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function buildOrderReceiptHtml(order) {
    const itemsHtml = (order.items || []).map(it => `
      <tr>
        <td>${it.quantity}×</td>
        <td>${escapeHtml(it.name_ka || it.name_en)}</td>
        <td>${formatMoney(parsePrice(it.price) * it.quantity)}</td>
      </tr>
    `).join('');
    return `
      <div class="receipt">
        <div class="receipt-header">
          <p class="receipt-logo">NAMI • ნამი</p>
          <p>სუში ბარი</p>
        </div>
        <p class="receipt-table">${order.order_type === 'takeout'
          ? `🥡 გასატანი${order.customer_name ? ` — ${escapeHtml(order.customer_name)}` : ''}`
          : `მაგიდა #${order.table_number}`}</p>
        ${order.order_type === 'takeout' && order.customer_address ? `<p class="receipt-note">📍 ${escapeHtml(order.customer_address)}</p>` : ''}
        <p class="receipt-meta">${formatOrderDate(order.created_at)} · #${order.id.slice(0, 8)}</p>
        <hr>
        <table class="receipt-items">${itemsHtml}</table>
        ${order.order_type === 'takeout' && Number(order.delivery_fee) > 0 ? `
        <table class="receipt-items">
          <tr><td>🚕</td><td>მიწოდება — Delivery</td><td>${formatMoney(Number(order.delivery_fee))}</td></tr>
        </table>` : ''}
        <hr>
        <p class="receipt-total">სულ: ${formatMoney(orderTotal(order))}</p>
        ${order.note ? `<p class="receipt-note">შენიშვნა: ${escapeHtml(order.note)}</p>` : ''}
        <p class="receipt-footer">გმადლობთ! 🙏</p>
      </div>
    `;
  }
  function printOrderReceipt(order) {
    if (!order) return;
    printHtml(buildOrderReceiptHtml(order));
  }

  waiterOrderStatusFilter.addEventListener('change', renderWaiterOrderList);
  waiterSalesPeriodFilter.addEventListener('change', renderWaiterSalesList);
  document.getElementById('waiterRefreshOrdersBtn').addEventListener('click', () => loadAllOrders());
  document.getElementById('waiterRefreshSalesBtn').addEventListener('click', () => loadAllOrders());

  waiterOrderListEl.addEventListener('change', async (e) => {
    const sel = e.target.closest('[data-order-status]');
    if (sel) {
      const id = sel.dataset.orderStatus;
      const { error } = await supabaseClient.from('orders').update({ status: sel.value }).eq('id', id);
      if (error) { showToast(`Couldn't update: ${error.message} — ვერ განახლდა`, true); return; }
      const o = allOrders.find(x => x.id === id);
      if (o) o.status = sel.value;
      renderWaiterOrderList();
      renderWaiterOrderStats();
      renderWaiterSalesList();
      return;
    }

    const feeInput = e.target.closest('[data-order-delivery-fee]');
    if (feeInput) {
      const id = feeInput.dataset.orderDeliveryFee;
      const fee = Number(feeInput.value) || 0;
      const { error } = await supabaseClient.from('orders').update({ delivery_fee: fee }).eq('id', id);
      if (error) { showToast(`Couldn't update: ${error.message} — ვერ განახლდა`, true); return; }
      const o = allOrders.find(x => x.id === id);
      if (o) o.delivery_fee = fee;
      renderWaiterOrderList();
      renderWaiterOrderStats();
      renderWaiterSalesList();
    }
  });

  waiterOrderListEl.addEventListener('click', (e) => {
    const printBtn = e.target.closest('[data-print-order]');
    if (printBtn) printOrderReceipt(allOrders.find(o => o.id === printBtn.dataset.printOrder));
  });

  waiterSalesListEl.addEventListener('click', (e) => {
    const printBtn = e.target.closest('[data-print-order]');
    if (printBtn) printOrderReceipt(allOrders.find(o => o.id === printBtn.dataset.printOrder));
  });

  /* ---------------------------------------------------------
     "Order ready" ping — from the kitchen back to this waiter
  --------------------------------------------------------- */
  const readyBannerEl = document.getElementById('readyBanner');
  const readyTables = new Set();

  function playReadyBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 660;
      gain.gain.value = 0.18;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
      osc.onended = () => ctx.close();
    } catch (e) { /* audio unavailable */ }
  }

  function renderReadyBanner() {
    if (!readyTables.size) { readyBannerEl.hidden = true; return; }
    const entries = Array.from(readyTables).sort((a, b) => {
      if (a === 'takeout') return -1;
      if (b === 'takeout') return 1;
      return a - b;
    });
    readyBannerEl.innerHTML = entries.map(n => `
      <span class="ready-banner-item">${n === 'takeout' ? '🥡 გასატანი მზადაა' : `🔔 მაგიდა ${n} მზადაა`} <button type="button" data-dismiss-ready="${n}">✕</button></span>
    `).join('');
    readyBannerEl.hidden = false;
  }

  readyBannerEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-dismiss-ready]');
    if (!btn) return;
    const val = btn.dataset.dismissReady;
    readyTables.delete(val === 'takeout' ? 'takeout' : parseInt(val, 10));
    renderReadyBanner();
  });

  function refreshWaiterOrdersTabsIfVisible() {
    if (!waiterTabPanes.orders.hidden) { renderWaiterOrderList(); renderWaiterOrderStats(); }
    if (!waiterTabPanes.sales.hidden) renderWaiterSalesList();
  }

  async function handleIncomingOrderForTabs(newOrderRow) {
    if (allOrders.some(o => o.id === newOrderRow.id)) return;
    // order_items are inserted right after the order row — give them a
    // moment to land before fetching, same as the admin dashboard.
    await new Promise(resolve => setTimeout(resolve, 900));
    const { data: itemRows } = await supabaseClient.from('order_items').select('*').eq('order_id', newOrderRow.id);
    allOrders.unshift({ ...newOrderRow, items: itemRows || [] });
    refreshWaiterOrdersTabsIfVisible();
  }

  function subscribeToReadyOrders() {
    if (!supabaseClient || typeof supabaseClient.channel !== 'function') return;
    supabaseClient.channel('waiter-ready-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        handleIncomingOrderForTabs(payload.new);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        const o = payload.new;
        const isTakeout = o.order_type === 'takeout';

        // Keep the local open-orders cache in sync so the table grid and
        // the "already sent" summary reflect the new status right away.
        const list = isTakeout ? openTakeoutOrders : (openOrdersByTable[o.table_number] || []);
        const existing = list.find(x => x.id === o.id);
        if (existing) Object.assign(existing, o);
        if (!tablesScreen.hidden) renderTableGrid();
        if (isTakeout ? currentOrderType === 'takeout' : currentTable === o.table_number) renderOpenOrdersForTable();

        const inAllOrders = allOrders.find(x => x.id === o.id);
        if (inAllOrders) Object.assign(inAllOrders, o);
        refreshWaiterOrdersTabsIfVisible();

        if (o.created_by === currentUser.email && o.status === 'ready' && payload.old.status !== 'ready') {
          readyTables.add(isTakeout ? 'takeout' : o.table_number);
          renderReadyBanner();
          playReadyBeep();
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders' }, (payload) => {
        allOrders = allOrders.filter(o => o.id !== payload.old.id);
        refreshWaiterOrdersTabsIfVisible();
      })
      .subscribe();
  }

  /* ---------------------------------------------------------
     Init
  --------------------------------------------------------- */
  (async () => {
    const ok = await requireAuth();
    if (!ok) return;
    await loadTableCount();
    await loadOpenOrders();
    renderTableGrid();
    subscribeToReadyOrders();
  })();
})();
