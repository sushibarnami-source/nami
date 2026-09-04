/* =========================================================
   NAMI • ნამი — Sushi Bar Website
   ========================================================= */
(() => {
  'use strict';

  /* ---------------------------------------------------------
     Sample data — replace with your real menu / posts anytime
  --------------------------------------------------------- */
  const MENU_ITEMS = [
    // Sushi Rolls
    { category: 'rolls', name: 'Nami Special Roll', price: '$14.5', desc: 'Salmon, avocado & cream cheese, torched with spicy mayo and unagi glaze.', tags: ['new'] },
    { category: 'rolls', name: 'Dragon Roll', price: '$13.0', desc: 'Shrimp tempura inside, thinly sliced avocado and eel sauce on top.', tags: [] },
    { category: 'rolls', name: 'Rainbow Roll', price: '$13.5', desc: 'California roll topped with assorted fresh sashimi and avocado.', tags: [] },
    { category: 'rolls', name: 'Spicy Tuna Roll', price: '$11.0', desc: 'Fresh tuna, scallion and sriracha mayo, rolled in toasted sesame.', tags: ['spicy'] },
    { category: 'rolls', name: 'Vegetable Garden Roll', price: '$9.5', desc: 'Cucumber, avocado, carrot, asparagus and pickled radish.', tags: ['veg'] },
    { category: 'rolls', name: 'Tbilisi Roll', price: '$15.0', desc: 'Grilled eel, cream cheese and cucumber, wrapped in soy paper with gold flake.', tags: ['new'] },

    // Nigiri & Sashimi
    { category: 'nigiri', name: 'Salmon Nigiri (2pc)', price: '$6.5', desc: 'Hand-pressed rice topped with fresh Norwegian salmon.', tags: [] },
    { category: 'nigiri', name: 'Tuna Nigiri (2pc)', price: '$7.0', desc: 'Bluefin tuna over seasoned sushi rice.', tags: [] },
    { category: 'nigiri', name: 'Eel Nigiri (2pc)', price: '$7.5', desc: 'Grilled freshwater eel glazed with sweet unagi sauce.', tags: [] },
    { category: 'nigiri', name: 'Salmon Sashimi (6pc)', price: '$14.0', desc: 'Thick-cut, buttery salmon served chilled.', tags: [] },
    { category: 'nigiri', name: 'Chef\'s Sashimi Platter', price: '$26.0', desc: 'Chef\'s daily selection of the freshest catch, 15 pieces.', tags: ['new'] },

    // Tempura & Hot Dishes
    { category: 'tempura', name: 'Shrimp Tempura', price: '$12.0', desc: 'Five hand-battered shrimp, crisp-fried, served with tentsuyu dip.', tags: [] },
    { category: 'tempura', name: 'Vegetable Tempura', price: '$9.0', desc: 'Seasonal vegetables in a light, crackling tempura batter.', tags: ['veg'] },
    { category: 'tempura', name: 'Chicken Katsu', price: '$13.5', desc: 'Crispy panko-breaded chicken thigh with tonkatsu sauce and cabbage.', tags: [] },
    { category: 'tempura', name: 'Miso Grilled Black Cod', price: '$22.0', desc: 'Marinated 48 hours in sweet miso, char-grilled to order.', tags: ['new'] },
    { category: 'tempura', name: 'Spicy Garlic Udon', price: '$11.5', desc: 'Thick wheat noodles stir-fried with garlic, chili oil and scallion.', tags: ['spicy', 'veg'] },

    // Starters & Salads
    { category: 'starters', name: 'Edamame', price: '$5.0', desc: 'Steamed soybeans finished with sea salt.', tags: ['veg'] },
    { category: 'starters', name: 'Miso Soup', price: '$4.0', desc: 'Traditional soybean broth with tofu, wakame and scallion.', tags: ['veg'] },
    { category: 'starters', name: 'Seaweed Salad', price: '$6.5', desc: 'Marinated wakame with sesame and a citrus dressing.', tags: ['veg'] },
    { category: 'starters', name: 'Spicy Tuna Tartare', price: '$12.5', desc: 'Diced tuna, avocado, chili and citrus soy over crispy wonton.', tags: ['spicy'] },
    { category: 'starters', name: 'Gyoza (5pc)', price: '$8.5', desc: 'Pan-seared pork dumplings with a ginger soy dip.', tags: [] },

    // Drinks
    { category: 'drinks', name: 'Sencha Green Tea', price: '$3.5', desc: 'Steamed Japanese green tea, served hot or iced.', tags: ['veg'] },
    { category: 'drinks', name: 'Nami Signature Sake', price: '$9.0', desc: 'Premium junmai sake, served warm or chilled.', tags: [] },
    { category: 'drinks', name: 'Yuzu Sour', price: '$8.5', desc: 'Shochu, fresh yuzu juice and soda over ice.', tags: ['new'] },
    { category: 'drinks', name: 'Georgian Saperavi (glass)', price: '$7.0', desc: 'Full-bodied local red wine, a house favorite pairing.', tags: [] },
    { category: 'drinks', name: 'Sparkling Water', price: '$3.0', desc: 'Borjomi natural mineral water.', tags: ['veg'] },

    // Desserts
    { category: 'desserts', name: 'Matcha Cheesecake', price: '$7.5', desc: 'Silky cheesecake infused with ceremonial-grade matcha.', tags: [] },
    { category: 'desserts', name: 'Mochi Trio', price: '$6.5', desc: 'Three flavors of chewy mochi: mango, red bean and black sesame.', tags: ['veg'] },
    { category: 'desserts', name: 'Tempura Banana', price: '$6.0', desc: 'Crisp-fried banana with vanilla ice cream and honey drizzle.', tags: ['new'] },
  ];

  const BLOG_POSTS = [
    {
      icon: '🍣',
      gradient: 'linear-gradient(135deg,#a8342a,#c9a24b)',
      date: 'Aug 12, 2026',
      tag: 'News',
      title: 'NAMI Opens Its Doors on Rustaveli Avenue',
      excerpt: 'We are thrilled to welcome you to our new home in the heart of Tbilisi — come see the space and taste the opening menu.',
    },
    {
      icon: '🐟',
      gradient: 'linear-gradient(135deg,#5c6f4c,#c9a24b)',
      date: 'Aug 28, 2026',
      tag: 'Behind the Scenes',
      title: 'How We Source Our Fish, Daily',
      excerpt: 'A look at our early-morning market runs and the relationships with suppliers that keep every plate honest and fresh.',
    },
    {
      icon: '🍶',
      gradient: 'linear-gradient(135deg,#7d241c,#171412)',
      date: 'Sep 2, 2026',
      tag: 'Guide',
      title: 'A Beginner\'s Guide to Sake Pairing',
      excerpt: 'Not sure what to order? Our head chef breaks down which sake styles go with which rolls — and why it matters.',
    },
    {
      icon: '🌶️',
      gradient: 'linear-gradient(135deg,#c9a24b,#a8342a)',
      date: 'Sep 10, 2026',
      tag: 'Menu Update',
      title: 'Introducing the Tbilisi Roll',
      excerpt: 'Our newest signature roll blends grilled eel and gold leaf — a tribute to the city we now call home.',
    },
    {
      icon: '🎉',
      gradient: 'linear-gradient(135deg,#171412,#5c6f4c)',
      date: 'Sep 20, 2026',
      tag: 'Events',
      title: 'Join Us for a Sushi-Rolling Workshop',
      excerpt: 'Learn knife skills and rolling technique from our chefs in a hands-on evening class. Limited seats available.',
    },
    {
      icon: '🍵',
      gradient: 'linear-gradient(135deg,#c9a24b,#171412)',
      date: 'Sep 27, 2026',
      tag: 'Culture',
      title: 'The Meaning Behind "Nami"',
      excerpt: 'In Georgian, ნამი means "dew" — in Japanese, 波 means "wave." Here\'s the story behind our name.',
    },
  ];

  /* ---------------------------------------------------------
     Menu rendering + filtering
  --------------------------------------------------------- */
  const menuGrid = document.getElementById('menuGrid');
  const menuTabs = document.getElementById('menuTabs');

  function renderMenu(category) {
    const items = category === 'all'
      ? MENU_ITEMS
      : MENU_ITEMS.filter(item => item.category === category);

    menuGrid.innerHTML = '';

    if (!items.length) {
      menuGrid.innerHTML = '<p class="menu-empty">No dishes in this category yet.</p>';
      return;
    }

    const tagLabels = { spicy: '🌶 Spicy', veg: 'Veg', new: 'New' };

    items.forEach((item, i) => {
      const card = document.createElement('article');
      card.className = 'menu-item';
      card.style.animationDelay = `${(i % 12) * 0.04}s`;

      const tagsHtml = (item.tags || [])
        .map(t => `<span class="tag ${t}">${tagLabels[t] || t}</span>`)
        .join('');

      card.innerHTML = `
        <div class="menu-item-top">
          <h3 class="menu-item-name">${item.name}</h3>
          <span class="menu-item-price">${item.price}</span>
        </div>
        <p class="menu-item-desc">${item.desc}</p>
        ${tagsHtml ? `<div class="menu-item-tags">${tagsHtml}</div>` : ''}
      `;
      menuGrid.appendChild(card);
    });
  }

  menuTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.menu-tab');
    if (!btn) return;

    menuTabs.querySelectorAll('.menu-tab').forEach(tab => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    renderMenu(btn.dataset.category);
  });

  renderMenu('all');

  /* ---------------------------------------------------------
     Blog rendering
  --------------------------------------------------------- */
  const blogGrid = document.getElementById('blogGrid');

  function renderBlog() {
    blogGrid.innerHTML = BLOG_POSTS.map(post => `
      <article class="blog-card">
        <div class="blog-thumb" style="background:${post.gradient}">${post.icon}</div>
        <div class="blog-body">
          <div class="blog-meta"><span>${post.tag}</span><span>${post.date}</span></div>
          <h3 class="blog-title">${post.title}</h3>
          <p class="blog-excerpt">${post.excerpt}</p>
          <a href="#" class="blog-readmore" data-title="${post.title}">Read More →</a>
        </div>
      </article>
    `).join('');
  }
  renderBlog();

  blogGrid.addEventListener('click', (e) => {
    const link = e.target.closest('.blog-readmore');
    if (!link) return;
    e.preventDefault();
    alert(`"${link.dataset.title}"\n\nFull article coming soon — this is a placeholder for your blog content.`);
  });

  /* ---------------------------------------------------------
     Sticky header on scroll + active nav link
  --------------------------------------------------------- */
  const header = document.getElementById('siteHeader');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = ['home', 'menu', 'blog', 'about', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);

    const backToTop = document.getElementById('backToTop');
    backToTop.classList.toggle('visible', window.scrollY > 500);

    let current = sections[0].id;
    const scrollPos = window.scrollY + window.innerHeight * 0.35;
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active-link', link.getAttribute('href') === `#${current}`);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mainNav.addEventListener('click', (e) => {
    if (e.target.matches('.nav-link')) {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  /* ---------------------------------------------------------
     Back to top
  --------------------------------------------------------- */
  document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------------------------------------------------------
     Working hours — highlight today + open/closed note
  --------------------------------------------------------- */
  function updateHours() {
    const list = document.getElementById('hoursList');
    const note = document.getElementById('hoursNote');
    if (!list || !note) return;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const todayName = dayNames[now.getDay()];

    const items = list.querySelectorAll('li');
    let todayRangeText = '';
    items.forEach(li => {
      const isToday = li.dataset.day === todayName;
      li.classList.toggle('today', isToday);
      if (isToday) todayRangeText = li.children[1].textContent.trim();
    });

    if (todayRangeText) {
      const [openStr, closeStr] = todayRangeText.split('–').map(s => s.trim());
      const toMinutes = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const openMinutes = toMinutes(openStr);
      const closeMinutes = toMinutes(closeStr);
      const isOpenNow = nowMinutes >= openMinutes && nowMinutes < closeMinutes;

      note.textContent = isOpenNow
        ? `We're open today until ${closeStr}.`
        : nowMinutes < openMinutes
          ? `We're closed right now — opening today at ${openStr}.`
          : `We're closed for today — see you from ${openStr} tomorrow's schedule.`;
    }
  }
  updateHours();

  /* ---------------------------------------------------------
     Contact form validation (client-side demo)
  --------------------------------------------------------- */
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  function setError(fieldName, message) {
    const errorEl = form.querySelector(`.form-error[data-for="${fieldName}"]`);
    const row = errorEl ? errorEl.closest('.form-row') : null;
    if (errorEl) errorEl.textContent = message || '';
    if (row) row.classList.toggle('error', Boolean(message));
  }

  function validateForm(data) {
    let valid = true;

    if (!data.name.trim()) { setError('name', 'Please enter your name.'); valid = false; }
    else setError('name', '');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email.trim())) { setError('email', 'Please enter a valid email.'); valid = false; }
    else setError('email', '');

    if (!data.message.trim() || data.message.trim().length < 10) {
      setError('message', 'Message should be at least 10 characters.');
      valid = false;
    } else setError('message', '');

    return valid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      message: form.message.value,
    };

    if (!validateForm(data)) {
      successMsg.textContent = '';
      return;
    }

    // Demo only — no backend wired up yet. Replace with a real fetch() call
    // to your API / form service (e.g. Formspree, EmailJS, your own endpoint).
    successMsg.textContent = `Thanks, ${data.name.split(' ')[0]}! Your message has been received — we'll be in touch soon.`;
    form.reset();
  });

  /* ---------------------------------------------------------
     Scroll reveal
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  document.getElementById('year').textContent = new Date().getFullYear();

})();
