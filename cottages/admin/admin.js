/* Pitsruli admin: edit texts, contacts and models, saved as one JSON row in Supabase.
   Field paths use "/" because text keys themselves contain dots (hero.title). */
(function () {
  var P = window.PITSRULI;
  var CFG = window.PITSRULI_CONFIG || {};
  var configured = !!(CFG.supabaseUrl && CFG.supabaseKey && window.supabase);
  var sb = configured ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey) : null;
  var LANG_LABEL = { ka: 'KA', en: 'EN', ru: 'RU' };

  var GROUPS = [
    ['ზედა მენიუ და ბრენდი', /^(brand|nav|cta)\./],
    ['მთავარი ბლოკი', /^(hero|f\d)\./],
    ['მოდელების სექცია', /^(models|spec)\./],
    ['როგორ ვაშენებთ', /^(process|s\d)\./],
    ['სად ვაშენებთ', /^(regions|pkg\d)\./],
    ['მასალები', /^(materials|mat\d)\./],
    ['კონტაქტი და ფორმა', /^(contact|form|opt|r)\./],
    ['ქვედა ზოლი', /^footer\./],
    ['ბრაუზერის ჩანართი და Google (SEO)', /^meta\./]
  ];

  var doc = null;
  var dirty = false;
  var $ = function (id) { return document.getElementById(id); };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function withDefaults(saved) {
    var d = clone(P.DEFAULT);
    if (!saved) return d;
    return {
      version: 1,
      contact: Object.assign(d.contact, saved.contact || {}),
      models: Array.isArray(saved.models) ? saved.models : d.models,
      texts: Object.assign(d.texts, saved.texts || {})
    };
  }
  function getPath(path) { return path.split('/').reduce(function (o, k) { return o == null ? o : o[k]; }, doc); }
  function setPath(path, value) {
    var keys = path.split('/'), last = keys.pop(), o = doc;
    keys.forEach(function (k) { if (o[k] == null) o[k] = {}; o = o[k]; });
    o[last] = value;
  }

  function setStatus(text, kind) {
    var s = $('status');
    s.textContent = text;
    s.className = 'status' + (kind ? ' ' + kind : '');
  }
  function markDirty() {
    dirty = true;
    setStatus('შენახვის მოლოდინში არსებული ცვლილებები', 'dirty');
    $('save').disabled = !configured;
  }

  // ---------- Models ----------
  function trio(path, label, multiline) {
    return '<div class="field-group"><span>' + label + '</span><div class="grid3">' +
      P.LANGS.map(function (l) {
        var p = path + '/' + l, v = esc(getPath(p) || '');
        var field = multiline
          ? '<textarea data-path="' + p + '" rows="2">' + v + '</textarea>'
          : '<input data-path="' + p + '" value="' + v + '">';
        return '<label><span class="lang-tag">' + LANG_LABEL[l] + '</span>' + field + '</label>';
      }).join('') + '</div></div>';
  }
  function modelPreview(m) {
    return P.FORMAT.area(m.area, 'ka') + ' · ' + P.FORMAT.days(m.days, 'ka') + ' · ' + P.FORMAT.price(m.price, 'ka') +
      '   |   ' + P.FORMAT.price(m.price, 'en') + '   |   ' + P.FORMAT.price(m.price, 'ru');
  }
  function renderModels() {
    var brand = (doc.texts['brand.name'] || {}).ka || 'ფიცრული';
    $('models').innerHTML = doc.models.map(function (m, i) {
      var base = 'models/' + i;
      var shapeOpts = Object.keys(P.SHAPES).map(function (k) {
        return '<option value="' + k + '"' + (m.shape === k ? ' selected' : '') + '>' + esc(P.SHAPES[k].label) + '</option>';
      }).join('');
      return '<article class="card" data-index="' + i + '">' +
        '<div class="model-head">' +
          '<svg viewBox="0 0 200 120" aria-hidden="true">' + (P.SHAPES[m.shape] || P.SHAPES.gable).svg + '</svg>' +
          '<h3>' + esc(brand + ' ' + m.code) + '</h3>' +
          '<div class="actions">' +
            '<button class="btn ghost small" type="button" data-act="up"' + (i === 0 ? ' disabled' : '') + ' aria-label="ზემოთ">↑</button>' +
            '<button class="btn ghost small" type="button" data-act="down"' + (i === doc.models.length - 1 ? ' disabled' : '') + ' aria-label="ქვემოთ">↓</button>' +
            '<button class="btn danger small" type="button" data-act="delete">წაშლა</button>' +
          '</div>' +
          '<span class="preview">' + esc(modelPreview(m)) + '</span>' +
        '</div>' +
        '<div class="grid4">' +
          '<label>ნომერი სახელში<input data-path="' + base + '/code" value="' + esc(m.code) + '"></label>' +
          '<label>ფართი, მ²<input type="number" min="1" step="1" data-path="' + base + '/area" data-num value="' + esc(m.area) + '"></label>' +
          '<label>მშენებლობა, დღე<input type="number" min="1" step="1" data-path="' + base + '/days" data-num value="' + esc(m.days) + '"></label>' +
          '<label>ფასი, ₾ (დან)<input type="number" min="0" step="500" data-path="' + base + '/price" data-num value="' + esc(m.price) + '"></label>' +
        '</div>' +
        '<label>ნახატი<select data-path="' + base + '/shape">' + shapeOpts + '</select></label>' +
        trio(base + '/tag', 'იარლიყი (სახელის ზემოთ)') +
        trio(base + '/beds', 'საძინებლები') +
        trio(base + '/desc', 'მოკლე აღწერა', true) +
      '</article>';
    }).join('');
  }
  $('add-model').addEventListener('click', function () {
    doc.models.push({ code: '100', shape: 'gable', area: 100, days: 45, price: 200000,
      beds: { ka: '3', en: '3', ru: '3' }, tag: { ka: '', en: '', ru: '' }, desc: { ka: '', en: '', ru: '' } });
    renderModels(); markDirty();
    var cards = document.querySelectorAll('#models .card');
    cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('models').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]');
    if (!b) return;
    var i = Number(b.closest('.card').dataset.index), act = b.dataset.act, list = doc.models;
    if (act === 'delete') {
      if (b.dataset.confirm !== '1') { b.dataset.confirm = '1'; b.textContent = 'დარწმუნებული ხართ?'; return; }
      list.splice(i, 1);
    } else if (act === 'up' && i > 0) { list.splice(i - 1, 0, list.splice(i, 1)[0]); }
    else if (act === 'down' && i < list.length - 1) { list.splice(i + 1, 0, list.splice(i, 1)[0]); }
    renderModels(); markDirty();
  });

  // ---------- Texts ----------
  function renderTexts() {
    var keys = Object.keys(doc.texts), used = {}, out = '';
    GROUPS.forEach(function (g) {
      var ks = keys.filter(function (k) { return g[1].test(k); });
      ks.forEach(function (k) { used[k] = 1; });
      out += section(g[0], ks);
    });
    out += section('სხვა', keys.filter(function (k) { return !used[k]; }));
    $('texts').innerHTML = out;
    filterTexts();
  }
  function section(title, ks) {
    if (!ks.length) return '';
    return '<div class="text-group"><h3 class="group-title">' + esc(title) + '</h3>' + ks.map(function (k) {
      return '<div class="text-row" data-key="' + esc(k) + '"><span class="key">' + esc(k) + '</span>' +
        P.LANGS.map(function (l) {
          var v = esc((doc.texts[k] || {})[l] || '');
          return '<label><span class="lang-tag">' + LANG_LABEL[l] + '</span><textarea rows="1" data-path="texts/' + k + '/' + l + '">' + v + '</textarea></label>';
        }).join('') + '</div>';
    }).join('') + '</div>';
  }
  function filterTexts() {
    var q = $('search').value.trim().toLowerCase();
    document.querySelectorAll('#texts .text-row').forEach(function (row) {
      var hay = row.dataset.key + ' ' + Array.prototype.map.call(row.querySelectorAll('textarea'), function (t) { return t.value; }).join(' ');
      row.hidden = !!q && hay.toLowerCase().indexOf(q) < 0;
    });
    document.querySelectorAll('#texts .text-group').forEach(function (g) {
      g.hidden = !g.querySelector('.text-row:not([hidden])');
    });
    autosizeAll();
  }
  $('search').addEventListener('input', filterTexts);

  function autosize(t) { t.style.height = 'auto'; t.style.height = (t.scrollHeight + 2) + 'px'; }
  function autosizeAll() { document.querySelectorAll('#editor textarea').forEach(autosize); }

  // ---------- Field binding ----------
  $('editor').addEventListener('input', function (e) {
    var el = e.target;
    if (!el.dataset || !el.dataset.path) return;
    var v = el.value;
    if (el.hasAttribute('data-num')) v = v === '' ? 0 : Number(v);
    setPath(el.dataset.path, v);
    if (el.tagName === 'TEXTAREA') autosize(el);
    var card = el.closest('#models .card');
    if (card) {
      var m = doc.models[Number(card.dataset.index)];
      card.querySelector('.preview').textContent = modelPreview(m);
      card.querySelector('h3').textContent = ((doc.texts['brand.name'] || {}).ka || 'ფიცრული') + ' ' + m.code;
    }
    markDirty();
  });
  $('editor').addEventListener('change', function (e) {
    if (e.target.matches('select[data-path$="/shape"]')) renderModels();
  });

  // ---------- Tabs ----------
  document.querySelector('.tabs').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-tab]');
    if (!b) return;
    document.querySelectorAll('.tabs button').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
    document.querySelectorAll('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== b.dataset.tab; });
    autosizeAll();
  });

  function showEditor(saved) {
    doc = withDefaults(saved);
    $('c-phone').value = doc.contact.phone;
    $('c-email').value = doc.contact.email;
    renderModels();
    renderTexts();
    $('login').hidden = true;
    $('editor').hidden = false;
    $('savebar').hidden = false;
    dirty = false;
    $('save').disabled = true;
    setStatus(configured ? 'ცვლილებები არ არის' : 'სადემონსტრაციო რეჟიმი: შენახვა გამორთულია');
    autosizeAll();
  }

  // ---------- Save ----------
  $('save').addEventListener('click', function () {
    if (!sb) return;
    var btn = $('save');
    btn.disabled = true;
    setStatus('ინახება…');
    sb.from(P.TABLE).upsert({ id: 1, data: doc }).then(function (res) {
      if (res.error) {
        btn.disabled = false;
        var m = /row-level security|permission/i.test(res.error.message)
          ? 'ამ ანგარიშს რედაქტირების უფლება არ აქვს.'
          : 'ვერ შეინახა: ' + res.error.message;
        setStatus(m, 'bad');
        return;
      }
      dirty = false;
      setStatus('შენახულია ' + new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', hour12: false }) + '. საიტზე ცვლილება გვერდის განახლებისას გამოჩნდება.', 'ok');
    });
  });
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  // ---------- Auth ----------
  function loadContent(session) {
    $('who').textContent = session.user.email;
    $('logout').hidden = false;
    sb.rpc('pitsruli_is_admin').then(function (r) {
      if (r.error || r.data !== true) {
        $('login').hidden = false; $('editor').hidden = true; $('savebar').hidden = true;
        $('l-err').textContent = r.error ? 'ბაზასთან კავშირი ვერ მოხერხდა. გაშვებულია თუ არა supabase/schema.sql?' : 'ეს ანგარიში ადმინისტრატორად არ არის დამატებული.';
        return;
      }
      sb.from(P.TABLE).select('data').eq('id', 1).maybeSingle().then(function (res) {
        if (res.error) { $('l-err').textContent = 'მონაცემები ვერ ჩაიტვირთა: ' + res.error.message; return; }
        showEditor(res.data ? res.data.data : null);
      });
    });
  }

  $('login').addEventListener('submit', function (e) {
    e.preventDefault();
    $('l-err').textContent = '';
    $('l-btn').disabled = true;
    sb.auth.signInWithPassword({ email: $('l-email').value.trim(), password: $('l-pass').value }).then(function (res) {
      $('l-btn').disabled = false;
      if (res.error) { $('l-err').textContent = 'ელფოსტა ან პაროლი არასწორია.'; return; }
      loadContent(res.data.session);
    });
  });
  $('logout').addEventListener('click', function () {
    if (dirty && !window.confirm('შეუნახავი ცვლილებები დაიკარგება. გავიდეთ?')) return;
    sb.auth.signOut().then(function () { dirty = false; location.reload(); });
  });

  if (!configured) {
    $('setup').hidden = false;
    showEditor(null);
    return;
  }
  sb.auth.getSession().then(function (r) {
    if (r.data && r.data.session) loadContent(r.data.session);
    else $('login').hidden = false;
  });
})();
