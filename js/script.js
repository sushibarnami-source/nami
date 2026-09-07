/* =========================================================
   NAMI • ნამი — Sushi Bar Website
   ========================================================= */
(() => {
  'use strict';

  /* ---------------------------------------------------------
     i18n — UI strings (EN / KA / RU)
  --------------------------------------------------------- */
  const UI = {
    en: {
      nav_home: 'Home', nav_menu: 'Menu', nav_blog: 'Blog', nav_about: 'About Us', nav_contact: 'Contact',
      nav_reserve: 'Reserve a Table', footer_about: 'About',
      hero_eyebrow: 'Tradition · Taste · Innovation',
      hero_title: 'A <span class="accent">Wave</span> of Japanese Flavor',
      hero_sub: 'A wave never stops—it only changes its form. This is how we understand gastronomy: a tradition that evolves into new flavors over time.',
      hero_btn_menu: 'View Menu', hero_btn_story: 'Our Story',
      menu_eyebrow: 'Our Menu', menu_title: 'Crafted With Care',
      menu_lead: 'Every dish is prepared upon order with fresh and premium ingredients. Browse our categories below.',
      tab_rolls: 'Rolls', tab_nigiri: 'Nigiri', tab_maki: 'Maki', tab_futomaki: 'Futomaki',
      tab_tempuraRoll: 'Hot Rolls', tab_sets: 'Sets', tab_noodles: 'Noodles', tab_appetizers: 'Appetizers',
      tab_desserts: 'Desserts', tab_drinks: 'Drinks',
      menu_empty: 'No dishes in this category yet.',
      blog_eyebrow: 'Blog & News', blog_title: 'Nami Blog',
      blog_lead: 'Stories, traditions, and notes from the world of Asian culinary culture and the Nami team.',
      blog_readmore: 'Read More →',
      blog_alert: 'Full article coming soon — this is a placeholder for your blog content.',
      about_eyebrow: 'About Us', about_title: 'Our Story',
      about_p1: 'They say that Hokusai\'s famous wave began its long journey from Kanagawa and stopped in the heart of Guria. "Nami" means a wave in Japanese — a wave that brought Asian flavors right to you.',
      stat1_num: '25+', stat2_num: '100%', stat_dishes: 'Dishes on the menu', stat_fresh: 'Fresh fish',
      hours_title: 'Working Hours',
      day_monday: 'Monday', day_tuesday: 'Tuesday', day_wednesday: 'Wednesday', day_thursday: 'Thursday',
      day_friday: 'Friday', day_saturday: 'Saturday', day_sunday: 'Sunday',
      hours_closed_label: 'Closed',
      hours_open_until: "We're open today until {time}.",
      hours_closed_opens: "We're closed right now — opening today at {time}.",
      hours_closed_tomorrow: "We're closed for today — see you tomorrow from {time}.",
      contact_eyebrow: 'Contact & Location', contact_title: 'Come Say Hi',
      contact_lead: "Walk in, call ahead, or reserve a table online — we'd love to host you.",
      info_address_label: 'Address', info_address_value: '15 Chavchavadze Street, Ozurgeti, Georgia',
      info_phone_label: 'Phone', info_email_label: 'Email',
      info_hours_label: 'Hours', info_hours_value: 'Mon–Sat 13:30–23:30 · Sunday: Closed',
      form_title: 'Send a Message',
      label_name: 'Name', placeholder_name: 'Your name',
      label_email: 'Email',
      label_phone: 'Phone (optional)', placeholder_phone: '+995 5xx xx xx xx',
      label_message: 'Message', placeholder_message: 'Tell us about your reservation or question…',
      btn_send: 'Send Message',
      err_name: 'Please enter your name.',
      err_email: 'Please enter a valid email.',
      err_message: 'Message should be at least 10 characters.',
      form_success: "Thanks, {name}! Your message has been received — we'll be in touch soon.",
      footer_copy: '© {year} NAMI • ნამი Sushi Bar. All rights reserved.',
    },
    ka: {
      nav_home: 'მთავარი', nav_menu: 'მენიუ', nav_blog: 'ბლოგი', nav_about: 'ჩვენს შესახებ', nav_contact: 'კონტაქტი',
      nav_reserve: 'მაგიდის დაჯავშნა', footer_about: 'ჩვენ შესახებ',
      hero_eyebrow: 'ტრადიცია · გემო · სიახლე',
      hero_title: 'იაპონური გემოს <span class="accent">ტალღა</span>',
      hero_sub: 'ტალღა არასდროს ჩერდება — ის მხოლოდ ფორმას იცვლის. ჩვენც ასე გვესმის გასტრონომია: ტრადიცია, რომელიც დროთა განმავლობაში ახალ გემოდ იქცევა.',
      hero_btn_menu: 'მენიუს ნახვა', hero_btn_story: 'ჩვენი ისტორია',
      menu_eyebrow: 'ჩვენი მენიუ', menu_title: 'სიყვარულით მომზადებული',
      menu_lead: 'ყოველი კერძი მზადდება შეკვეთისთანავე, უახლესი და პრემიუმ ხარისხის ინგრედიენტებით. დაათვალიერეთ ჩვენი კატეგორიები ქვემოთ.',
      tab_rolls: 'როლი', tab_nigiri: 'ნიგირი', tab_maki: 'მაკი', tab_futomaki: 'ფუტომაკი',
      tab_tempuraRoll: 'შემწვარი როლი', tab_sets: 'სეტი', tab_noodles: 'ატრია', tab_appetizers: 'ხემსი',
      tab_desserts: 'დესერტი', tab_drinks: 'სასმელი',
      menu_empty: 'ამ კატეგორიაში კერძები ჯერ არ არის.',
      blog_eyebrow: 'ბლოგი და სიახლეები', blog_title: 'ნამის ბლოგი',
      blog_lead: 'ამბები, ტრადიციები და მცირე ჩანაწერები აზიური კულინარიული კულტურისა და „ნამის“ გუნდის შესახებ.',
      blog_readmore: 'სრულად →',
      blog_alert: 'სრული სტატია მალე გამოქვეყნდება — ეს არის თქვენი ბლოგის კონტენტის მაგალითი.',
      about_eyebrow: 'ჩვენს შესახებ', about_title: 'ჩვენი ისტორია',
      about_p1: 'ამბობენ, რომ ჰოკუსაის ცნობილმა ტალღამ კანაგავადან შორეული მოგზაურობა დაიწყო და გურიის გულში შეჩერდა. „ნამი“ იაპონურად ტალღას ნიშნავს, ტალღას, რომელმაც თქვენამდე აზიური გემო მოიტანა.',
      stat1_num: '25+', stat2_num: '100%', stat_dishes: 'კერძი მენიუში', stat_fresh: 'ფრეში თევზი',
      hours_title: 'სამუშაო საათები',
      day_monday: 'ორშაბათი', day_tuesday: 'სამშაბათი', day_wednesday: 'ოთხშაბათი', day_thursday: 'ხუთშაბათი',
      day_friday: 'პარასკევი', day_saturday: 'შაბათი', day_sunday: 'კვირა',
      hours_closed_label: 'დასვენების დღე',
      hours_open_until: 'დღეს ღიაა {time}-მდე.',
      hours_closed_opens: 'ამჟამად დახურული ვართ — დღეს გავიხსნებით {time}-ზე.',
      hours_closed_tomorrow: 'დღეისთვის დახურული ვართ — შეგხვდებით ხვალ {time}-დან.',
      contact_eyebrow: 'კონტაქტი და მდებარეობა', contact_title: 'მოგვინახულეთ',
      contact_lead: 'შემოდით უშუალოდ, დაგვირეკეთ წინასწარ ან დაჯავშნეთ მაგიდა ონლაინ — სიამოვნებით მოგემსახურებით.',
      info_address_label: 'მისამართი', info_address_value: 'ჭავჭავაძის ქუჩა 15, ოზურგეთი, საქართველო',
      info_phone_label: 'ტელეფონი', info_email_label: 'ელფოსტა',
      info_hours_label: 'სამუშაო საათები', info_hours_value: 'ორშ–შაბ 13:30–23:30 · კვირა: დასვენების დღე',
      form_title: 'მოგვწერეთ შეტყობინება',
      label_name: 'სახელი', placeholder_name: 'თქვენი სახელი',
      label_email: 'ელფოსტა',
      label_phone: 'ტელეფონი (არასავალდებულო)', placeholder_phone: '+995 5xx xx xx xx',
      label_message: 'შეტყობინება', placeholder_message: 'გვიამბეთ თქვენი ჯავშნის ან შეკითხვის შესახებ…',
      btn_send: 'გაგზავნა',
      err_name: 'გთხოვთ, შეიყვანოთ სახელი.',
      err_email: 'გთხოვთ, შეიყვანოთ ვალიდური ელფოსტა.',
      err_message: 'შეტყობინება უნდა შეიცავდეს მინიმუმ 10 სიმბოლოს.',
      form_success: 'მადლობა, {name}! თქვენი შეტყობინება მიღებულია — მალე დაგიკავშირდებით.',
      footer_copy: '© {year} NAMI • ნამი სუში ბარი. ყველა უფლება დაცულია.',
    },
    ru: {
      nav_home: 'Главная', nav_menu: 'Меню', nav_blog: 'Блог', nav_about: 'О нас', nav_contact: 'Контакты',
      nav_reserve: 'Забронировать столик', footer_about: 'О нас',
      hero_eyebrow: 'Традиция · Вкус · Новинка',
      hero_title: '<span class="accent">Волна</span> японского вкуса',
      hero_sub: 'Волна никогда не останавливается — она лишь меняет форму. Именно так мы понимаем гастрономию: традиция, которая со временем превращается в новый вкус.',
      hero_btn_menu: 'Смотреть меню', hero_btn_story: 'Наша история',
      menu_eyebrow: 'Наше меню', menu_title: 'С заботой о каждом блюде',
      menu_lead: 'Каждое блюдо готовится под заказ из свежайших и премиальных ингредиентов. Ознакомьтесь с нашими категориями ниже.',
      tab_rolls: 'Роллы', tab_nigiri: 'Нигири', tab_maki: 'Маки', tab_futomaki: 'Футомаки',
      tab_tempuraRoll: 'Горячие роллы', tab_sets: 'Сеты', tab_noodles: 'Лапша', tab_appetizers: 'Закуски',
      tab_desserts: 'Десерты', tab_drinks: 'Напитки',
      menu_empty: 'В этой категории пока нет блюд.',
      blog_eyebrow: 'Блог и новости', blog_title: 'Блог Nami',
      blog_lead: 'Истории, традиции и заметки из мира азиатской кулинарной культуры и команды Nami.',
      blog_readmore: 'Читать далее →',
      blog_alert: 'Полная статья скоро появится — это заглушка для содержимого вашего блога.',
      about_eyebrow: 'О нас', about_title: 'Наша история',
      about_p1: 'Говорят, что знаменитая волна Хокусаи начала свое далекое путешествие из Канагавы и остановилась в самом сердце Гурии. «Нами» по-японски означает волну — волну, которая принесла азиатский вкус прямо к вам.',
      stat1_num: '25+', stat2_num: '100%', stat_dishes: 'блюд в меню', stat_fresh: 'Свежая рыба',
      hours_title: 'Часы работы',
      day_monday: 'Понедельник', day_tuesday: 'Вторник', day_wednesday: 'Среда', day_thursday: 'Четверг',
      day_friday: 'Пятница', day_saturday: 'Суббота', day_sunday: 'Воскресенье',
      hours_closed_label: 'Выходной',
      hours_open_until: 'Сегодня открыто до {time}.',
      hours_closed_opens: 'Сейчас мы закрыты — сегодня открываемся в {time}.',
      hours_closed_tomorrow: 'На сегодня мы закрыты — ждём вас завтра с {time}.',
      contact_eyebrow: 'Контакты и адрес', contact_title: 'Заходите в гости',
      contact_lead: 'Заходите без предупреждения, звоните заранее или бронируйте столик онлайн — мы будем рады вас видеть.',
      info_address_label: 'Адрес', info_address_value: 'ул. Чавчавадзе 15, Озургети, Грузия',
      info_phone_label: 'Телефон', info_email_label: 'Эл. почта',
      info_hours_label: 'Часы работы', info_hours_value: 'Пн–Сб 13:30–23:30 · Вс: выходной',
      form_title: 'Отправить сообщение',
      label_name: 'Имя', placeholder_name: 'Ваше имя',
      label_email: 'Эл. почта',
      label_phone: 'Телефон (необязательно)', placeholder_phone: '+995 5xx xx xx xx',
      label_message: 'Сообщение', placeholder_message: 'Расскажите о брони или вашем вопросе…',
      btn_send: 'Отправить',
      err_name: 'Пожалуйста, введите ваше имя.',
      err_email: 'Пожалуйста, введите корректный email.',
      err_message: 'Сообщение должно содержать не менее 10 символов.',
      form_success: 'Спасибо, {name}! Ваше сообщение получено — мы скоро с вами свяжемся.',
      footer_copy: '© {year} NAMI • ნამი Суши-бар. Все права защищены.',
    },
  };

  const TAG_LABELS = {
    en: { spicy: '🌶 Spicy', veg: 'Veg', new: 'New' },
    ka: { spicy: '🌶 ცხარე', veg: 'ვეგეტარიანული', new: 'ახალი' },
    ru: { spicy: '🌶 Острое', veg: 'Вег.', new: 'Новинка' },
  };

  const SUPPORTED_LANGS = ['en', 'ka', 'ru'];
  let currentLang = (() => {
    try {
      const saved = localStorage.getItem('nami_lang');
      if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
    } catch (e) { /* localStorage unavailable */ }
    return 'en';
  })();

  function t(key) {
    const override = SITE_CONTENT_OVERRIDES[key];
    if (override && override[currentLang]) return override[currentLang];
    return (UI[currentLang] && UI[currentLang][key]) || UI.en[key] || key;
  }

  /* ---------------------------------------------------------
     Real menu, transcribed from the printed NAMI menu.
     Prices are in ₾ (GEL). name/desc carry EN / KA / RU text.
  --------------------------------------------------------- */
  /* Shown immediately and kept if the live database is unreachable;
     replaced by loadMenuItemsFromSupabase() once admin-managed dishes
     arrive. */
  let MENU_ITEMS = [
    // ატრია — Noodles
    { category: 'noodles', price: '19.00 ₾', tags: [],
      name: { en: 'Chicken Noodles', ka: 'ქათმის ხორცით', ru: 'Лапша с курицей' },
      desc: { en: 'Chicken, noodles, bell pepper, carrot, cabbage, noodle sauce.',
        ka: 'ქათმის ხორცი, ლაფშა, ბულგარული, სტაფილო, კომბოსტო, ლაფშის სოუსი.',
        ru: 'Курица, лапша, болгарский перец, морковь, капуста, соус для лапши.' } },
    { category: 'noodles', price: '21.00 ₾', tags: [],
      name: { en: 'Fried Shrimp Noodles', ka: 'შემწვარი კრევეტით', ru: 'Лапша с жареными креветками' },
      desc: { en: 'Fried shrimp, noodles, bell pepper, carrot, cabbage, noodle sauce.',
        ka: 'შემწვარი კრევეტი, ლაფშა, ბულგარული, სტაფილო, კომბოსტო, ლაფშის სოუსი.',
        ru: 'Жареные креветки, лапша, болгарский перец, морковь, капуста, соус для лапши.' } },
    { category: 'noodles', price: '15.00 ₾', tags: [],
      name: { en: 'Mushroom Noodles', ka: 'სოკოს ატრია', ru: 'Лапша с грибами' },
      desc: { en: 'Mushroom, noodles, bell pepper, carrot, cabbage, noodle sauce.',
        ka: 'სოკო, ლაფშა, ბულგარული, სტაფილო, კომბოსტო, ლაფშის სოუსი.',
        ru: 'Грибы, лапша, болгарский перец, морковь, капуста, соус для лапши.' } },

    // ხემსი — Appetizers
    { category: 'appetizers', price: '10.00 ₾', tags: [],
      name: { en: 'Chuka Salad', ka: 'ჩუკას სალათი', ru: 'Салат чука' },
      desc: { en: 'Chuka seaweed, sesame.',
        ka: 'ჩუკა, სეზამი.',
        ru: 'Чука (маринованные водоросли), кунжут.' } },
    { category: 'appetizers', price: '15.00 ₾', tags: [],
      name: { en: 'Fried Shrimp', ka: 'შემწვარი კრევეტი', ru: 'Жареные креветки' },
      desc: { en: 'Shrimp, sweet & spicy sauce.',
        ka: 'კრევეტი, ტკბილ-ცხარე სოუსი.',
        ru: 'Креветки, кисло-сладкий острый соус.' } },

    // შემწვარი როლი — Tempura Rolls
    { category: 'tempuraRoll', price: '26.00 ₾', tags: [],
      name: { en: 'Tempura Canada Roll', ka: 'ტემპურა კანადა როლი', ru: 'Ролл Темпура Канада' },
      desc: { en: 'Nori, rice, cucumber, cream cheese, crab meat.',
        ka: 'ნორი, ბრინჯი, კიტრი, კრემჩიზი, კიბორჩხალის ხორცი.',
        ru: 'Нори, рис, огурец, сливочный сыр, мясо краба.' } },
    { category: 'tempuraRoll', price: '28.00 ₾', tags: [],
      name: { en: 'Tempura Bonito Roll', ka: 'ტემპურა ბონიტო როლი', ru: 'Ролл Темпура Бонито' },
      desc: { en: 'Rice, nori, cream cheese, cucumber, tuna, bonito flakes.',
        ka: 'ბრინჯი, ნორი, კრემჩიზი, კიტრი, თინუსი, ბონიტო.',
        ru: 'Рис, нори, сливочный сыр, огурец, тунец, хлопья бонито.' } },

    // ნიგირი — Nigiri
    { category: 'nigiri', price: '5.00 ₾', tags: [],
      name: { en: 'Salmon Nigiri', ka: 'ორაგულის ნიგირი', ru: 'Нигири с лососем' },
      desc: { en: 'Rice, salmon, wasabi.',
        ka: 'ბრინჯი, ორაგული, ვასაბი.',
        ru: 'Рис, лосось, васаби.' } },
    { category: 'nigiri', price: '6.00 ₾', tags: [],
      name: { en: 'Eel Nigiri', ka: 'უნაგის ნიგირი', ru: 'Нигири с угрём' },
      desc: { en: 'Rice, eel, wasabi.',
        ka: 'ბრინჯი, უნაგი, ვასაბი.',
        ru: 'Рис, угорь, васаби.' } },
    { category: 'nigiri', price: '5.00 ₾', tags: [],
      name: { en: 'Tuna Nigiri', ka: 'თინუსი ნიგირი', ru: 'Нигири с тунцом' },
      desc: { en: 'Rice, tuna, wasabi.',
        ka: 'ბრინჯი, თინუსი, ვასაბი.',
        ru: 'Рис, тунец, васаби.' } },

    // სეტი — Combo Sets
    { category: 'sets', price: '60.00 ₾', tags: [],
      name: { en: 'NAMI Set — 40 pieces', ka: 'ნამი — 40 ნაჭერი', ru: 'Сет NAMI — 40 кусочков' },
      desc: { en: 'Futomaki salmon, tuna roll, tempura Canada roll, chuka maki, avocado maki, salmon maki.',
        ka: 'ფუტომაკ ორაგული, თინუსის როლი, შემწვარი კანადა როლი, ჩუკას მაკი, ავოკადოს მაკი, ორაგული მაკი.',
        ru: 'Футомаки с лососем, ролл с тунцом, ролл темпура Канада, маки чука, маки с авокадо, маки с лососем.' } },
    { category: 'sets', price: '40.00 ₾', tags: [],
      name: { en: 'California Set — 28 pieces', ka: 'კალიფორნია სეტი — 28 ნაჭერი', ru: 'Сет Калифорния — 28 кусочков' },
      desc: { en: 'California roll, tuna maki, futomaki eel, chuka maki.',
        ka: 'კალიფორნია, თინუსის მაკი, ფუტომაკ უნაგი, ჩუკას მაკი.',
        ru: 'Ролл Калифорния, маки с тунцом, футомаки с угрём, маки чука.' } },
    { category: 'sets', price: '48.00 ₾', tags: [],
      name: { en: 'Philadelphia Set — 28 pieces', ka: 'ფილადელფია სეტი — 28 ნაჭერი', ru: 'Сет Филадельфия — 28 кусочков' },
      desc: { en: 'Philadelphia roll, tuna maki, futomaki salmon, chuka maki.',
        ka: 'ფილადელფია, თინუსის მაკი, ფუტომაკ სალმონი, ჩუკას მაკი.',
        ru: 'Ролл Филадельфия, маки с тунцом, футомаки с лососем, маки чука.' } },

    // მაკი — Maki
    { category: 'maki', price: '6.00 ₾', tags: [],
      name: { en: 'Cucumber Maki', ka: 'კიტრის მაკი', ru: 'Маки с огурцом' },
      desc: { en: 'Rice, nori, cucumber.',
        ka: 'ბრინჯი, ნორი, კიტრი.',
        ru: 'Рис, нори, огурец.' } },
    { category: 'maki', price: '7.00 ₾', tags: [],
      name: { en: 'Avocado Maki', ka: 'ავოკადოს მაკი', ru: 'Маки с авокадо' },
      desc: { en: 'Rice, nori, avocado.',
        ka: 'ბრინჯი, ნორი, ავოკადო.',
        ru: 'Рис, нори, авокадо.' } },
    { category: 'maki', price: '12.00 ₾', tags: [],
      name: { en: 'Salmon Maki', ka: 'ორაგულის მაკი', ru: 'Маки с лососем' },
      desc: { en: 'Rice, nori, salmon.',
        ka: 'ბრინჯი, ნორი, ორაგული.',
        ru: 'Рис, нори, лосось.' } },
    { category: 'maki', price: '13.00 ₾', tags: [],
      name: { en: 'Tuna Maki', ka: 'თინუსი მაკი', ru: 'Маки с тунцом' },
      desc: { en: 'Rice, nori, tuna.',
        ka: 'ბრინჯი, ნორი, თინუსი.',
        ru: 'Рис, нори, тунец.' } },
    { category: 'maki', price: '8.00 ₾', tags: [],
      name: { en: 'Chuka Maki', ka: 'ჩუკა მაკი', ru: 'Маки чука' },
      desc: { en: 'Rice, nori, chuka seaweed.',
        ka: 'ბრინჯი, ნორი, ჩუკა.',
        ru: 'Рис, нори, чука (водоросли).' } },

    // როლი — Rolls
    { category: 'rolls', price: '30.00 ₾', tags: [],
      name: { en: 'Golden Dragon', ka: 'გოლდენ დრაკონი', ru: 'Голден Дракон' },
      desc: { en: 'Rice, nori, cream cheese, cucumber, shrimp, eel, spicy sauce, teriyaki.',
        ka: 'ბრინჯი, ნორი, კრემჩიზი, კიტრი, კრევეტი, უნაგი, სპაისი, ტერიაკი.',
        ru: 'Рис, нори, сливочный сыр, огурец, креветка, угорь, спайси-соус, терияки.' } },
    { category: 'rolls', price: '27.00 ₾', tags: [],
      name: { en: 'Philadelphia', ka: 'ფილადელფია', ru: 'Филадельфия' },
      desc: { en: 'Rice, nori, cream cheese, cucumber, salmon.',
        ka: 'ბრინჯი, ნორი, კრემჩიზი, კიტრი, ორაგული.',
        ru: 'Рис, нори, сливочный сыр, огурец, лосось.' } },
    { category: 'rolls', price: '26.00 ₾', tags: [],
      name: { en: 'Tuna Roll', ka: 'თინუსის როლი', ru: 'Ролл с тунцом' },
      desc: { en: 'Rice, nori, cream cheese, cucumber, tuna, bonito flakes.',
        ka: 'ბრინჯი, ნორი, კრემჩიზი, კიტრი, თინუსი, ბონიტო.',
        ru: 'Рис, нори, сливочный сыр, огурец, тунец, хлопья бонито.' } },
    { category: 'rolls', price: '26.00 ₾', tags: [],
      name: { en: 'California', ka: 'კალიფორნია', ru: 'Калифорния' },
      desc: { en: 'Rice, nori, crab meat, cream cheese, cucumber, tobiko.',
        ka: 'ბრინჯი, ნორი, კიბორჩხალის ხორცი, კრემჩიზი, კიტრი, ტობიკო.',
        ru: 'Рис, нори, мясо краба, сливочный сыр, огурец, тобико.' } },
    { category: 'rolls', price: '17.00 ₾', tags: [],
      name: { en: 'Veggie Roll', ka: 'ვეჯი როლი', ru: 'Овощной ролл' },
      desc: { en: 'Rice, nori, cream cheese, cucumber, avocado, sesame, teriyaki.',
        ka: 'ბრინჯი, ნორი, კრემჩიზი, კიტრი, ავოკადო, სეზამი, ტერიაკი.',
        ru: 'Рис, нори, сливочный сыр, огурец, авокадо, кунжут, терияки.' } },

    // ფუტომაკი — Futomaki
    { category: 'futomaki', price: '24.00 ₾', tags: [],
      name: { en: 'Futomaki Eel', ka: 'ფუტომაკ უნაგი', ru: 'Футомаки с угрём' },
      desc: { en: 'Nori, rice, cream cheese, cucumber, eel, teriyaki, sesame.',
        ka: 'ნორი, ბრინჯი, კრემჩიზი, კიტრი, უნაგი, ტერიაკი, სეზამი.',
        ru: 'Нори, рис, сливочный сыр, огурец, угорь, терияки, кунжут.' } },
    { category: 'futomaki', price: '21.00 ₾', tags: [],
      name: { en: 'Futomaki Salmon', ka: 'ფუტომაკ სალმონი', ru: 'Футомаки с лососем' },
      desc: { en: 'Nori, rice, cream cheese, cucumber, salmon.',
        ka: 'ნორი, ბრინჯი, კრემჩიზი, კიტრი, ორაგული.',
        ru: 'Нори, рис, сливочный сыр, огурец, лосось.' } },
  ];

  /* ---------------------------------------------------------
     Live menu items from Supabase (managed via /admin)
  --------------------------------------------------------- */
  async function loadMenuItemsFromSupabase() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
    try {
      const { data, error } = await supabaseClient
        .from('menu_items')
        .select('*')
        .eq('published', true)
        .order('category', { ascending: true })
        .order('sort_order', { ascending: false });

      if (error || !data || !data.length) return;

      MENU_ITEMS = data.map(row => ({
        category: row.category,
        price: row.price,
        tags: row.tags || [],
        photo: row.photo_url || null,
        name: { en: row.name_en, ka: row.name_ka, ru: row.name_ru },
        desc: { en: row.desc_en, ka: row.desc_ka, ru: row.desc_ru },
      }));

      renderMenu(currentCategory);
    } catch (e) {
      // offline, blocked, or Supabase unreachable — keep the fallback menu
    }
  }

  /* ---------------------------------------------------------
     Live site text + settings from Supabase (managed via /admin)
  --------------------------------------------------------- */
  let SITE_CONTENT_OVERRIDES = {};

  async function loadSiteContentFromSupabase() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
    try {
      const { data, error } = await supabaseClient.from('site_content').select('*');
      if (error || !data || !data.length) return;

      SITE_CONTENT_OVERRIDES = {};
      data.forEach(row => {
        SITE_CONTENT_OVERRIDES[row.key] = { en: row.value_en, ka: row.value_ka, ru: row.value_ru };
      });

      applyStaticTranslations();
    } catch (e) {
      // offline, blocked, or Supabase unreachable — keep the fallback text
    }
  }

  async function loadSiteSettingsFromSupabase() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
    try {
      const { data, error } = await supabaseClient.from('site_settings').select('*').eq('id', 1).single();
      if (error || !data) return;

      if (data.phone) {
        const phoneLink = document.getElementById('contactPhoneLink');
        if (phoneLink) {
          phoneLink.textContent = data.phone;
          phoneLink.href = 'tel:' + data.phone.replace(/[^\d+]/g, '');
        }
      }
      if (data.email) {
        const emailLink = document.getElementById('contactEmailLink');
        if (emailLink) {
          emailLink.textContent = data.email;
          emailLink.href = 'mailto:' + data.email;
        }
      }
      if (data.weekday_open && data.weekday_close) {
        document.querySelectorAll('#hoursList li:not([data-closed="true"]) span:last-child').forEach(el => {
          el.textContent = `${data.weekday_open} – ${data.weekday_close}`;
        });
        updateHours();
      }
    } catch (e) {
      // offline, blocked, or Supabase unreachable — keep the fallback settings
    }
  }

  /* ---------------------------------------------------------
     Illustrations used inside blog article content
  --------------------------------------------------------- */
  const IMG_GINGER = 'images/blog-ginger.png';
  const IMG_WASABI = 'images/blog-wasabi.png';
  const IMG_SOY = 'images/blog-soy-sauce.png';

  function figure(src, caption) {
    return `<figure class="post-figure"><img src="${src}" alt="${caption}" loading="lazy"><figcaption>${caption}</figcaption></figure>`;
  }

  /* Shown immediately on load and kept if the live database is
     unreachable; replaced by loadBlogPostsFromSupabase() once the
     admin-managed posts arrive. */
  let BLOG_POSTS = [
    {
      icon: '🥢',
      gradient: 'linear-gradient(135deg,#4f7a5c,#11241c)',
      date: { en: 'Sep 7, 2026', ka: '7 სექტემბერი, 2026', ru: '7 сентября 2026' },
      tag: { en: 'Guide', ka: 'გზამკვლევი', ru: 'Гид' },
      title: { en: 'How to Eat Sushi Properly?', ka: 'როგორ ვჭამოთ სწორად?', ru: 'Как правильно есть суши?' },
      excerpt: {
        en: 'Ever wondered why ginger, wasabi, and soy sauce are served with sushi? Discover their real history — and how to use them the right way.',
        ka: 'გაინტერესებთ, რატომ მიირთმევენ ჯანჯაფილს, ვასაბსა და სოიოს სოუსს სუშისთან ერთად? გაეცანით მათ ნამდვილ ისტორიას და სწორად მირთმევის წესებს.',
        ru: 'Задумывались, почему имбирь, васаби и соевый соус подают с суши? Узнайте их настоящую историю — и как использовать их правильно.',
      },
      content: {
        en: [
          `Did you know where the tradition of using soy sauce, wasabi, and ginger comes from, and what they were actually used for in ancient Japan?`,
          `<strong>生姜 - Ginger:</strong> In ancient times, before refrigerators existed, the Japanese used vinegar and spices to preserve fish. Ginger has natural antimicrobial properties and was originally added primarily for hygiene and safety.`,
          figure(IMG_GINGER, 'Ginger (生姜)'),
          `<strong>How to eat it:</strong> It is never eaten together with a roll — it is a "palate cleanser" meant to be enjoyed between different bites to neutralize flavors.`,
          `<strong>わさび - Wasabi:</strong> Real wasabi was a rare and expensive product in ancient Japan, placed alongside raw fish due to its antiseptic properties to neutralize bacteria.`,
          figure(IMG_WASABI, 'Wasabi (わさび)'),
          `<strong>How to eat it:</strong> The chef already places the exact dose on your plate — dissolving wasabi into soy sauce disrupts the balance and ruins the dish's original flavor.`,
          `<strong>醤油 - Soy Sauce:</strong> The tradition of using soy sauce developed a little later, enhancing the unique umami flavor of raw fish (sashimi and sushi).`,
          figure(IMG_SOY, 'Soy Sauce (醤油)'),
          `<strong>How to eat it:</strong> Dip by the fish side, not the rice — rice quickly absorbs liquid, becomes overly soaked, and falls apart.`,
          `Small tradition, big flavor! Drop by to put this knowledge into practice!`,
        ],
        ka: [
          `იცით თუ არა, საიდან მოდის სოიოს, ვასაბისა და ჯანჯაფილის გამოყენების ტრადიცია და რეალურად რისთვის იყენებდნენ მათ ძველ იაპონიაში?`,
          `<strong>生姜 - ჯანჯაფილი:</strong> ძველად, როდესაც მაცივრები არ არსებობდა, იაპონელები თევზის შესანახად ძმარსა და სანელებლებს იყენებდნენ. ჯანჯაფილს კი ბუნებრივი ანტიმიკრობული თვისებები აქვს და მას პირველ რიგში ჰიგიენისა და უსაფრთხოებისთვის ამატებდნენ.`,
          figure(IMG_GINGER, 'ჯანჯაფილი (生姜)'),
          `<strong>როგორ მივირთვათ:</strong> ის არასდროს იჭმევა როლთან ერთად - ის არის „პირის გამწმენდი“, რომელსაც სხვადასხვა გემოს შორის მიირთმევენ, გემოების გასანეიტრებლად.`,
          `<strong>わさび - ვასაბი:</strong> ნამდვილი ვასაბი ძველ იაპონიაში იშვიათი და ძვირად ღირებული პროდუქტი იყო, რომელსაც ანტისეპტიკური თვისებების გამო უმი თევზის გვერდით დებდნენ ბაქტერიების გასანეიტრებლად.`,
          figure(IMG_WASABI, 'ვასაბი (わさび)'),
          `<strong>როგორ მივირთვათ:</strong> შეფი უკვე დებს ზუსტ დოზას თეფშზე - ვასაბის სოიაში გახსნა კერძის ბალანსსა და მის თავდაპირველ გემოს არღვევს.`,
          `<strong>醤油 - სოიოს სოუსი:</strong> სოიოს სოუსის გამოყენების ტრადიცია ოდნავ მოგვიანებით განვითარდა და ის უმი თევზის (საშიმის და სუშის) უნიკალურ უმამის გემოს აძლიერებს.`,
          figure(IMG_SOY, 'სოიოს სოუსი (醤油)'),
          `<strong>როგორ მივირთვათ:</strong> ჩააწეთ თევზის მხრიდან და არა ბრინჯის - ბრინჯი სწრაფად შთანთქავს სითხეს, ზედმეტად იჟღინთება და იშლება.`,
          `პატარა ტრადიცია, დიდი გემო! მობრძანდით, რომ ცოდნა პრაქტიკაში გამოსცადოთ!`,
        ],
        ru: [
          `Знаете ли вы, откуда происходит традиция использования соевого соуса, васаби и имбиря, и для чего на самом деле они использовались в древней Японии?`,
          `<strong>生姜 - Имбирь:</strong> В древние времена, когда не было холодильников, японцы использовали уксус и специи для сохранения рыбы. Имбирь обладает природными антимикробными свойствами и изначально добавлялся в первую очередь для гигиены и безопасности.`,
          figure(IMG_GINGER, 'Имбирь (生姜)'),
          `<strong>Как есть:</strong> Его никогда не едят вместе с роллами — это «очиститель вкуса», который едят между разными блюдами для нейтрализации вкусов.`,
          `<strong>わさび - Васаби:</strong> Настоящий васаби в древней Японии был редким и дорогим продуктом, который клали рядом с сырой рыбой из-за его антисептических свойств для нейтрализации бактерий.`,
          figure(IMG_WASABI, 'Васаби (わさび)'),
          `<strong>Как есть:</strong> Шеф-повар уже кладет точную дозу на тарелку — растворение васаби в соевом соусе нарушает баланс и первоначальный вкус блюда.`,
          `<strong>醤油 - Соевый соус:</strong> Традиция использования соевого соуса развилась чуть позже, он усиливает уникальный умами-вкус сырой рыбы (сашими и суши).`,
          figure(IMG_SOY, 'Соевый соус (醤油)'),
          `<strong>Как есть:</strong> Макайте стороной рыбы, а не риса — рис быстро впитывает жидкость, перенасыщается и разваливается.`,
          `Маленькая традиция, большой вкус! Загляните к нам, чтобы применить эти знания на практике!`,
        ],
      },
    },
  ];

  /* ---------------------------------------------------------
     Live blog posts from Supabase (managed via /admin)
  --------------------------------------------------------- */
  function formatBlogDate(isoDate, lang) {
    const parts = isoDate.split('-').map(Number);
    const dt = new Date(parts[0], parts[1] - 1, parts[2]);
    const locale = lang === 'ka' ? 'ka-GE' : lang === 'ru' ? 'ru-RU' : 'en-US';
    const opts = lang === 'en'
      ? { month: 'short', day: 'numeric', year: 'numeric' }
      : { day: 'numeric', month: 'long', year: 'numeric' };
    try {
      return new Intl.DateTimeFormat(locale, opts).format(dt);
    } catch (e) {
      return isoDate;
    }
  }

  async function loadBlogPostsFromSupabase() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
    try {
      const { data, error } = await supabaseClient
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: false })
        .order('post_date', { ascending: false });

      if (error || !data || !data.length) return;

      BLOG_POSTS = data.map(row => ({
        icon: row.icon,
        gradient: row.gradient,
        date: {
          en: formatBlogDate(row.post_date, 'en'),
          ka: formatBlogDate(row.post_date, 'ka'),
          ru: formatBlogDate(row.post_date, 'ru'),
        },
        tag: { en: row.tag_en, ka: row.tag_ka, ru: row.tag_ru },
        title: { en: row.title_en, ka: row.title_ka, ru: row.title_ru },
        excerpt: { en: row.excerpt_en, ka: row.excerpt_ka, ru: row.excerpt_ru },
        content: { en: row.content_en, ka: row.content_ka, ru: row.content_ru },
      }));

      renderBlog();
      if (openPostIndex !== null) renderBlogModal(openPostIndex);
    } catch (e) {
      // offline, blocked, or Supabase unreachable — keep the fallback post
    }
  }

  /* ---------------------------------------------------------
     Menu rendering + filtering
  --------------------------------------------------------- */
  const menuGrid = document.getElementById('menuGrid');
  const menuTabs = document.getElementById('menuTabs');
  let currentCategory = 'rolls';

  function renderMenu(category) {
    currentCategory = category;
    const items = MENU_ITEMS.filter(item => item.category === category);

    menuGrid.innerHTML = '';

    if (!items.length) {
      menuGrid.innerHTML = `<p class="menu-empty">${t('menu_empty')}</p>`;
      return;
    }

    const tagLabels = TAG_LABELS[currentLang] || TAG_LABELS.en;

    items.forEach((item, i) => {
      const card = document.createElement('article');
      card.className = 'menu-item';
      card.style.animationDelay = `${(i % 12) * 0.04}s`;

      const tagsHtml = (item.tags || [])
        .map(tag => `<span class="tag ${tag}">${tagLabels[tag] || tag}</span>`)
        .join('');

      const name = item.name[currentLang] || item.name.en;
      const desc = item.desc[currentLang] || item.desc.en;
      const photoHtml = item.photo
        ? `<img class="menu-item-photo" src="${item.photo}" alt="${name}" loading="lazy">`
        : '';

      card.innerHTML = `
        ${photoHtml}
        <div class="menu-item-top">
          <h3 class="menu-item-name">${name}</h3>
          <span class="menu-item-price">${item.price}</span>
        </div>
        <p class="menu-item-desc">${desc}</p>
        ${tagsHtml ? `<div class="menu-item-tags">${tagsHtml}</div>` : ''}
      `;
      card.addEventListener('click', () => openDishModal(item));
      menuGrid.appendChild(card);
    });
  }

  /* ---------------------------------------------------------
     Dish detail modal
  --------------------------------------------------------- */
  const dishModal = document.getElementById('dishModal');
  const dishModalBackdrop = document.getElementById('dishModalBackdrop');
  const dishModalClose = document.getElementById('dishModalClose');
  const dishModalPhotoWrap = document.getElementById('dishModalPhotoWrap');
  const dishModalName = document.getElementById('dishModalName');
  const dishModalPrice = document.getElementById('dishModalPrice');
  const dishModalTags = document.getElementById('dishModalTags');
  const dishModalDesc = document.getElementById('dishModalDesc');

  function openDishModal(item) {
    const name = item.name[currentLang] || item.name.en;
    const desc = item.desc[currentLang] || item.desc.en;
    const tagLabels = TAG_LABELS[currentLang] || TAG_LABELS.en;

    dishModalPhotoWrap.innerHTML = item.photo
      ? `<img src="${item.photo}" alt="${name}" loading="lazy">`
      : '';
    dishModalPhotoWrap.hidden = !item.photo;
    dishModalName.textContent = name;
    dishModalPrice.textContent = item.price;
    dishModalDesc.textContent = desc;
    dishModalTags.innerHTML = (item.tags || [])
      .map(tag => `<span class="tag ${tag}">${tagLabels[tag] || tag}</span>`)
      .join('');

    dishModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeDishModal() {
    dishModal.hidden = true;
    document.body.style.overflow = '';
  }

  dishModalBackdrop.addEventListener('click', closeDishModal);
  dishModalClose.addEventListener('click', closeDishModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !dishModal.hidden) closeDishModal();
  });

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

  /* ---------------------------------------------------------
     Blog rendering
  --------------------------------------------------------- */
  const blogGrid = document.getElementById('blogGrid');

  function renderBlog() {
    blogGrid.innerHTML = BLOG_POSTS.map((post, i) => {
      const title = post.title[currentLang] || post.title.en;
      const excerpt = post.excerpt[currentLang] || post.excerpt.en;
      const tag = post.tag[currentLang] || post.tag.en;
      const date = post.date[currentLang] || post.date.en;
      return `
      <article class="blog-card">
        <div class="blog-thumb" style="background:${post.gradient}">${post.icon}</div>
        <div class="blog-body">
          <div class="blog-meta"><span>${tag}</span><span>${date}</span></div>
          <h3 class="blog-title">${title}</h3>
          <p class="blog-excerpt">${excerpt}</p>
          <a href="#" class="blog-readmore" data-index="${i}" data-title="${title}">${t('blog_readmore')}</a>
        </div>
      </article>
    `;
    }).join('');
  }

  /* ---------------------------------------------------------
     Blog article modal
  --------------------------------------------------------- */
  const blogModal = document.getElementById('blogModal');
  const blogModalBackdrop = document.getElementById('blogModalBackdrop');
  const blogModalClose = document.getElementById('blogModalClose');
  const blogModalThumb = document.getElementById('blogModalThumb');
  const blogModalMeta = document.getElementById('blogModalMeta');
  const blogModalTitle = document.getElementById('blogModalTitle');
  const blogModalContent = document.getElementById('blogModalContent');
  let openPostIndex = null;

  function renderBlogModal(index) {
    const post = BLOG_POSTS[index];
    if (!post) return;
    const title = post.title[currentLang] || post.title.en;
    const tag = post.tag[currentLang] || post.tag.en;
    const date = post.date[currentLang] || post.date.en;
    const paragraphs = post.content[currentLang] || post.content.en;

    blogModalThumb.style.background = post.gradient;
    blogModalThumb.textContent = post.icon;
    blogModalMeta.innerHTML = `<span>${tag}</span><span>${date}</span>`;
    blogModalTitle.textContent = title;
    blogModalContent.innerHTML = paragraphs
      .map(p => p.trim().startsWith('<figure') ? p : `<p>${p}</p>`)
      .join('');
  }

  function openBlogModal(index) {
    const post = BLOG_POSTS[index];
    if (!post || !post.content) return;
    openPostIndex = index;
    renderBlogModal(index);
    blogModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeBlogModal() {
    openPostIndex = null;
    blogModal.hidden = true;
    document.body.style.overflow = '';
  }

  blogGrid.addEventListener('click', (e) => {
    const link = e.target.closest('.blog-readmore');
    if (!link) return;
    e.preventDefault();
    const index = Number(link.dataset.index);
    const post = BLOG_POSTS[index];
    if (post && post.content) {
      openBlogModal(index);
    } else {
      alert(`"${link.dataset.title}"\n\n${t('blog_alert')}`);
    }
  });

  blogModalBackdrop.addEventListener('click', closeBlogModal);
  blogModalClose.addEventListener('click', closeBlogModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !blogModal.hidden) closeBlogModal();
  });

  /* ---------------------------------------------------------
     i18n — apply translations to static markup
  --------------------------------------------------------- */
  function applyStaticTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
    });
  }

  function setLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    currentLang = lang;
    try { localStorage.setItem('nami_lang', lang); } catch (e) { /* ignore */ }

    document.getElementById('htmlRoot').setAttribute('lang', lang === 'ka' ? 'ka' : lang === 'ru' ? 'ru' : 'en');

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    applyStaticTranslations();
    renderMenu(currentCategory);
    renderBlog();
    if (openPostIndex !== null) renderBlogModal(openPostIndex);
    updateHours();
    renderFooterCopy();

    // clear any stale validation messages from the previous language
    ['name', 'email', 'message'].forEach(field => setError(field, ''));
    successMsg.textContent = '';
  }

  document.getElementById('langSwitch').addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-btn');
    if (!btn) return;
    setLanguage(btn.dataset.lang);
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
    let isClosedToday = false;
    items.forEach(li => {
      const isToday = li.dataset.day === todayName;
      li.classList.toggle('today', isToday);
      if (isToday) {
        isClosedToday = li.dataset.closed === 'true';
        if (!isClosedToday) todayRangeText = li.children[1].textContent.trim();
      }
    });

    if (isClosedToday) {
      const tomorrowName = dayNames[(now.getDay() + 1) % 7];
      let tomorrowOpen = '';
      items.forEach(li => {
        if (li.dataset.day === tomorrowName && li.dataset.closed !== 'true') {
          tomorrowOpen = li.children[1].textContent.trim().split('–')[0].trim();
        }
      });
      note.textContent = t('hours_closed_tomorrow').replace('{time}', tomorrowOpen);
      return;
    }

    if (todayRangeText) {
      const [openStr, closeStr] = todayRangeText.split('–').map(s => s.trim());
      const toMinutes = (time) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
      };
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const openMinutes = toMinutes(openStr);
      const closeMinutes = toMinutes(closeStr);
      const isOpenNow = nowMinutes >= openMinutes && nowMinutes < closeMinutes;

      const template = isOpenNow
        ? t('hours_open_until').replace('{time}', closeStr)
        : nowMinutes < openMinutes
          ? t('hours_closed_opens').replace('{time}', openStr)
          : t('hours_closed_tomorrow').replace('{time}', openStr);

      note.textContent = template;
    }
  }

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

    if (!data.name.trim()) { setError('name', t('err_name')); valid = false; }
    else setError('name', '');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email.trim())) { setError('email', t('err_email')); valid = false; }
    else setError('email', '');

    if (!data.message.trim() || data.message.trim().length < 10) {
      setError('message', t('err_message'));
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
    successMsg.textContent = t('form_success').replace('{name}', data.name.split(' ')[0]);
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
     Footer year + copyright text
  --------------------------------------------------------- */
  function renderFooterCopy() {
    document.getElementById('footerCopy').textContent = t('footer_copy').replace('{year}', new Date().getFullYear());
  }

  /* ---------------------------------------------------------
     Init
  --------------------------------------------------------- */
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
  document.getElementById('htmlRoot').setAttribute('lang', currentLang === 'ka' ? 'ka' : currentLang === 'ru' ? 'ru' : 'en');
  applyStaticTranslations();
  renderMenu('rolls');
  renderBlog();
  updateHours();
  renderFooterCopy();
  loadBlogPostsFromSupabase();
  loadMenuItemsFromSupabase();
  loadSiteContentFromSupabase();
  loadSiteSettingsFromSupabase();

})();
