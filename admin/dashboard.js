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
      document.getElementById('postList').innerHTML =
        '<p class="admin-empty">Couldn\'t reach the login service. Check your connection and reload.</p>';
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
    document.querySelectorAll('.lang-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    document.querySelectorAll('.lang-pane').forEach(pane => {
      pane.hidden = pane.dataset.langPane !== lang;
    });
  }
  document.querySelectorAll('.lang-tab-btn').forEach(btn => {
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
     Init
  --------------------------------------------------------- */
  (async () => {
    const ok = await requireAuth();
    if (ok) await loadPosts();
  })();
})();
