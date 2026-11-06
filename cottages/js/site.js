/* Pitsruli — public site: language switch, content from Supabase, lead form. */
(function () {
  var P = window.PITSRULI;
  var CFG = window.PITSRULI_CONFIG || {};
  var KEY = 'pitsruli_lang';
  var data = P.DEFAULT;
  var current = 'ka';
  var descMeta = document.querySelector('meta[name="description"]');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function loc(o) { return o ? (o[current] || o.ka || '') : ''; }
  function t(key) { return loc(data.texts[key] || P.DEFAULT.texts[key]); }

  function merge(saved) {
    return {
      contact: Object.assign({}, P.DEFAULT.contact, saved.contact || {}),
      models: Array.isArray(saved.models) && saved.models.length ? saved.models : P.DEFAULT.models,
      texts: Object.assign({}, P.DEFAULT.texts, saved.texts || {})
    };
  }

  function modelName(m) { return t('brand.name') + ' ' + m.code; }

  function renderModels() {
    var grid = document.getElementById('models-grid');
    if (!grid) return;
    grid.innerHTML = data.models.map(function (m) {
      var shape = P.SHAPES[m.shape] || P.SHAPES.gable;
      return '<article class="model">' +
        '<figure><svg viewBox="0 0 200 120" aria-hidden="true">' + shape.svg + '</svg></figure>' +
        '<div class="model-body">' +
          '<span class="tag">' + esc(loc(m.tag)) + '</span>' +
          '<h3>' + esc(modelName(m)) + '</h3>' +
          '<dl class="specs">' +
            '<dt>' + esc(t('spec.area')) + '</dt><dd>' + esc(P.FORMAT.area(m.area, current)) + '</dd>' +
            '<dt>' + esc(t('spec.beds')) + '</dt><dd>' + esc(loc(m.beds)) + '</dd>' +
            '<dt>' + esc(t('spec.build')) + '</dt><dd>' + esc(P.FORMAT.days(m.days, current)) + '</dd>' +
          '</dl>' +
          '<p class="price"><span>' + esc(P.FORMAT.price(m.price, current)) + '</span><small>' + esc(loc(m.desc)) + '</small></p>' +
        '</div></article>';
    }).join('');
  }

  function renderModelSelect() {
    var sel = document.getElementById('f-model');
    if (!sel) return;
    var keep = sel.value;
    var opts = [['unsure', t('opt.unsure')]]
      .concat(data.models.map(function (m) { return [m.code, modelName(m)]; }))
      .concat([['custom', t('opt.custom')]]);
    sel.innerHTML = opts.map(function (o) { return '<option value="' + esc(o[0]) + '">' + esc(o[1]) + '</option>'; }).join('');
    if (opts.some(function (o) { return o[0] === keep; })) sel.value = keep;
  }

  function apply(lang) {
    if (P.LANGS.indexOf(lang) < 0) lang = 'ka';
    current = lang;
    document.documentElement.lang = lang;
    document.title = t('meta.title');
    if (descMeta) descMeta.content = t('meta.desc');
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.setAttribute('placeholder', t(el.dataset.i18nPh)); });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    document.querySelectorAll('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    var phone = document.getElementById('c-phone'), email = document.getElementById('c-email');
    if (phone) phone.textContent = data.contact.phone;
    if (email) email.textContent = data.contact.email;
    renderModels();
    renderModelSelect();
    var msg = document.getElementById('form-msg');
    if (msg) msg.textContent = '';
  }

  document.querySelector('.lang').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-lang]');
    if (!b) return;
    apply(b.dataset.lang);
    try { localStorage.setItem(KEY, current); } catch (err) { /* storage unavailable */ }
  });

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (err) { /* storage unavailable */ }
  apply(saved || 'ka');

  // Load the content saved from the admin panel, if Supabase is configured.
  if (CFG.supabaseUrl && CFG.supabaseKey && window.fetch) {
    fetch(CFG.supabaseUrl.replace(/\/$/, '') + '/rest/v1/' + P.TABLE + '?id=eq.1&select=data', {
      headers: { apikey: CFG.supabaseKey }
    })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) {
        if (rows && rows[0] && rows[0].data) { data = merge(rows[0].data); apply(current); }
      })
      .catch(function () { /* keep built-in content */ });
  }

  // TODO: store leads (e.g. a Supabase table) before launch. For now the form only confirms on screen.
  document.getElementById('lead-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('f-name').value.trim();
    var phone = document.getElementById('f-phone').value.trim();
    var msg = document.getElementById('form-msg');
    if (!name || phone.replace(/\D/g, '').length < 9) { msg.textContent = t('form.err'); return; }
    msg.textContent = t('form.ok').replace('{name}', name).replace('{phone}', phone);
    this.reset();
  });
})();
