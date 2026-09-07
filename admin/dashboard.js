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
      const msg = '<p class="admin-empty">Couldn\'t reach the login service. Check your connection and reload.</p>';
      document.getElementById('postList').innerHTML = msg;
      document.getElementById('dishList').innerHTML = msg;
      document.getElementById('settingsLoading').textContent = "Couldn't reach the login service. Check your connection and reload.";
      return false;
    }
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
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
    postListEl.innerHTML = '<p class="admin-loading">Loading posts…</p>';
    const { data, error } = await supabaseClient
      .from('blog_posts')
      .select('*')
      .order('sort_order', { ascending: false })
      .order('post_date', { ascending: false });

    if (error) {
      postListEl.innerHTML = `<p class="admin-empty">Couldn't load posts: ${escapeHtml(error.message)}</p>`;
      return;
    }

    posts = data || [];
    renderPostList();
  }

  function renderPostList() {
    if (!posts.length) {
      postListEl.innerHTML = '<p class="admin-empty">No posts yet — click "New Post" to add your first one.</p>';
      return;
    }

    postListEl.innerHTML = posts.map(p => `
      <div class="post-row">
        <div class="post-row-icon">${p.icon || '📝'}</div>
        <div class="post-row-main">
          <p class="post-row-title">${escapeHtml(p.title_en)}</p>
          <p class="post-row-meta">${escapeHtml(p.post_date)} · ${escapeHtml(p.tag_en)}</p>
        </div>
        <span class="post-row-badge ${p.published ? 'is-published' : ''}">${p.published ? 'Published' : 'Draft'}</span>
        <div class="post-row-actions">
          <button class="admin-btn-secondary" data-edit="${p.id}">Edit</button>
          <button class="admin-btn-danger" data-delete="${p.id}">Delete</button>
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
     Content <-> textarea conversion
     Array shape matches BLOG_POSTS[].content[lang] on the public
     site: each entry is either a plain paragraph (may contain
     <strong>) or a raw <figure class="post-figure">...</figure>
     block, exactly what renderBlogModal() already expects.
  --------------------------------------------------------- */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function serializeContent(text) {
    const blocks = (text || '').split(/\n\s*\n+/).map(b => b.trim()).filter(Boolean);
    return blocks.map(block => {
      const photoMatch = block.match(/^\[\[photo:\s*(.+?)\s*\|\s*([\s\S]*?)\s*\]\]$/);
      if (photoMatch) {
        const src = photoMatch[1].trim();
        const caption = photoMatch[2].trim();
        return `<figure class="post-figure"><img src="${escapeHtml(src)}" alt="${escapeHtml(caption)}" loading="lazy"><figcaption>${escapeHtml(caption)}</figcaption></figure>`;
      }
      return block.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    });
  }

  function deserializeContent(arr) {
    return (arr || []).map(entry => {
      const figMatch = entry.match(/<img[^>]*src="([^"]*)"[\s\S]*?<figcaption>([\s\S]*?)<\/figcaption>/);
      if (figMatch) {
        return `[[photo: ${figMatch[1]} | ${figMatch[2]}]]`;
      }
      return entry.replace(/<strong>([\s\S]*?)<\/strong>/g, '**$1**');
    }).join('\n\n');
  }

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
    document.getElementById('editorHeading').textContent = post ? 'Edit Post' : 'New Post';
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
      document.getElementById(`fContent_${lang}`).value = post ? deserializeContent(post[`content_${lang}`]) : '';
    });

    switchLangTab('en');
    overlay.hidden = false;
  }

  document.getElementById('newPostBtn').addEventListener('click', () => openEditor(null));
  document.getElementById('cancelEditBtn').addEventListener('click', () => { overlay.hidden = true; });

  // Photo upload: uploads to Storage, then inserts a [[photo: url | caption]]
  // marker into that language's content textarea at the cursor position.
  document.querySelectorAll('[data-upload-btn]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const lang = btn.dataset.uploadBtn;
      const fileInput = document.querySelector(`[data-photo-lang="${lang}"]`);
      const file = fileInput.files[0];
      if (!file) {
        showToast('Choose a photo first.', true);
        return;
      }

      const caption = window.prompt('Caption for this photo (shown under it, in this language):', '');
      if (caption === null) return; // cancelled

      btn.disabled = true;
      btn.textContent = 'Uploading…';

      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabaseClient.storage
        .from('blog-photos')
        .upload(path, file);

      if (uploadError) {
        showToast(`Upload failed: ${uploadError.message}`, true);
        btn.disabled = false;
        btn.textContent = lang === 'en' ? 'Upload & Insert Photo' : btn.textContent;
        return;
      }

      const { data: pub } = supabaseClient.storage.from('blog-photos').getPublicUrl(path);
      const marker = `[[photo: ${pub.publicUrl} | ${caption}]]`;

      const textarea = document.getElementById(`fContent_${lang}`);
      const pos = textarea.selectionStart ?? textarea.value.length;
      const before = textarea.value.slice(0, pos);
      const after = textarea.value.slice(pos);
      const sep = before && !before.endsWith('\n\n') ? '\n\n' : '';
      textarea.value = before + sep + marker + '\n\n' + after;

      fileInput.value = '';
      btn.disabled = false;
      btn.textContent = 'Uploaded ✓';
      setTimeout(() => { btn.textContent = 'Upload & Insert Photo'; }, 1500);
    });
  });

  document.getElementById('savePostBtn').addEventListener('click', async () => {
    const errorEl = document.getElementById('editorError');
    errorEl.textContent = '';

    const titleEn = document.getElementById('fTitle_en').value.trim();
    if (!titleEn) {
      errorEl.textContent = 'An English title is required (used to generate the post link).';
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
      payload[`content_${lang}`] = serializeContent(document.getElementById(`fContent_${lang}`).value);
    });

    const saveBtn = document.getElementById('savePostBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    let result;
    if (editingId) {
      result = await supabaseClient.from('blog_posts').update(payload).eq('id', editingId);
    } else {
      payload.slug = slugify(titleEn);
      result = await supabaseClient.from('blog_posts').insert(payload);
    }

    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Post';

    if (result.error) {
      errorEl.textContent = result.error.message;
      return;
    }

    overlay.hidden = true;
    showToast(editingId ? 'Post updated.' : 'Post created.');
    await loadPosts();
  });

  document.getElementById('deletePostBtn').addEventListener('click', async () => {
    if (!editingId) return;
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    await deletePost(editingId);
    overlay.hidden = true;
  });

  async function deletePost(id) {
    const { error } = await supabaseClient.from('blog_posts').delete().eq('id', id);
    if (error) {
      showToast(`Couldn't delete: ${error.message}`, true);
      return;
    }
    showToast('Post deleted.');
    await loadPosts();
  }

  /* ---------------------------------------------------------
     Main tabs: Blog Posts / Menu / Site Settings
  --------------------------------------------------------- */
  const mainTabPanes = {
    blog: document.getElementById('tabBlog'),
    menu: document.getElementById('tabMenu'),
    settings: document.getElementById('tabSettings'),
  };
  document.querySelectorAll('.admin-main-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-main-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
      Object.entries(mainTabPanes).forEach(([key, pane]) => { pane.hidden = key !== btn.dataset.tab; });
    });
  });

  /* ---------------------------------------------------------
     Menu: load + render dish list
  --------------------------------------------------------- */
  const CATEGORY_LABELS = {
    rolls: 'Rolls', nigiri: 'Nigiri', maki: 'Maki', futomaki: 'Futomaki',
    tempuraRoll: 'Hot Rolls', sets: 'Sets', noodles: 'Noodles',
    appetizers: 'Appetizers', desserts: 'Desserts', drinks: 'Drinks',
  };

  const dishListEl = document.getElementById('dishList');
  const dishOverlay = document.getElementById('dishEditorOverlay');
  const categoryFilter = document.getElementById('menuCategoryFilter');
  let dishes = [];
  let editingDishId = null;
  let currentDishPhotoUrl = null;

  async function loadDishes() {
    dishListEl.innerHTML = '<p class="admin-loading">Loading menu…</p>';
    const { data, error } = await supabaseClient
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })
      .order('sort_order', { ascending: false });

    if (error) {
      dishListEl.innerHTML = `<p class="admin-empty">Couldn't load menu: ${escapeHtml(error.message)}</p>`;
      return;
    }

    dishes = data || [];
    renderDishList();
  }

  function renderDishList() {
    const filter = categoryFilter.value;
    const filtered = filter ? dishes.filter(d => d.category === filter) : dishes;

    if (!filtered.length) {
      dishListEl.innerHTML = '<p class="admin-empty">No dishes yet — click "New Dish" to add one.</p>';
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
        </div>
        <span class="post-row-category">${escapeHtml(CATEGORY_LABELS[d.category] || d.category)}</span>
        <span class="post-row-badge ${d.published ? 'is-published' : ''}">${d.published ? 'Published' : 'Draft'}</span>
        <div class="post-row-actions">
          <button class="admin-btn-secondary" data-edit-dish="${d.id}">Edit</button>
          <button class="admin-btn-danger" data-delete-dish="${d.id}">Delete</button>
        </div>
      </div>
    `).join('');
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

  function openDishEditor(dish) {
    editingDishId = dish ? dish.id : null;
    currentDishPhotoUrl = dish ? (dish.photo_url || null) : null;
    document.getElementById('dishEditorHeading').textContent = dish ? 'Edit Dish' : 'New Dish';
    document.getElementById('deleteDishBtn').hidden = !dish;
    document.getElementById('dishEditorError').textContent = '';

    document.getElementById('dCategory').value = dish ? dish.category : (categoryFilter.value || 'rolls');
    document.getElementById('dPrice').value = dish ? dish.price : '';
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

    updateDishPhotoPreview();
    switchDishLangTab('en');
    dishOverlay.hidden = false;
  }

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
      showToast('Choose a photo first.', true);
      return;
    }

    const btn = document.getElementById('dPhotoUploadBtn');
    btn.disabled = true;
    btn.textContent = 'Uploading…';

    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabaseClient.storage.from('menu-photos').upload(path, file);

    btn.disabled = false;
    btn.textContent = 'Upload Photo';

    if (uploadError) {
      showToast(`Upload failed: ${uploadError.message}`, true);
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
      errorEl.textContent = 'An English name is required.';
      switchDishLangTab('en');
      return;
    }
    const price = document.getElementById('dPrice').value.trim();
    if (!price) {
      errorEl.textContent = 'Price is required.';
      return;
    }

    const tags = [];
    if (document.getElementById('dTagSpicy').checked) tags.push('spicy');
    if (document.getElementById('dTagVeg').checked) tags.push('veg');
    if (document.getElementById('dTagNew').checked) tags.push('new');

    const payload = {
      category: document.getElementById('dCategory').value,
      price,
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
    saveBtn.textContent = 'Saving…';

    let result;
    if (editingDishId) {
      result = await supabaseClient.from('menu_items').update(payload).eq('id', editingDishId);
    } else {
      result = await supabaseClient.from('menu_items').insert(payload);
    }

    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Dish';

    if (result.error) {
      errorEl.textContent = result.error.message;
      return;
    }

    dishOverlay.hidden = true;
    showToast(editingDishId ? 'Dish updated.' : 'Dish added.');
    await loadDishes();
  });

  document.getElementById('deleteDishBtn').addEventListener('click', async () => {
    if (!editingDishId) return;
    if (!window.confirm('Delete this dish? This cannot be undone.')) return;
    await deleteDish(editingDishId);
    dishOverlay.hidden = true;
  });

  async function deleteDish(id) {
    const { error } = await supabaseClient.from('menu_items').delete().eq('id', id);
    if (error) {
      showToast(`Couldn't delete: ${error.message}`, true);
      return;
    }
    showToast('Dish deleted.');
    await loadDishes();
  }

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
        `Couldn't load settings: ${(settingsErr || contentErr).message}`;
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
    btn.textContent = 'Saving…';

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
    btn.textContent = 'Save Settings';

    if (settingsResult.error || contentResult.error) {
      errorEl.textContent = (settingsResult.error || contentResult.error).message;
      return;
    }

    showToast('Settings saved.');
  });

  /* ---------------------------------------------------------
     Init
  --------------------------------------------------------- */
  (async () => {
    const ok = await requireAuth();
    if (!ok) return;
    await loadPosts();
    await loadDishes();
    await loadSettings();
  })();
})();
