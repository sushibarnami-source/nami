/* =========================================================
   NAMI Admin — Dashboard logic
   ========================================================= */
(() => {
  'use strict';

  const LANGS = ['en', 'ka', 'ru'];
  let currentUser = null;
  let posts = [];
  let editingId = null; // null = creating a new post

  const postListEl = document.getElementById('postList');
  const overlay = document.getElementById('editorOverlay');
  const toastEl = document.getElementById('toast');

  /* ---------------------------------------------------------
     Auth guard
  --------------------------------------------------------- */
  async function requireAuth() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
      const msg = '<p class="admin-empty">Couldn\'t reach the login service. Check your connection and reload. — ვერ ხერხდება სერვისთან დაკავშირება, შეამოწმეთ ინტერნეტი და განაახლეთ გვერდი.</p>';
      document.getElementById('postList').innerHTML = msg;
      document.getElementById('dishList').innerHTML = msg;
      document.getElementById('inventoryList').innerHTML = msg;
      document.getElementById('orderList').innerHTML = msg;
      document.getElementById('messageList').innerHTML = msg;
      document.getElementById('settingsLoading').textContent = "Couldn't reach the login service. Check your connection and reload. — ვერ ხერხდება სერვისთან დაკავშირება.";
      return false;
    }
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      window.location.href = 'login.html';
      return false;
    }
    const { data: isAdmin } = await supabaseClient.rpc('is_admin');
    if (!isAdmin) {
      await supabaseClient.auth.signOut();
      window.location.href = 'login.html';
      return false;
    }
    currentUser = session.user;
    document.getElementById('userEmail').textContent = currentUser.email || '';
    return true;
  }

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
  });

  /* ---------------------------------------------------------
     Toast
  --------------------------------------------------------- */
  let toastTimer = null;
  function showToast(message, isError) {
    toastEl.textContent = message;
    toastEl.classList.toggle('is-error', !!isError);
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3200);
  }

  /* ---------------------------------------------------------
     Load + render post list
  --------------------------------------------------------- */
  async function loadPosts() {
    postListEl.innerHTML = '<p class="admin-loading">Loading posts… — იტვირთება...</p>';
    const { data, error } = await supabaseClient
      .from('blog_posts')
      .select('*')
      .order('sort_order', { ascending: false })
      .order('post_date', { ascending: false });

    if (error) {
      postListEl.innerHTML = `<p class="admin-empty">Couldn't load posts: ${escapeHtml(error.message)} — ვერ ჩაიტვირთა სტატიები</p>`;
      return;
    }

    posts = data || [];
    renderPostList();
  }

  function renderPostList() {
    if (!posts.length) {
      postListEl.innerHTML = '<p class="admin-empty">No posts yet — click "New Post" to add your first one. — სტატიები ჯერ არ არის, დააჭირეთ „New Post"-ს.</p>';
      return;
    }

    postListEl.innerHTML = posts.map(p => `
      <div class="post-row">
        <div class="post-row-icon">${p.icon || '📝'}</div>
        <div class="post-row-main">
          <p class="post-row-title">${escapeHtml(p.title_en)}</p>
          <p class="post-row-meta">${escapeHtml(p.post_date)} · ${escapeHtml(p.tag_en)}</p>
        </div>
        <span class="post-row-badge ${p.published ? 'is-published' : ''}">${p.published ? 'გამოქვეყნებული' : 'მონახაზი'}</span>
        <div class="post-row-actions">
          <button class="admin-btn-secondary" data-edit="${p.id}">Edit — რედაქტირება</button>
          <button class="admin-btn-danger" data-delete="${p.id}">Delete — წაშლა</button>
        </div>
      </div>
    `).join('');
  }

  postListEl.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit]');
    if (editBtn) {
      openEditor(posts.find(p => p.id === editBtn.dataset.edit));
      return;
    }
    const delBtn = e.target.closest('[data-delete]');
    if (delBtn) {
      deletePost(delBtn.dataset.delete);
    }
  });

  /* ---------------------------------------------------------
     Content <-> rich-text editor conversion
     Array shape matches BLOG_POSTS[].content[lang] on the public
     site: each entry is either a plain paragraph (may contain
     <strong>) or a raw <figure class="post-figure">...</figure>
     block, exactly what renderBlogModal() already expects.
     The editor is a real contenteditable area, so this reads/writes
     actual DOM nodes instead of a typed markdown-like syntax.
  --------------------------------------------------------- */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  // Cost per usable unit, after accounting for trim/waste (yield_pct).
  // 45 ₾/kg at 80% yield → 56.25 ₾/kg of actually-usable product.
  function effectiveCostPerUnit(item) {
    const yieldFraction = (Number(item.yield_pct) || 100) / 100;
    return (Number(item.cost_per_unit) || 0) / yieldFraction;
  }

  // Chrome/Firefox differ on which tag execCommand('bold') produces;
  // normalize to <strong> so saved HTML is consistent either way.
  function normalizeInlineHtml(html) {
    return html
      .replace(/<b(\s[^>]*)?>/gi, '<strong>')
      .replace(/<\/b>/gi, '</strong>')
      .trim();
  }

  function extractRteContent(rte) {
    const out = [];
    let buffer = [];
    function flushBuffer() {
      const html = normalizeInlineHtml(buffer.join(''));
      if (html && html !== '<br>') out.push(html);
      buffer = [];
    }
    rte.childNodes.forEach(node => {
      if (node.nodeType === 1 && node.tagName === 'FIGURE' && node.classList.contains('post-figure')) {
        flushBuffer();
        out.push(node.outerHTML);
      } else if (node.nodeType === 1 && (node.tagName === 'P' || node.tagName === 'DIV')) {
        flushBuffer();
        const inner = node.innerHTML.trim();
        if (inner && inner !== '<br>') out.push(normalizeInlineHtml(inner));
      } else if (node.nodeType === 1) {
        buffer.push(node.outerHTML);
      } else if (node.nodeType === 3 && node.textContent.trim()) {
        buffer.push(escapeHtml(node.textContent));
      }
    });
    flushBuffer();
    return out;
  }

  function populateRte(rte, arr) {
    if (arr && arr.length) {
      rte.innerHTML = arr.map(entry =>
        entry.trim().startsWith('<figure') ? entry : `<p>${entry}</p>`
      ).join('');
    } else {
      rte.innerHTML = '<p><br></p>';
    }
  }

  try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) { /* older browsers */ }

  /* ---------------------------------------------------------
     Editor: open / lang tabs / photo upload / save / delete
  --------------------------------------------------------- */
  function slugify(str) {
    const base = (str || 'post')
      .toLowerCase()
      .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-+|-+$)/g, '')
      .slice(0, 60);
    return (base || 'post') + '-' + Date.now().toString(36).slice(-5);
  }

  function switchLangTab(lang) {
    overlay.querySelectorAll('.lang-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    overlay.querySelectorAll('.lang-pane').forEach(pane => {
      pane.hidden = pane.dataset.langPane !== lang;
    });
  }
  overlay.querySelectorAll('.lang-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchLangTab(btn.dataset.lang));
  });

  function openEditor(post) {
    editingId = post ? post.id : null;
    document.getElementById('editorHeading').textContent = post ? 'Edit Post — სტატიის რედაქტირება' : 'New Post — ახალი სტატია';
    document.getElementById('deletePostBtn').hidden = !post;
    document.getElementById('editorError').textContent = '';

    document.getElementById('fIcon').value = post ? post.icon : '📝';
    document.getElementById('fGradient').value = post ? post.gradient : 'linear-gradient(135deg,#4f7a5c,#11241c)';
    document.getElementById('fDate').value = post ? post.post_date : new Date().toISOString().slice(0, 10);
    document.getElementById('fSortOrder').value = post ? post.sort_order : 0;
    document.getElementById('fPublished').checked = post ? post.published : true;

    LANGS.forEach(lang => {
      document.getElementById(`fTag_${lang}`).value = post ? post[`tag_${lang}`] : '';
      document.getElementById(`fTitle_${lang}`).value = post ? post[`title_${lang}`] : '';
      document.getElementById(`fExcerpt_${lang}`).value = post ? post[`excerpt_${lang}`] : '';
      populateRte(document.getElementById(`fContentRte_${lang}`), post ? post[`content_${lang}`] : null);
    });

    switchLangTab('en');
    overlay.hidden = false;
  }

  document.getElementById('newPostBtn').addEventListener('click', () => openEditor(null));
  document.getElementById('cancelEditBtn').addEventListener('click', () => { overlay.hidden = true; });

  // Rich-text toolbar: Bold + click-to-insert-photo, per language.
  LANGS.forEach(lang => {
    const rte = document.getElementById(`fContentRte_${lang}`);
    const boldBtn = document.querySelector(`[data-bold-for="${lang}"]`);
    const insertPhotoBtn = document.querySelector(`[data-insert-photo-for="${lang}"]`);
    const photoFileInput = document.querySelector(`[data-photo-file-for="${lang}"]`);
    let savedRange = null;

    // Prevent the toolbar buttons from stealing focus/selection away
    // from the editor before their click handler runs.
    boldBtn.addEventListener('mousedown', (e) => e.preventDefault());
    boldBtn.addEventListener('click', () => {
      rte.focus();
      document.execCommand('bold');
    });

    insertPhotoBtn.addEventListener('mousedown', (e) => e.preventDefault());
    insertPhotoBtn.addEventListener('click', () => {
      const sel = window.getSelection();
      savedRange = (sel.rangeCount > 0 && rte.contains(sel.anchorNode))
        ? sel.getRangeAt(0).cloneRange()
        : null;
      photoFileInput.click();
    });

    photoFileInput.addEventListener('change', async () => {
      const file = photoFileInput.files[0];
      if (!file) return;

      const caption = window.prompt('Caption for this photo (shown under it, in this language): — წარწერა ფოტოს ქვეშ (ამ ენაზე):', '');
      if (caption === null) { photoFileInput.value = ''; return; }

      const originalLabel = insertPhotoBtn.textContent;
      insertPhotoBtn.disabled = true;
      insertPhotoBtn.textContent = 'Uploading… — იტვირთება...';

      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabaseClient.storage.from('blog-photos').upload(path, file);

      insertPhotoBtn.disabled = false;
      insertPhotoBtn.textContent = originalLabel;

      if (uploadError) {
        showToast(`Upload failed: ${uploadError.message} — ატვირთვა ვერ მოხერხდა`, true);
        photoFileInput.value = '';
        return;
      }

      const { data: pub } = supabaseClient.storage.from('blog-photos').getPublicUrl(path);
      const figureHtml = `<figure class="post-figure"><img src="${pub.publicUrl}" alt="${escapeHtml(caption)}" loading="lazy"><figcaption>${escapeHtml(caption)}</figcaption></figure><p><br></p>`;

      rte.focus();
      const sel = window.getSelection();
      sel.removeAllRanges();
      if (savedRange) {
        sel.addRange(savedRange);
      } else {
        const range = document.createRange();
        range.selectNodeContents(rte);
        range.collapse(false);
        sel.addRange(range);
      }
      document.execCommand('insertHTML', false, figureHtml);
      photoFileInput.value = '';
    });
  });

  document.getElementById('savePostBtn').addEventListener('click', async () => {
    const errorEl = document.getElementById('editorError');
    errorEl.textContent = '';

    const titleEn = document.getElementById('fTitle_en').value.trim();
    if (!titleEn) {
      errorEl.textContent = 'An English title is required (used to generate the post link). — ინგლისური სათაური სავალდებულოა.';
      switchLangTab('en');
      return;
    }

    const payload = {
      icon: document.getElementById('fIcon').value.trim() || '📝',
      gradient: document.getElementById('fGradient').value,
      post_date: document.getElementById('fDate').value,
      sort_order: Number(document.getElementById('fSortOrder').value) || 0,
      published: document.getElementById('fPublished').checked,
    };

    LANGS.forEach(lang => {
      payload[`tag_${lang}`] = document.getElementById(`fTag_${lang}`).value.trim();
      payload[`title_${lang}`] = document.getElementById(`fTitle_${lang}`).value.trim();
      payload[`excerpt_${lang}`] = document.getElementById(`fExcerpt_${lang}`).value.trim();
      payload[`content_${lang}`] = extractRteContent(document.getElementById(`fContentRte_${lang}`));
    });

    const saveBtn = document.getElementById('savePostBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving… — ინახება...';

    let result;
    if (editingId) {
      result = await supabaseClient.from('blog_posts').update(payload).eq('id', editingId);
    } else {
      payload.slug = slugify(titleEn);
      result = await supabaseClient.from('blog_posts').insert(payload);
    }

    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Post — შენახვა';

    if (result.error) {
      errorEl.textContent = result.error.message;
      return;
    }

    overlay.hidden = true;
    showToast(editingId ? 'Post updated. — სტატია განახლდა.' : 'Post created. — სტატია დაემატა.');
    await loadPosts();
  });

  document.getElementById('deletePostBtn').addEventListener('click', async () => {
    if (!editingId) return;
    if (!window.confirm('Delete this post? This cannot be undone. — წავშალო სტატია? დაბრუნება შეუძლებელია.')) return;
    await deletePost(editingId);
    overlay.hidden = true;
  });

  async function deletePost(id) {
    const { error } = await supabaseClient.from('blog_posts').delete().eq('id', id);
    if (error) {
      showToast(`Couldn't delete: ${error.message} — ვერ წაიშალა`, true);
      return;
    }
    showToast('Post deleted. — სტატია წაიშალა.');
    await loadPosts();
  }

  /* ---------------------------------------------------------
     Orders: table orders + printing to a receipt printer
  --------------------------------------------------------- */
  const ORDER_STATUSES = ['new', 'preparing', 'served', 'paid', 'cancelled'];
  const ORDER_STATUS_LABELS = {
    new: 'New — ახალი',
    preparing: 'Preparing — მზადდება',
    served: 'Served — მიწოდებული',
    paid: 'Paid — გადახდილი',
    cancelled: 'Cancelled — გაუქმებული',
  };

  const orderListEl = document.getElementById('orderList');
  const newOrderBadgeEl = document.getElementById('newOrderBadge');
  const orderStatusFilter = document.getElementById('orderStatusFilter');
  const autoPrintToggle = document.getElementById('autoPrintToggle');
  const printAreaEl = document.getElementById('printArea');
  let orders = []; // each: { ...order row, items: [order_items rows] }
  let knownOrderIds = new Set();
  let siteTableCount = 12;

  try { autoPrintToggle.checked = localStorage.getItem('nami_admin_autoprint') === '1'; } catch (e) { /* ignore */ }
  autoPrintToggle.addEventListener('change', () => {
    try { localStorage.setItem('nami_admin_autoprint', autoPrintToggle.checked ? '1' : '0'); } catch (e) { /* ignore */ }
  });

  function parsePrice(price) {
    const m = String(price || '0').match(/[\d]+([.,]\d+)?/);
    return m ? parseFloat(m[0].replace(',', '.')) : 0;
  }
  function formatMoney(n) { return n.toFixed(2) + ' ₾'; }
  function orderTotal(order) {
    return (order.items || []).reduce((sum, it) => sum + parsePrice(it.price) * it.quantity, 0);
  }
  function formatOrderDate(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  async function loadOrders() {
    orderListEl.innerHTML = '<p class="admin-loading">Loading orders… — იტვირთება...</p>';
    const { data: orderRows, error } = await supabaseClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      orderListEl.innerHTML = `<p class="admin-empty">Couldn't load orders: ${escapeHtml(error.message)} — ვერ ჩაიტვირთა</p>`;
      return;
    }

    const orderIds = (orderRows || []).map(o => o.id);
    const { data: itemRows } = await supabaseClient
      .from('order_items')
      .select('*')
      .in('order_id', orderIds.length ? orderIds : ['00000000-0000-0000-0000-000000000000']);

    const itemsByOrder = {};
    (itemRows || []).forEach(it => { (itemsByOrder[it.order_id] = itemsByOrder[it.order_id] || []).push(it); });

    orders = (orderRows || []).map(o => ({ ...o, items: itemsByOrder[o.id] || [] }));
    knownOrderIds = new Set(orders.map(o => o.id));
    renderOrderList();
    renderOrderStats();
  }

  function renderOrderList() {
    const filter = orderStatusFilter.value;
    let filtered = orders;
    if (filter === '') filtered = orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled');
    else if (filter !== 'everything') filtered = orders.filter(o => o.status === filter);

    if (!filtered.length) {
      orderListEl.innerHTML = '<p class="admin-empty">No orders here. — შეკვეთები არ არის.</p>';
      return;
    }

    orderListEl.innerHTML = filtered.map(o => {
      const itemsHtml = (o.items || [])
        .map(it => `<li>${it.quantity}× ${escapeHtml(it.name_ka || it.name_en)} — ${escapeHtml(it.price)}</li>`)
        .join('');
      const statusOptions = ORDER_STATUSES
        .map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${ORDER_STATUS_LABELS[s]}</option>`)
        .join('');
      return `
        <div class="post-row order-row status-${o.status}">
          <div class="post-row-icon">🍣</div>
          <div class="post-row-main">
            <p class="post-row-title">
              Table ${o.table_number} — მაგიდა ${o.table_number}
              <span class="post-row-badge status-${o.status}">${ORDER_STATUS_LABELS[o.status]}</span>
            </p>
            <p class="post-row-meta">${formatOrderDate(o.created_at)} · <span class="order-row-total">${formatMoney(orderTotal(o))}</span></p>
            <ul class="order-items-list">${itemsHtml}</ul>
            ${o.note ? `<p class="order-note">📝 ${escapeHtml(o.note)}</p>` : ''}
          </div>
          <div class="post-row-actions">
            <select class="order-status-select" data-order-status="${o.id}">${statusOptions}</select>
            <button class="admin-btn-secondary" data-print-order="${o.id}">Print — ბეჭდვა</button>
            <button class="admin-btn-danger" data-delete-order="${o.id}">Delete — წაშლა</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderOrderStats() {
    document.getElementById('statNewOrders').textContent = orders.filter(o => o.status === 'new').length;
    document.getElementById('statPreparingOrders').textContent = orders.filter(o => o.status === 'preparing').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const paidToday = orders.filter(o => o.status === 'paid' && new Date(o.created_at) >= today);
    document.getElementById('statTodayRevenue').textContent = formatMoney(paidToday.reduce((sum, o) => sum + orderTotal(o), 0));

    const newCount = orders.filter(o => o.status === 'new').length;
    newOrderBadgeEl.hidden = newCount === 0;
    newOrderBadgeEl.textContent = String(newCount);
  }

  orderListEl.addEventListener('change', async (e) => {
    const sel = e.target.closest('[data-order-status]');
    if (!sel) return;
    const id = sel.dataset.orderStatus;
    const { error } = await supabaseClient.from('orders').update({ status: sel.value }).eq('id', id);
    if (error) { showToast(`Couldn't update: ${error.message} — ვერ განახლდა`, true); return; }
    const o = orders.find(x => x.id === id);
    if (o) o.status = sel.value;
    renderOrderList();
    renderOrderStats();
  });

  orderListEl.addEventListener('click', async (e) => {
    const printBtn = e.target.closest('[data-print-order]');
    if (printBtn) { printOrder(orders.find(o => o.id === printBtn.dataset.printOrder)); return; }

    const delBtn = e.target.closest('[data-delete-order]');
    if (delBtn) {
      if (!window.confirm('Delete this order? This cannot be undone. — წავშალო შეკვეთა? დაბრუნება შეუძლებელია.')) return;
      const id = delBtn.dataset.deleteOrder;
      const { error } = await supabaseClient.from('orders').delete().eq('id', id);
      if (error) { showToast(`Couldn't delete: ${error.message} — ვერ წაიშალა`, true); return; }
      orders = orders.filter(o => o.id !== id);
      knownOrderIds.delete(id);
      renderOrderList();
      renderOrderStats();
    }
  });

  document.getElementById('refreshOrdersBtn').addEventListener('click', () => loadOrders());
  orderStatusFilter.addEventListener('change', renderOrderList);

  /* ---------------------------------------------------------
     Printing — receipt (thermal/check printer) + table cards.
     #printArea is filled, body.is-printing is set (see admin.css,
     which hides everything else on paper/preview), then the OS
     print dialog opens; picking the till's receipt printer there
     is what "connects" this to a physical check printer.
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

  function buildReceiptHtml(order) {
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
        <p class="receipt-table">მაგიდა #${order.table_number}</p>
        <p class="receipt-meta">${formatOrderDate(order.created_at)} · #${order.id.slice(0, 8)}</p>
        <hr>
        <table class="receipt-items">${itemsHtml}</table>
        <hr>
        <p class="receipt-total">სულ: ${formatMoney(orderTotal(order))}</p>
        ${order.note ? `<p class="receipt-note">შენიშვნა: ${escapeHtml(order.note)}</p>` : ''}
        <p class="receipt-footer">გმადლობთ! 🙏</p>
      </div>
    `;
  }

  function printOrder(order) {
    if (!order) return;
    printHtml(buildReceiptHtml(order));
  }

  /* ---------------------------------------------------------
     Tables & QR — how many tables, and a printable QR/link per
     table pointing at ../order.html?table=N
  --------------------------------------------------------- */
  const tablesOverlay = document.getElementById('tablesOverlay');
  const tableCountInput = document.getElementById('tableCountInput');
  const tableLinksListEl = document.getElementById('tableLinksList');

  function siteBaseUrl() {
    return window.location.origin + window.location.pathname.replace(/admin\/dashboard\.html$/, '');
  }
  function tableOrderUrl(n) { return `${siteBaseUrl()}order.html?table=${n}`; }
  function qrImageUrl(data, size) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
  }
  function tableCardHtml(n) {
    return `
      <div class="table-card">
        <p class="table-card-brand">NAMI • ნამი</p>
        <img src="${qrImageUrl(tableOrderUrl(n), 300)}" alt="QR — Table ${n}">
        <p class="table-card-number">Table ${n} — მაგიდა ${n}</p>
        <p class="table-card-url">${escapeHtml(tableOrderUrl(n))}</p>
      </div>
    `;
  }

  function renderTableLinks() {
    let html = '';
    for (let n = 1; n <= siteTableCount; n++) {
      html += `
        <div class="table-link-card">
          <img src="${qrImageUrl(tableOrderUrl(n), 160)}" alt="QR — Table ${n}" loading="lazy">
          <p>Table ${n} — მაგიდა ${n}</p>
          <button type="button" class="admin-btn-secondary" data-print-table="${n}">Print — ბეჭდვა</button>
        </div>
      `;
    }
    tableLinksListEl.innerHTML = html;
  }

  document.getElementById('manageTablesBtn').addEventListener('click', () => {
    tableCountInput.value = siteTableCount;
    document.getElementById('tableCountError').textContent = '';
    renderTableLinks();
    tablesOverlay.hidden = false;
  });
  document.getElementById('closeTablesBtn').addEventListener('click', () => { tablesOverlay.hidden = true; });

  document.getElementById('saveTableCountBtn').addEventListener('click', async () => {
    const errorEl = document.getElementById('tableCountError');
    errorEl.textContent = '';
    const n = parseInt(tableCountInput.value, 10);
    if (!n || n < 1 || n > 200) {
      errorEl.textContent = 'Enter a number between 1 and 200. — შეიყვანეთ რიცხვი 1-დან 200-მდე.';
      return;
    }
    const { error } = await supabaseClient.from('site_settings').update({ table_count: n }).eq('id', 1);
    if (error) { errorEl.textContent = error.message; return; }
    siteTableCount = n;
    renderTableLinks();
    showToast('Table count saved. — მაგიდების რაოდენობა შენახულია.');
  });

  document.getElementById('printAllTablesBtn').addEventListener('click', () => {
    let html = '';
    for (let n = 1; n <= siteTableCount; n++) html += tableCardHtml(n);
    printHtml(html);
  });

  tableLinksListEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-print-table]');
    if (!btn) return;
    printHtml(tableCardHtml(parseInt(btn.dataset.printTable, 10)));
  });

  async function loadTableCount() {
    const { data } = await supabaseClient.from('site_settings').select('table_count').eq('id', 1).single();
    if (data && data.table_count) siteTableCount = data.table_count;
  }

  /* ---------------------------------------------------------
     Realtime: new orders show up (and can auto-print) instantly
  --------------------------------------------------------- */
  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.value = 0.15;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
      osc.onended = () => ctx.close();
    } catch (e) { /* audio unavailable */ }
  }

  async function handleIncomingOrder(newOrderRow) {
    if (knownOrderIds.has(newOrderRow.id)) return;
    // order_items are inserted right after the order row by the
    // customer's browser — give them a moment to land before fetching.
    await new Promise(resolve => setTimeout(resolve, 900));
    const { data: itemRows } = await supabaseClient.from('order_items').select('*').eq('order_id', newOrderRow.id);
    const order = { ...newOrderRow, items: itemRows || [] };
    orders.unshift(order);
    knownOrderIds.add(order.id);
    renderOrderList();
    renderOrderStats();
    playBeep();
    if (autoPrintToggle.checked) printOrder(order);
  }

  function subscribeToOrders() {
    if (!supabaseClient || typeof supabaseClient.channel !== 'function') return;
    supabaseClient.channel('admin-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        handleIncomingOrder(payload.new);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        const o = orders.find(x => x.id === payload.new.id);
        if (o) { Object.assign(o, payload.new); renderOrderList(); renderOrderStats(); }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders' }, (payload) => {
        orders = orders.filter(o => o.id !== payload.old.id);
        knownOrderIds.delete(payload.old.id);
        renderOrderList();
        renderOrderStats();
      })
      .subscribe();
  }

  /* ---------------------------------------------------------
     Main tabs: Blog Posts / Menu / Site Settings
  --------------------------------------------------------- */
  const mainTabPanes = {
    blog: document.getElementById('tabBlog'),
    menu: document.getElementById('tabMenu'),
    inventory: document.getElementById('tabInventory'),
    orders: document.getElementById('tabOrders'),
    messages: document.getElementById('tabMessages'),
    settings: document.getElementById('tabSettings'),
  };
  document.querySelectorAll('.admin-main-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-main-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
      Object.entries(mainTabPanes).forEach(([key, pane]) => { pane.hidden = key !== btn.dataset.tab; });
    });
  });

  /* ---------------------------------------------------------
     Messages: contact form submissions
  --------------------------------------------------------- */
  const messageListEl = document.getElementById('messageList');
  const unreadBadgeEl = document.getElementById('unreadMessageBadge');
  let messages = [];

  function formatMessageDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function updateUnreadBadge() {
    const unread = messages.filter(m => !m.is_read).length;
    unreadBadgeEl.hidden = unread === 0;
    unreadBadgeEl.textContent = String(unread);
  }

  async function loadMessages() {
    messageListEl.innerHTML = '<p class="admin-loading">Loading messages… — იტვირთება...</p>';
    const { data, error } = await supabaseClient
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      messageListEl.innerHTML = `<p class="admin-empty">Couldn't load messages: ${escapeHtml(error.message)} — ვერ ჩაიტვირთა</p>`;
      return;
    }

    messages = data || [];
    renderMessageList();
    updateUnreadBadge();
  }

  function renderMessageList() {
    if (!messages.length) {
      messageListEl.innerHTML = '<p class="admin-empty">No messages yet. — შეტყობინებები ჯერ არ არის.</p>';
      return;
    }

    messageListEl.innerHTML = messages.map(m => `
      <div class="post-row message-row ${m.is_read ? '' : 'is-unread'}">
        <div class="post-row-icon">${m.is_read ? '📩' : '✉️'}</div>
        <div class="post-row-main">
          <p class="post-row-title">${escapeHtml(m.name)}</p>
          <p class="message-row-contact">
            <a href="tel:${escapeHtml(m.phone)}">${escapeHtml(m.phone)}</a>
            ${m.email ? ` · <a href="mailto:${escapeHtml(m.email)}">${escapeHtml(m.email)}</a>` : ''} ·
            ${formatMessageDate(m.created_at)}
          </p>
          <p class="message-row-text">${escapeHtml(m.message)}</p>
        </div>
        <div class="post-row-actions">
          ${m.is_read ? '' : `<button class="admin-btn-secondary" data-mark-read="${m.id}">Mark read — წაკითხულია</button>`}
          <button class="admin-btn-danger" data-delete-message="${m.id}">Delete — წაშლა</button>
        </div>
      </div>
    `).join('');
  }

  messageListEl.addEventListener('click', async (e) => {
    const readBtn = e.target.closest('[data-mark-read]');
    if (readBtn) {
      const id = readBtn.dataset.markRead;
      const { error } = await supabaseClient.from('contact_messages').update({ is_read: true }).eq('id', id);
      if (error) { showToast(`Couldn't update: ${error.message} — ვერ განახლდა`, true); return; }
      const m = messages.find(msg => msg.id === id);
      if (m) m.is_read = true;
      renderMessageList();
      updateUnreadBadge();
      return;
    }
    const delBtn = e.target.closest('[data-delete-message]');
    if (delBtn) {
      if (!window.confirm('Delete this message? This cannot be undone. — წავშალო შეტყობინება? დაბრუნება შეუძლებელია.')) return;
      const id = delBtn.dataset.deleteMessage;
      const { error } = await supabaseClient.from('contact_messages').delete().eq('id', id);
      if (error) { showToast(`Couldn't delete: ${error.message} — ვერ წაიშალა`, true); return; }
      messages = messages.filter(msg => msg.id !== id);
      renderMessageList();
      updateUnreadBadge();
    }
  });

  /* ---------------------------------------------------------
     Menu: load + render dish list
  --------------------------------------------------------- */
  const CATEGORY_LABELS = {
    rolls: 'როლები', nigiri: 'ნიგირი', maki: 'მაკი', futomaki: 'ფუტომაკი',
    tempuraRoll: 'ცხელი როლები', sets: 'სეტები', noodles: 'ნუდლი',
    appetizers: 'აპეტაიზერები', desserts: 'დესერტები', drinks: 'სასმელები',
  };

  const dishListEl = document.getElementById('dishList');
  const dishOverlay = document.getElementById('dishEditorOverlay');
  const categoryFilter = document.getElementById('menuCategoryFilter');
  let dishes = [];
  let editingDishId = null;
  let currentDishPhotoUrl = null;
  let currentDishRecipeRows = []; // [{ inventory_item_id, quantity }] for the dish open in the editor
  let dishRecipeCosts = {}; // menu_item_id -> total food cost, from recipe_items x inventory cost

  async function loadDishes() {
    dishListEl.innerHTML = '<p class="admin-loading">Loading menu… — იტვირთება...</p>';
    const { data, error } = await supabaseClient
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })
      .order('sort_order', { ascending: false });

    if (error) {
      dishListEl.innerHTML = `<p class="admin-empty">Couldn't load menu: ${escapeHtml(error.message)} — ვერ ჩაიტვირთა მენიუ</p>`;
      return;
    }

    dishes = data || [];
    renderDishList();
  }

  async function loadDishRecipeCosts() {
    const { data, error } = await supabaseClient
      .from('recipe_items')
      .select('menu_item_id, inventory_item_id, quantity');

    if (error) {
      dishRecipeCosts = {};
      return;
    }

    const costByInvId = {};
    inventoryItems.forEach(i => { costByInvId[i.id] = effectiveCostPerUnit(i); });

    const totals = {};
    (data || []).forEach(r => {
      const lineCost = (costByInvId[r.inventory_item_id] || 0) * Number(r.quantity);
      totals[r.menu_item_id] = (totals[r.menu_item_id] || 0) + lineCost;
    });
    dishRecipeCosts = totals;
  }

  function renderDishList() {
    const filter = categoryFilter.value;
    const filtered = filter ? dishes.filter(d => d.category === filter) : dishes;

    if (!filtered.length) {
      dishListEl.innerHTML = '<p class="admin-empty">No dishes yet — click "New Dish" to add one. — კერძები ჯერ არ არის, დააჭირეთ „New Dish"-ს.</p>';
      return;
    }

    dishListEl.innerHTML = filtered.map(d => `
      <div class="post-row">
        ${d.photo_url
          ? `<img class="post-row-thumb" src="${escapeHtml(d.photo_url)}" alt="">`
          : `<div class="post-row-icon">🍽️</div>`}
        <div class="post-row-main">
          <p class="post-row-title">${escapeHtml(d.name_en)}</p>
          <p class="post-row-meta">${escapeHtml(d.price)}</p>
          ${dishCostLine(d)}
        </div>
        <span class="post-row-category">${escapeHtml(CATEGORY_LABELS[d.category] || d.category)}</span>
        <span class="post-row-badge ${d.published ? 'is-published' : ''}">${d.published ? 'გამოქვეყნებული' : 'მონახაზი'}</span>
        <div class="post-row-actions">
          <button class="admin-btn-secondary" data-edit-dish="${d.id}">Edit — რედაქტირება</button>
          <button class="admin-btn-danger" data-delete-dish="${d.id}">Delete — წაშლა</button>
        </div>
      </div>
    `).join('');
  }

  function dishCostLine(dish) {
    const cost = dishRecipeCosts[dish.id];
    if (cost === undefined) return '';
    const priceAmt = Number(dish.price_amount) || 0;
    let line = `თვითღირებულება: ${cost.toFixed(2)} ₾`;
    if (priceAmt > 0) {
      const margin = priceAmt - cost;
      const marginPct = margin / priceAmt * 100;
      const cls = margin >= 0 ? 'margin-positive' : 'margin-negative';
      line += ` · მარჟა: <span class="${cls}">${margin.toFixed(2)} ₾ (${marginPct.toFixed(0)}%)</span>`;
    }
    return `<p class="post-row-cost">${line}</p>`;
  }

  categoryFilter.addEventListener('change', renderDishList);

  dishListEl.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit-dish]');
    if (editBtn) {
      openDishEditor(dishes.find(d => d.id === editBtn.dataset.editDish));
      return;
    }
    const delBtn = e.target.closest('[data-delete-dish]');
    if (delBtn) deleteDish(delBtn.dataset.deleteDish);
  });

  function switchDishLangTab(lang) {
    dishOverlay.querySelectorAll('.lang-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    dishOverlay.querySelectorAll('.lang-pane').forEach(pane => {
      pane.hidden = pane.dataset.langPane !== lang;
    });
  }
  dishOverlay.querySelectorAll('.lang-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchDishLangTab(btn.dataset.lang));
  });

  async function openDishEditor(dish) {
    editingDishId = dish ? dish.id : null;
    currentDishPhotoUrl = dish ? (dish.photo_url || null) : null;
    document.getElementById('dishEditorHeading').textContent = dish ? 'Edit Dish — კერძის რედაქტირება' : 'New Dish — ახალი კერძი';
    document.getElementById('deleteDishBtn').hidden = !dish;
    document.getElementById('dishEditorError').textContent = '';

    document.getElementById('dCategory').value = dish ? dish.category : (categoryFilter.value || 'rolls');
    document.getElementById('dPrice').value = dish ? dish.price : '';
    document.getElementById('dPriceAmount').value = dish && dish.price_amount ? dish.price_amount : '';
    document.getElementById('dSortOrder').value = dish ? dish.sort_order : 0;
    document.getElementById('dPublished').checked = dish ? dish.published : true;

    const tags = dish ? (dish.tags || []) : [];
    document.getElementById('dTagSpicy').checked = tags.includes('spicy');
    document.getElementById('dTagVeg').checked = tags.includes('veg');
    document.getElementById('dTagNew').checked = tags.includes('new');

    LANGS.forEach(lang => {
      document.getElementById(`dName_${lang}`).value = dish ? dish[`name_${lang}`] : '';
      document.getElementById(`dDesc_${lang}`).value = dish ? dish[`desc_${lang}`] : '';
    });

    currentDishRecipeRows = [];
    renderRecipeRows();

    updateDishPhotoPreview();
    switchDishLangTab('en');
    dishOverlay.hidden = false;

    if (dish) {
      const { data: recipeRows } = await supabaseClient
        .from('recipe_items')
        .select('inventory_item_id, quantity')
        .eq('menu_item_id', dish.id);
      currentDishRecipeRows = (recipeRows || []).map(r => ({ inventory_item_id: r.inventory_item_id, quantity: Number(r.quantity) }));
      renderRecipeRows();
    }
  }

  /* --- Recipe (dish ingredients) editor --- */
  function renderRecipeRows() {
    const container = document.getElementById('dRecipeRows');
    if (!currentDishRecipeRows.length) {
      container.innerHTML = '<p class="content-help">No ingredients yet — click "Add Ingredient". — ინგრედიენტები ჯერ არ არის, დააჭირეთ „Add Ingredient"-ს.</p>';
    } else {
      container.innerHTML = currentDishRecipeRows.map((row, idx) => {
        const options = inventoryItems.map(i =>
          `<option value="${i.id}" ${i.id === row.inventory_item_id ? 'selected' : ''}>${escapeHtml(i.name)}</option>`
        ).join('');
        const selected = inventoryItems.find(i => i.id === row.inventory_item_id);
        return `
          <div class="recipe-row" data-row-index="${idx}">
            <select data-recipe-item>${options}</select>
            <input type="number" step="any" min="0" value="${row.quantity || ''}" data-recipe-qty placeholder="0">
            <span class="recipe-row-unit">${escapeHtml(selected ? selected.unit : '')}</span>
            <button type="button" class="recipe-row-remove" data-recipe-remove title="Remove ingredient">✕</button>
          </div>
        `;
      }).join('');
    }
    updateRecipeCostSummary();
  }

  function updateRecipeCostSummary() {
    const costByInvId = {};
    inventoryItems.forEach(i => { costByInvId[i.id] = effectiveCostPerUnit(i); });
    const foodCost = currentDishRecipeRows.reduce(
      (sum, r) => sum + (costByInvId[r.inventory_item_id] || 0) * (Number(r.quantity) || 0), 0
    );
    const priceAmt = Number(document.getElementById('dPriceAmount').value) || 0;
    const summaryEl = document.getElementById('dRecipeCostSummary');

    if (!currentDishRecipeRows.length && !priceAmt) {
      summaryEl.textContent = '';
      return;
    }

    let html = `თვითღირებულება: ${foodCost.toFixed(2)} ₾`;
    if (priceAmt > 0) {
      const margin = priceAmt - foodCost;
      const marginPct = margin / priceAmt * 100;
      const cls = margin >= 0 ? 'margin-positive' : 'margin-negative';
      html += ` · ფასი: ${priceAmt.toFixed(2)} ₾ · მარჟა: <span class="${cls}">${margin.toFixed(2)} ₾ (${marginPct.toFixed(0)}%)</span>`;
    } else {
      html += ' · მარჟის სანახავად შეიყვანეთ რიცხვითი ფასი ზემოთ.';
    }
    summaryEl.innerHTML = html;
  }

  document.getElementById('dAddIngredientBtn').addEventListener('click', () => {
    if (!inventoryItems.length) {
      showToast('Add inventory items first, on the Inventory tab. — ჯერ დაამატეთ მარაგის ნივთები Inventory ტაბში.', true);
      return;
    }
    currentDishRecipeRows.push({ inventory_item_id: inventoryItems[0].id, quantity: 0 });
    renderRecipeRows();
  });

  document.getElementById('dRecipeRows').addEventListener('change', (e) => {
    const row = e.target.closest('[data-row-index]');
    if (!row) return;
    const idx = Number(row.dataset.rowIndex);
    if (e.target.matches('[data-recipe-item]')) {
      currentDishRecipeRows[idx].inventory_item_id = e.target.value;
      renderRecipeRows();
    } else if (e.target.matches('[data-recipe-qty]')) {
      currentDishRecipeRows[idx].quantity = Number(e.target.value) || 0;
      updateRecipeCostSummary();
    }
  });

  document.getElementById('dRecipeRows').addEventListener('click', (e) => {
    const removeBtn = e.target.closest('[data-recipe-remove]');
    if (!removeBtn) return;
    const row = removeBtn.closest('[data-row-index]');
    currentDishRecipeRows.splice(Number(row.dataset.rowIndex), 1);
    renderRecipeRows();
  });

  document.getElementById('dPriceAmount').addEventListener('input', updateRecipeCostSummary);

  function updateDishPhotoPreview() {
    const img = document.getElementById('dPhotoPreview');
    const removeBtn = document.getElementById('dPhotoRemoveBtn');
    if (currentDishPhotoUrl) {
      img.src = currentDishPhotoUrl;
      img.style.display = 'block';
      removeBtn.hidden = false;
    } else {
      img.style.display = 'none';
      img.src = '';
      removeBtn.hidden = true;
    }
  }

  document.getElementById('newDishBtn').addEventListener('click', () => openDishEditor(null));
  document.getElementById('cancelDishEditBtn').addEventListener('click', () => { dishOverlay.hidden = true; });

  document.getElementById('dPhotoUploadBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('dPhotoFile');
    const file = fileInput.files[0];
    if (!file) {
      showToast('Choose a photo first. — ჯერ აირჩიეთ ფოტო.', true);
      return;
    }

    const btn = document.getElementById('dPhotoUploadBtn');
    btn.disabled = true;
    btn.textContent = 'Uploading… — იტვირთება...';

    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabaseClient.storage.from('menu-photos').upload(path, file);

    btn.disabled = false;
    btn.textContent = 'Upload Photo — ატვირთვა';

    if (uploadError) {
      showToast(`Upload failed: ${uploadError.message} — ატვირთვა ვერ მოხერხდა`, true);
      return;
    }

    const { data: pub } = supabaseClient.storage.from('menu-photos').getPublicUrl(path);
    currentDishPhotoUrl = pub.publicUrl;
    fileInput.value = '';
    updateDishPhotoPreview();
  });

  document.getElementById('dPhotoRemoveBtn').addEventListener('click', () => {
    currentDishPhotoUrl = null;
    updateDishPhotoPreview();
  });

  document.getElementById('saveDishBtn').addEventListener('click', async () => {
    const errorEl = document.getElementById('dishEditorError');
    errorEl.textContent = '';

    const nameEn = document.getElementById('dName_en').value.trim();
    if (!nameEn) {
      errorEl.textContent = 'An English name is required. — ინგლისური სახელი სავალდებულოა.';
      switchDishLangTab('en');
      return;
    }
    const price = document.getElementById('dPrice').value.trim();
    if (!price) {
      errorEl.textContent = 'Price is required. — ფასი სავალდებულოა.';
      return;
    }

    const tags = [];
    if (document.getElementById('dTagSpicy').checked) tags.push('spicy');
    if (document.getElementById('dTagVeg').checked) tags.push('veg');
    if (document.getElementById('dTagNew').checked) tags.push('new');

    const payload = {
      category: document.getElementById('dCategory').value,
      price,
      price_amount: Number(document.getElementById('dPriceAmount').value) || 0,
      tags,
      photo_url: currentDishPhotoUrl,
      published: document.getElementById('dPublished').checked,
      sort_order: Number(document.getElementById('dSortOrder').value) || 0,
    };
    LANGS.forEach(lang => {
      payload[`name_${lang}`] = document.getElementById(`dName_${lang}`).value.trim();
      payload[`desc_${lang}`] = document.getElementById(`dDesc_${lang}`).value.trim();
    });

    const saveBtn = document.getElementById('saveDishBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving… — ინახება...';

    let result;
    if (editingDishId) {
      result = await supabaseClient.from('menu_items').update(payload).eq('id', editingDishId).select().single();
    } else {
      result = await supabaseClient.from('menu_items').insert(payload).select().single();
    }

    if (result.error) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Dish — შენახვა';
      errorEl.textContent = result.error.message;
      return;
    }

    const dishId = editingDishId || result.data.id;
    const validRecipeRows = currentDishRecipeRows.filter(r => r.inventory_item_id && Number(r.quantity) > 0);

    await supabaseClient.from('recipe_items').delete().eq('menu_item_id', dishId);
    if (validRecipeRows.length) {
      const { error: recipeError } = await supabaseClient.from('recipe_items').insert(
        validRecipeRows.map(r => ({ menu_item_id: dishId, inventory_item_id: r.inventory_item_id, quantity: Number(r.quantity) }))
      );
      if (recipeError) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Dish — შენახვა';
        errorEl.textContent = `Dish saved, but the recipe couldn't be saved: ${recipeError.message} — კერძი შენახულია, მაგრამ რეცეპტი ვერ შეინახა`;
        return;
      }
    }

    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Dish — შენახვა';

    dishOverlay.hidden = true;
    showToast(editingDishId ? 'Dish updated. — კერძი განახლდა.' : 'Dish added. — კერძი დაემატა.');
    await loadDishRecipeCosts();
    await loadDishes();
  });

  document.getElementById('deleteDishBtn').addEventListener('click', async () => {
    if (!editingDishId) return;
    if (!window.confirm('Delete this dish? This cannot be undone. — წავშალო კერძი? დაბრუნება შეუძლებელია.')) return;
    await deleteDish(editingDishId);
    dishOverlay.hidden = true;
  });

  async function deleteDish(id) {
    const { error } = await supabaseClient.from('menu_items').delete().eq('id', id);
    if (error) {
      showToast(`Couldn't delete: ${error.message} — ვერ წაიშალა`, true);
      return;
    }
    showToast('Dish deleted. — კერძი წაიშალა.');
    await loadDishes();
  }

  /* ---------------------------------------------------------
     Inventory: load + render items, item editor, stock movements
  --------------------------------------------------------- */
  const INV_CATEGORY_LABELS = {
    seafood: 'თევზი/ზღვის პროდ.', produce: 'ბოსტნეული/ხილი', rice_noodles: 'ბრინჯი/ნუდლი',
    sauces_condiments: 'სოუსები', dairy: 'რძის პროდ.', dry_goods: 'საშრობი',
    beverages: 'სასმელები', packaging: 'შეფუთვა', other: 'სხვა',
  };
  const INV_MOVEMENT_LABELS = { restock: 'შემოსავალი', usage: 'მოხმარება', waste: 'დანაკარგი', adjustment: 'კორექტირება' };

  const inventoryListEl = document.getElementById('inventoryList');
  const itemOverlay = document.getElementById('itemEditorOverlay');
  const movementOverlay = document.getElementById('movementOverlay');
  const historyOverlay = document.getElementById('historyOverlay');
  const invCategoryFilter = document.getElementById('invCategoryFilter');
  const invSearch = document.getElementById('invSearch');
  const invLowStockOnly = document.getElementById('invLowStockOnly');

  let inventoryItems = [];
  let editingItemId = null;
  let movementItemId = null;

  function isLowStock(item) {
    return Number(item.quantity) <= Number(item.min_quantity);
  }

  async function loadInventory() {
    inventoryListEl.innerHTML = '<p class="admin-loading">Loading inventory… — იტვირთება...</p>';
    const { data, error } = await supabaseClient
      .from('inventory_items')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      inventoryListEl.innerHTML = `<p class="admin-empty">Couldn't load inventory: ${escapeHtml(error.message)} — ვერ ჩაიტვირთა მარაგი</p>`;
      return;
    }

    inventoryItems = data || [];
    renderInventoryStats();
    renderInventoryList();
  }

  function renderInventoryStats() {
    const lowStockCount = inventoryItems.filter(isLowStock).length;
    const totalValue = inventoryItems.reduce((sum, i) => sum + Number(i.quantity) * Number(i.cost_per_unit), 0);
    document.getElementById('statTotalItems').textContent = String(inventoryItems.length);
    document.getElementById('statLowStock').textContent = String(lowStockCount);
    document.getElementById('statTotalValue').textContent = `${totalValue.toFixed(2)} ₾`;
  }

  function renderInventoryList() {
    const category = invCategoryFilter.value;
    const search = invSearch.value.trim().toLowerCase();
    const lowOnly = invLowStockOnly.checked;

    const filtered = inventoryItems.filter(i => {
      if (category && i.category !== category) return false;
      if (search && !i.name.toLowerCase().includes(search)) return false;
      if (lowOnly && !isLowStock(i)) return false;
      return true;
    });

    if (!filtered.length) {
      inventoryListEl.innerHTML = '<p class="admin-empty">No items match — click "New Item" to add stock to track. — შესატყვისი ნივთი არ არის, დააჭირეთ „New Item"-ს.</p>';
      return;
    }

    inventoryListEl.innerHTML = filtered.map(i => `
      <div class="post-row">
        <div class="post-row-icon">📦</div>
        <div class="post-row-main">
          <p class="post-row-title">${escapeHtml(i.name)}</p>
          <p class="post-row-qty">${formatQty(i.quantity)} ${escapeHtml(i.unit)} მარაგშია · მინ. ${formatQty(i.min_quantity)} ${escapeHtml(i.unit)}${i.supplier ? ` · ${escapeHtml(i.supplier)}` : ''}${Number(i.yield_pct) < 100 ? ` · გამოსავლიანობა ${formatQty(i.yield_pct)}% (ეფექტური ${effectiveCostPerUnit(i).toFixed(2)} ₾/${escapeHtml(i.unit)})` : ''}</p>
        </div>
        <span class="post-row-category">${escapeHtml(INV_CATEGORY_LABELS[i.category] || i.category)}</span>
        <span class="post-row-badge ${isLowStock(i) ? 'is-low-stock' : 'is-published'}">${isLowStock(i) ? 'დაბალი მარაგი' : 'წესრიგშია'}</span>
        <div class="post-row-actions">
          <button class="admin-btn-secondary" data-move="${i.id}">Move — მოძრაობა</button>
          <button class="admin-btn-secondary" data-history="${i.id}">History — ისტორია</button>
          <button class="admin-btn-secondary" data-edit-item="${i.id}">Edit — რედაქტირება</button>
          <button class="admin-btn-danger" data-delete-item="${i.id}">Delete — წაშლა</button>
        </div>
      </div>
    `).join('');
  }

  function formatQty(n) {
    const num = Number(n);
    return Number.isInteger(num) ? String(num) : num.toFixed(2);
  }

  invCategoryFilter.addEventListener('change', renderInventoryList);
  invSearch.addEventListener('input', renderInventoryList);
  invLowStockOnly.addEventListener('change', renderInventoryList);

  inventoryListEl.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit-item]');
    if (editBtn) {
      openItemEditor(inventoryItems.find(i => i.id === editBtn.dataset.editItem));
      return;
    }
    const delBtn = e.target.closest('[data-delete-item]');
    if (delBtn) { deleteItem(delBtn.dataset.deleteItem); return; }
    const moveBtn = e.target.closest('[data-move]');
    if (moveBtn) { openMovement(moveBtn.dataset.move); return; }
    const histBtn = e.target.closest('[data-history]');
    if (histBtn) { openHistory(histBtn.dataset.history); }
  });

  /* --- Item editor --- */
  function openItemEditor(item) {
    editingItemId = item ? item.id : null;
    document.getElementById('itemEditorHeading').textContent = item ? 'Edit Item — ნივთის რედაქტირება' : 'New Item — ახალი ნივთი';
    document.getElementById('deleteItemBtn').hidden = !item;
    document.getElementById('itemEditorError').textContent = '';

    document.getElementById('iName').value = item ? item.name : '';
    document.getElementById('iCategory').value = item ? item.category : 'other';
    document.getElementById('iUnit').value = item ? item.unit : 'pcs';
    document.getElementById('iQuantity').value = item ? item.quantity : 0;
    document.getElementById('iQuantity').disabled = !!item;
    document.getElementById('iQuantityHelp').hidden = !item;
    document.getElementById('iMinQuantity').value = item ? item.min_quantity : 0;
    document.getElementById('iCostPerUnit').value = item ? item.cost_per_unit : 0;
    document.getElementById('iYieldPct').value = item && item.yield_pct ? item.yield_pct : 100;
    document.getElementById('iSupplier').value = item ? item.supplier : '';
    document.getElementById('iNotes').value = item ? item.notes : '';

    itemOverlay.hidden = false;
  }

  document.getElementById('newItemBtn').addEventListener('click', () => openItemEditor(null));
  document.getElementById('cancelItemEditBtn').addEventListener('click', () => { itemOverlay.hidden = true; });

  document.getElementById('saveItemBtn').addEventListener('click', async () => {
    const errorEl = document.getElementById('itemEditorError');
    errorEl.textContent = '';

    const name = document.getElementById('iName').value.trim();
    if (!name) {
      errorEl.textContent = 'Name is required. — სახელი სავალდებულოა.';
      return;
    }
    const yieldPct = Number(document.getElementById('iYieldPct').value) || 100;
    if (yieldPct <= 0 || yieldPct > 100) {
      errorEl.textContent = 'Yield % must be between 1 and 100. — გამოსავლიანობა უნდა იყოს 1-დან 100-მდე.';
      return;
    }

    const payload = {
      name,
      category: document.getElementById('iCategory').value,
      unit: document.getElementById('iUnit').value,
      min_quantity: Number(document.getElementById('iMinQuantity').value) || 0,
      cost_per_unit: Number(document.getElementById('iCostPerUnit').value) || 0,
      yield_pct: yieldPct,
      supplier: document.getElementById('iSupplier').value.trim(),
      notes: document.getElementById('iNotes').value.trim(),
    };
    if (!editingItemId) {
      payload.quantity = Number(document.getElementById('iQuantity').value) || 0;
    }

    const saveBtn = document.getElementById('saveItemBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving… — ინახება...';

    let result;
    if (editingItemId) {
      result = await supabaseClient.from('inventory_items').update(payload).eq('id', editingItemId);
    } else {
      result = await supabaseClient.from('inventory_items').insert(payload);
    }

    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Item — შენახვა';

    if (result.error) {
      errorEl.textContent = result.error.message;
      return;
    }

    itemOverlay.hidden = true;
    showToast(editingItemId ? 'Item updated. — ნივთი განახლდა.' : 'Item added. — ნივთი დაემატა.');
    await loadInventory();
  });

  document.getElementById('deleteItemBtn').addEventListener('click', async () => {
    if (!editingItemId) return;
    if (!window.confirm('Delete this item and its movement history? This cannot be undone. — წავშალო ნივთი და მისი ისტორია? დაბრუნება შეუძლებელია.')) return;
    await deleteItem(editingItemId);
    itemOverlay.hidden = true;
  });

  async function deleteItem(id) {
    const { error } = await supabaseClient.from('inventory_items').delete().eq('id', id);
    if (error) {
      showToast(`Couldn't delete: ${error.message} — ვერ წაიშალა`, true);
      return;
    }
    showToast('Item deleted. — ნივთი წაიშალა.');
    await loadInventory();
  }

  /* --- Stock movement --- */
  function openMovement(itemId) {
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item) return;
    movementItemId = itemId;
    document.getElementById('movementItemLabel').textContent =
      `${item.name} — ${formatQty(item.quantity)} ${item.unit} currently on hand. — ამჟამად მარაგშია.`;
    document.getElementById('mType').value = 'restock';
    document.getElementById('mQuantity').value = '';
    document.getElementById('mNote').value = '';
    document.getElementById('movementError').textContent = '';
    updateMovementLabel();
    movementOverlay.hidden = false;
  }

  function updateMovementLabel() {
    const type = document.getElementById('mType').value;
    document.getElementById('mQuantityLabel').textContent =
      type === 'adjustment' ? 'Amount (use a negative number to subtract) — რაოდენობა (გამოსაკლებად გამოიყენეთ მინუსი)' : 'Amount — რაოდენობა';
  }
  document.getElementById('mType').addEventListener('change', updateMovementLabel);

  document.getElementById('cancelMovementBtn').addEventListener('click', () => { movementOverlay.hidden = true; });

  document.getElementById('saveMovementBtn').addEventListener('click', async () => {
    const errorEl = document.getElementById('movementError');
    errorEl.textContent = '';

    const item = inventoryItems.find(i => i.id === movementItemId);
    if (!item) return;

    const type = document.getElementById('mType').value;
    const rawAmount = Number(document.getElementById('mQuantity').value);
    if (!rawAmount) {
      errorEl.textContent = 'Enter a non-zero amount. — შეიყვანეთ ნულისგან განსხვავებული რაოდენობა.';
      return;
    }

    const delta = type === 'adjustment' ? rawAmount
      : (type === 'restock' ? Math.abs(rawAmount) : -Math.abs(rawAmount));

    const newQuantity = Number(item.quantity) + delta;
    if (newQuantity < 0) {
      errorEl.textContent = `That would leave stock at ${formatQty(newQuantity)} ${item.unit}. Check the amount. — ამის შემდეგ მარაგი უარყოფითი გახდება, გადაამოწმეთ რაოდენობა.`;
      return;
    }

    const note = document.getElementById('mNote').value.trim();
    const saveBtn = document.getElementById('saveMovementBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving… — ინახება...';

    const { error: updateError } = await supabaseClient
      .from('inventory_items')
      .update({ quantity: newQuantity })
      .eq('id', item.id);

    if (!updateError) {
      const { error: txError } = await supabaseClient.from('inventory_transactions').insert({
        item_id: item.id,
        type,
        delta,
        note,
        created_by: (currentUser && currentUser.email) || '',
      });
      if (txError) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save — შენახვა';
        errorEl.textContent = txError.message;
        return;
      }
    }

    saveBtn.disabled = false;
    saveBtn.textContent = 'Save — შენახვა';

    if (updateError) {
      errorEl.textContent = updateError.message;
      return;
    }

    movementOverlay.hidden = true;
    showToast('Stock updated. — მარაგი განახლდა.');
    await loadInventory();
  });

  /* --- Movement history --- */
  async function openHistory(itemId) {
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item) return;
    document.getElementById('historyHeading').textContent = `History — ისტორია: ${item.name}`;
    const listEl = document.getElementById('historyList');
    listEl.innerHTML = '<p class="admin-loading">Loading… — იტვირთება...</p>';
    historyOverlay.hidden = false;

    const { data, error } = await supabaseClient
      .from('inventory_transactions')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      listEl.innerHTML = `<p class="admin-empty">Couldn't load history: ${escapeHtml(error.message)} — ვერ ჩაიტვირთა ისტორია</p>`;
      return;
    }
    if (!data || !data.length) {
      listEl.innerHTML = '<p class="admin-empty">No movements recorded yet. — ჯერ არცერთი მოძრაობა არ არის ჩაწერილი.</p>';
      return;
    }

    listEl.innerHTML = data.map(t => `
      <div class="post-row">
        <div class="post-row-main">
          <p class="post-row-title">${INV_MOVEMENT_LABELS[t.type] || t.type} · ${t.delta > 0 ? '+' : ''}${formatQty(t.delta)} ${escapeHtml(item.unit)}</p>
          <p class="post-row-meta">${new Date(t.created_at).toLocaleString()}${t.created_by ? ` · ${escapeHtml(t.created_by)}` : ''}${t.note ? ` · ${escapeHtml(t.note)}` : ''}</p>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('closeHistoryBtn').addEventListener('click', () => { historyOverlay.hidden = true; });

  /* ---------------------------------------------------------
     Site Settings: homepage text + contact/hours
  --------------------------------------------------------- */
  const settingsForm = document.getElementById('settingsForm');
  const SETTINGS_CONTENT_KEYS = [
    'hero_eyebrow', 'hero_title', 'hero_sub', 'about_p1',
    'stat_dishes', 'stat_fresh', 'info_address_value', 'info_hours_value',
  ];
  const SETTINGS_FIELD_MAP = {
    hero_eyebrow: 'sHeroEyebrow', hero_title: 'sHeroTitle', hero_sub: 'sHeroSub',
    about_p1: 'sAboutP1', stat_dishes: 'sStatDishes', stat_fresh: 'sStatFresh',
    info_address_value: 'sAddress', info_hours_value: 'sHoursValue',
  };

  function switchSettingsLangTab(lang) {
    settingsForm.querySelectorAll('.settings-lang-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    settingsForm.querySelectorAll('.settings-lang-pane').forEach(pane => {
      pane.hidden = pane.dataset.langPane !== lang;
    });
  }
  settingsForm.querySelectorAll('.settings-lang-tab').forEach(btn => {
    btn.addEventListener('click', () => switchSettingsLangTab(btn.dataset.lang));
  });

  async function loadSettings() {
    const [{ data: settingsRow, error: settingsErr }, { data: contentRows, error: contentErr }] = await Promise.all([
      supabaseClient.from('site_settings').select('*').eq('id', 1).single(),
      supabaseClient.from('site_content').select('*'),
    ]);

    if (settingsErr || contentErr) {
      document.getElementById('settingsLoading').textContent =
        `Couldn't load settings: ${(settingsErr || contentErr).message} — ვერ ჩაიტვირთა პარამეტრები`;
      return;
    }

    if (settingsRow) {
      document.getElementById('sPhone').value = settingsRow.phone || '';
      document.getElementById('sEmail').value = settingsRow.email || '';
      document.getElementById('sOpen').value = settingsRow.weekday_open || '';
      document.getElementById('sClose').value = settingsRow.weekday_close || '';
    }

    const byKey = {};
    (contentRows || []).forEach(row => { byKey[row.key] = row; });

    SETTINGS_CONTENT_KEYS.forEach(key => {
      const field = SETTINGS_FIELD_MAP[key];
      const row = byKey[key];
      LANGS.forEach(lang => {
        const el = document.getElementById(`${field}_${lang}`);
        if (el) el.value = row ? (row[`value_${lang}`] || '') : '';
      });
    });

    document.getElementById('settingsLoading').hidden = true;
    settingsForm.hidden = false;
  }

  document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
    const errorEl = document.getElementById('settingsError');
    errorEl.textContent = '';
    const btn = document.getElementById('saveSettingsBtn');
    btn.disabled = true;
    btn.textContent = 'Saving… — ინახება...';

    const settingsPayload = {
      id: 1,
      phone: document.getElementById('sPhone').value.trim(),
      email: document.getElementById('sEmail').value.trim(),
      weekday_open: document.getElementById('sOpen').value.trim(),
      weekday_close: document.getElementById('sClose').value.trim(),
    };

    const contentPayload = SETTINGS_CONTENT_KEYS.map(key => {
      const field = SETTINGS_FIELD_MAP[key];
      const row = { key };
      LANGS.forEach(lang => { row[`value_${lang}`] = document.getElementById(`${field}_${lang}`).value; });
      return row;
    });

    const [settingsResult, contentResult] = await Promise.all([
      supabaseClient.from('site_settings').update(settingsPayload).eq('id', 1),
      supabaseClient.from('site_content').upsert(contentPayload, { onConflict: 'key' }),
    ]);

    btn.disabled = false;
    btn.textContent = 'Save Settings — შენახვა';

    if (settingsResult.error || contentResult.error) {
      errorEl.textContent = (settingsResult.error || contentResult.error).message;
      return;
    }

    showToast('Settings saved. — პარამეტრები შენახულია.');
  });

  /* ---------------------------------------------------------
     Init
  --------------------------------------------------------- */
  (async () => {
    const ok = await requireAuth();
    if (!ok) return;
    await loadPosts();
    await loadInventory();
    await loadDishRecipeCosts();
    await loadDishes();
    await loadMessages();
    await loadSettings();
    await loadTableCount();
    await loadOrders();
    subscribeToOrders();
  })();
})();
