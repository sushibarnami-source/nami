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
      hero_eyebrow: 'Fresh · Handmade · Every Day',
      hero_title: 'A <span class="accent">Wave</span> of Japanese Flavor',
      hero_sub: 'A wave never stops—it only changes its form. This is how we understand gastronomy: a tradition that evolves into new flavors over time.',
      hero_btn_menu: 'View Menu', hero_btn_story: 'Our Story',
      menu_eyebrow: 'Our Menu', menu_title: 'Crafted With Care',
      menu_lead: 'Every plate is prepared to order with premium fish, seasonal produce and rice seasoned in-house. Explore our categories below.',
      tab_all: 'All', tab_rolls: 'Sushi Rolls', tab_nigiri: 'Nigiri & Sashimi', tab_tempura: 'Tempura & Hot',
      tab_starters: 'Starters & Salads', tab_drinks: 'Drinks', tab_desserts: 'Desserts',
      menu_empty: 'No dishes in this category yet.',
      blog_eyebrow: 'Blog & News', blog_title: 'From Our Kitchen',
      blog_lead: 'Stories, seasonal specials and behind-the-scenes notes from the NAMI team.',
      blog_readmore: 'Read More →',
      blog_alert: 'Full article coming soon — this is a placeholder for your blog content.',
      about_eyebrow: 'About Us', about_title: 'Our Story',
      about_p1: 'NAMI &mdash; meaning <em>"dew"</em> in Georgian (ნამი) and echoing the Japanese word for <em>"wave"</em> (波) &mdash; was born from a simple idea: bring the precision and purity of Japanese sushi to the heart of our city, served with the generosity and warmth Georgians are known for.',
      about_p2: 'Our chefs train in traditional knife technique and rice preparation, while our produce is sourced daily from local markets and trusted seafood suppliers. The result is a menu that honors tradition while feeling completely at home here.',
      about_p3: "Whether you're joining us for a quiet lunch, a celebration, or a late-night roll with friends, our goal is the same every time: fresh food, honest hospitality, no rush.",
      stat_years: 'Years serving fresh sushi', stat_dishes: 'Dishes on the menu', stat_fresh: 'Fresh, never frozen fish*',
      hours_title: 'Working Hours',
      day_monday: 'Monday', day_tuesday: 'Tuesday', day_wednesday: 'Wednesday', day_thursday: 'Thursday',
      day_friday: 'Friday', day_saturday: 'Saturday', day_sunday: 'Sunday',
      hours_open_until: "We're open today until {time}.",
      hours_closed_opens: "We're closed right now — opening today at {time}.",
      hours_closed_tomorrow: "We're closed for today — see you tomorrow from {time}.",
      contact_eyebrow: 'Contact & Location', contact_title: 'Come Say Hi',
      contact_lead: "Walk in, call ahead, or reserve a table online — we'd love to host you.",
      info_address_label: 'Address', info_address_value: '12 Rustaveli Avenue, Tbilisi, Georgia',
      info_phone_label: 'Phone', info_email_label: 'Email',
      info_hours_label: 'Hours', info_hours_value: 'Mon–Thu 12:00–22:00 · Fri–Sat 12:00–23:30 · Sun 13:00–21:00',
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
      hero_eyebrow: 'ახალი · ხელნაკეთი · ყოველდღე',
      hero_title: 'იაპონური გემოს <span class="accent">ტალღა</span>',
      hero_sub: 'ტალღა არასდროს ჩერდება — ის მხოლოდ ფორმას იცვლის. ჩვენც ასე გვესმის გასტრონომია: ტრადიცია, რომელიც დროთა განმავლობაში ახალ გემოდ იქცევა.',
      hero_btn_menu: 'მენიუს ნახვა', hero_btn_story: 'ჩვენი ისტორია',
      menu_eyebrow: 'ჩვენი მენიუ', menu_title: 'სიყვარულით მომზადებული',
      menu_lead: 'ყოველი კერძი მზადდება შეკვეთისთანავე, პრემიუმ ხარისხის თევზით, სეზონური პროდუქტებითა და ადგილზე შეკმაზული ბრინჯით. დაათვალიერეთ ჩვენი კატეგორიები ქვემოთ.',
      tab_all: 'ყველა', tab_rolls: 'სუში როლები', tab_nigiri: 'ნიგირი და საშიმი', tab_tempura: 'ტემპურა და ცხელი კერძები',
      tab_starters: 'საუზმეები და სალათები', tab_drinks: 'სასმელები', tab_desserts: 'დესერტები',
      menu_empty: 'ამ კატეგორიაში კერძები ჯერ არ არის.',
      blog_eyebrow: 'ბლოგი და სიახლეები', blog_title: 'ჩვენი სამზარეულოდან',
      blog_lead: 'ისტორიები, სეზონური სიახლეები და კულისებს მიღმა შენიშვნები NAMI-ს გუნდისგან.',
      blog_readmore: 'სრულად →',
      blog_alert: 'სრული სტატია მალე გამოქვეყნდება — ეს არის თქვენი ბლოგის კონტენტის მაგალითი.',
      about_eyebrow: 'ჩვენს შესახებ', about_title: 'ჩვენი ისტორია',
      about_p1: 'სახელი „ნამი“ ქართულად ცვარს ნიშნავს, ხოლო იაპონურად თანხმოვანი სიტყვა <em>波</em> ტალღას აღნიშნავს — სწორედ ამ იდეამ დაბადა ჩვენი რესტორანი: იაპონური სუშის სიზუსტისა და სისუფთავის მოტანა ჩვენი ქალაქის გულში, ქართული სტუმართმოყვარეობის სითბოთი შეზავებული.',
      about_p2: 'ჩვენი შეფ-მზარეულები დახელოვნებულნი არიან ტრადიციულ დანით მუშაობასა და ბრინჯის მომზადებაში, ხოლო პროდუქტი ყოველდღიურად მოგვაქვს ადგილობრივი ბაზრებიდან და სანდო მომწოდებლებისგან. შედეგად მივიღეთ მენიუ, რომელიც პატივს სცემს ტრადიციას და ამავე დროს სრულიად შინაურულად გრძნობს თავს აქ.',
      about_p3: 'მშვიდი სადილისთვის მოხვალთ, სადღესასწაულოდ თუ გვიან საღამოს მეგობრებთან ერთად როლის მისაღებად — ჩვენი მიზანი ყოველთვის ერთია: ახალი საკვები, პატიოსანი სტუმართმოყვარეობა და დროის უყოყმანო დათმობა.',
      stat_years: 'წელია ვამზადებთ ახალ სუშის', stat_dishes: 'კერძი მენიუში', stat_fresh: 'ახალი, არასდროს გაყინული თევზი*',
      hours_title: 'სამუშაო საათები',
      day_monday: 'ორშაბათი', day_tuesday: 'სამშაბათი', day_wednesday: 'ოთხშაბათი', day_thursday: 'ხუთშაბათი',
      day_friday: 'პარასკევი', day_saturday: 'შაბათი', day_sunday: 'კვირა',
      hours_open_until: 'დღეს ღიაა {time}-მდე.',
      hours_closed_opens: 'ამჟამად დახურული ვართ — დღეს გავიხსნებით {time}-ზე.',
      hours_closed_tomorrow: 'დღეისთვის დახურული ვართ — შეგხვდებით ხვალ {time}-დან.',
      contact_eyebrow: 'კონტაქტი და მდებარეობა', contact_title: 'მოგვინახულეთ',
      contact_lead: 'შემოდით უშუალოდ, დაგვირეკეთ წინასწარ ან დაჯავშნეთ მაგიდა ონლაინ — სიამოვნებით მოგემსახურებით.',
      info_address_label: 'მისამართი', info_address_value: 'რუსთაველის გამზირი 12, თბილისი, საქართველო',
      info_phone_label: 'ტელეფონი', info_email_label: 'ელფოსტა',
      info_hours_label: 'სამუშაო საათები', info_hours_value: 'ორშ–ხუთ 12:00–22:00 · პარ–შაბ 12:00–23:30 · კვირა 13:00–21:00',
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
      hero_eyebrow: 'Свежее · Ручная работа · Каждый день',
      hero_title: '<span class="accent">Волна</span> японского вкуса',
      hero_sub: 'Волна никогда не останавливается — она лишь меняет форму. Именно так мы понимаем гастрономию: традиция, которая со временем превращается в новый вкус.',
      hero_btn_menu: 'Смотреть меню', hero_btn_story: 'Наша история',
      menu_eyebrow: 'Наше меню', menu_title: 'С заботой о каждом блюде',
      menu_lead: 'Каждое блюдо готовится на заказ из отборной рыбы, сезонных продуктов и риса, приправленного по нашему собственному рецепту. Изучите категории меню ниже.',
      tab_all: 'Все', tab_rolls: 'Суши-роллы', tab_nigiri: 'Нигири и сашими', tab_tempura: 'Темпура и горячее',
      tab_starters: 'Закуски и салаты', tab_drinks: 'Напитки', tab_desserts: 'Десерты',
      menu_empty: 'В этой категории пока нет блюд.',
      blog_eyebrow: 'Блог и новости', blog_title: 'Из нашей кухни',
      blog_lead: 'Истории, сезонные новинки и закулисные заметки от команды NAMI.',
      blog_readmore: 'Читать далее →',
      blog_alert: 'Полная статья скоро появится — это заглушка для содержимого вашего блога.',
      about_eyebrow: 'О нас', about_title: 'Наша история',
      about_p1: 'NAMI &mdash; по-грузински «ნამი» означает <em>«роса»</em>, а созвучное японское слово <em>波</em> означает «волна» &mdash; родился из простой идеи: принести точность и чистоту японских суши в сердце нашего города, приправленные щедростью и теплом грузинского гостеприимства.',
      about_p2: 'Наши повара владеют традиционной техникой работы с ножом и приготовления риса, а продукты мы ежедневно закупаем на местных рынках у проверенных поставщиков морепродуктов. В результате получается меню, которое чтит традиции и при этом чувствует себя как дома.',
      about_p3: 'Пришли ли вы к нам на спокойный обед, на праздник или на поздний ролл с друзьями — наша цель всегда одна: свежая еда, искреннее гостеприимство и никакой спешки.',
      stat_years: 'лет мы готовим свежие суши', stat_dishes: 'блюд в меню', stat_fresh: 'Свежая, никогда не замороженная рыба*',
      hours_title: 'Часы работы',
      day_monday: 'Понедельник', day_tuesday: 'Вторник', day_wednesday: 'Среда', day_thursday: 'Четверг',
      day_friday: 'Пятница', day_saturday: 'Суббота', day_sunday: 'Воскресенье',
      hours_open_until: 'Сегодня открыто до {time}.',
      hours_closed_opens: 'Сейчас мы закрыты — сегодня открываемся в {time}.',
      hours_closed_tomorrow: 'На сегодня мы закрыты — ждём вас завтра с {time}.',
      contact_eyebrow: 'Контакты и адрес', contact_title: 'Заходите в гости',
      contact_lead: 'Заходите без предупреждения, звоните заранее или бронируйте столик онлайн — мы будем рады вас видеть.',
      info_address_label: 'Адрес', info_address_value: 'просп. Руставели 12, Тбилиси, Грузия',
      info_phone_label: 'Телефон', info_email_label: 'Эл. почта',
      info_hours_label: 'Часы работы', info_hours_value: 'Пн–Чт 12:00–22:00 · Пт–Сб 12:00–23:30 · Вс 13:00–21:00',
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
    return (UI[currentLang] && UI[currentLang][key]) || UI.en[key] || key;
  }

  /* ---------------------------------------------------------
     Sample data — replace with your real menu / posts anytime
     name/desc/title/excerpt/tag/date carry EN / KA / RU text
  --------------------------------------------------------- */
  const MENU_ITEMS = [
    // Sushi Rolls
    { category: 'rolls', price: '$14.5', tags: ['new'],
      name: { en: 'Nami Special Roll', ka: 'ნამის სპეშალ როლი', ru: 'Ролл Nami Special' },
      desc: { en: 'Salmon, avocado & cream cheese, torched with spicy mayo and unagi glaze.',
        ka: 'ორაგული, ავოკადო და კრემ-ჩიზი, შემწვარი ცხარე მაიონეზითა და უნაგის საწებლით.',
        ru: 'Лосось, авокадо и сливочный сыр, обожжённые с острым майонезом и соусом унаги.' } },
    { category: 'rolls', price: '$13.0', tags: [],
      name: { en: 'Dragon Roll', ka: 'დრაკონის როლი', ru: 'Ролл «Дракон»' },
      desc: { en: 'Shrimp tempura inside, thinly sliced avocado and eel sauce on top.',
        ka: 'შიგნით — კრევეტის ტემპურა, თავზე — წვრილად დაჭრილი ავოკადო და გველთევზას საწებელი.',
        ru: 'Темпура с креветкой внутри, тонко нарезанный авокадо и соус унаги сверху.' } },
    { category: 'rolls', price: '$13.5', tags: [],
      name: { en: 'Rainbow Roll', ka: 'ცისარტყელას როლი', ru: 'Ролл «Радуга»' },
      desc: { en: 'California roll topped with assorted fresh sashimi and avocado.',
        ka: 'კალიფორნია როლი დაფარული სხვადასხვა ახალი საშიმითა და ავოკადოთი.',
        ru: 'Калифорния-ролл, покрытый ассорти из свежих сашими и авокадо.' } },
    { category: 'rolls', price: '$11.0', tags: ['spicy'],
      name: { en: 'Spicy Tuna Roll', ka: 'ცხარე თინუსის როლი', ru: 'Острый ролл с тунцом' },
      desc: { en: 'Fresh tuna, scallion and sriracha mayo, rolled in toasted sesame.',
        ka: 'ახალი თინუსი, მწვანე ხახვი და შრირაჩა-მაიონეზი, გახვეული შემწვარ სეზამში.',
        ru: 'Свежий тунец, зелёный лук и соус сирача-майо, в панировке из обжаренного кунжута.' } },
    { category: 'rolls', price: '$9.5', tags: ['veg'],
      name: { en: 'Vegetable Garden Roll', ka: 'ბოსტნეულის როლი', ru: 'Овощной ролл' },
      desc: { en: 'Cucumber, avocado, carrot, asparagus and pickled radish.',
        ka: 'კიტრი, ავოკადო, სტაფილო, ასპარაგუსი და მწნილი ბოლოკი.',
        ru: 'Огурец, авокадо, морковь, спаржа и маринованный редис.' } },
    { category: 'rolls', price: '$15.0', tags: ['new'],
      name: { en: 'Tbilisi Roll', ka: 'თბილისის როლი', ru: 'Ролл «Тбилиси»' },
      desc: { en: 'Grilled eel, cream cheese and cucumber, wrapped in soy paper with gold flake.',
        ka: 'შემწვარი გველთევზა, კრემ-ჩიზი და კიტრი, გახვეული სოიის ქაღალდში ოქროს ფურცლით.',
        ru: 'Жареный угорь, сливочный сыр и огурец, завёрнутые в соевую бумагу с золотой фольгой.' } },

    // Nigiri & Sashimi
    { category: 'nigiri', price: '$6.5', tags: [],
      name: { en: 'Salmon Nigiri (2pc)', ka: 'ორაგულის ნიგირი (2ც)', ru: 'Нигири с лососем (2 шт)' },
      desc: { en: 'Hand-pressed rice topped with fresh Norwegian salmon.',
        ka: 'ხელით ჩამოსხმული ბრინჯი ახალი ნორვეგიული ორაგულით.',
        ru: 'Рис ручной лепки со свежим норвежским лососем.' } },
    { category: 'nigiri', price: '$7.0', tags: [],
      name: { en: 'Tuna Nigiri (2pc)', ka: 'თინუსის ნიგირი (2ც)', ru: 'Нигири с тунцом (2 шт)' },
      desc: { en: 'Bluefin tuna over seasoned sushi rice.',
        ka: 'ლურჯფარფლიანი თინუსი შეკმაზული სუშის ბრინჯზე.',
        ru: 'Голубой тунец на заправленном рисе для суши.' } },
    { category: 'nigiri', price: '$7.5', tags: [],
      name: { en: 'Eel Nigiri (2pc)', ka: 'გველთევზას ნიგირი (2ც)', ru: 'Нигири с угрём (2 шт)' },
      desc: { en: 'Grilled freshwater eel glazed with sweet unagi sauce.',
        ka: 'შემწვარი მტკნარი წყლის გველთევზა, დაფარული ტკბილი უნაგის საწებლით.',
        ru: 'Жареный пресноводный угорь, глазированный сладким соусом унаги.' } },
    { category: 'nigiri', price: '$14.0', tags: [],
      name: { en: 'Salmon Sashimi (6pc)', ka: 'ორაგულის საშიმი (6ც)', ru: 'Сашими из лосося (6 шт)' },
      desc: { en: 'Thick-cut, buttery salmon served chilled.',
        ka: 'სქლად დაჭრილი, ნაზი ორაგული, მიირთმევა გაცივებული.',
        ru: 'Толсто нарезанный нежный лосось, подаётся охлаждённым.' } },
    { category: 'nigiri', price: '$26.0', tags: ['new'],
      name: { en: "Chef's Sashimi Platter", ka: 'შეფის საშიმის თეფში', ru: 'Тарелка сашими от шефа' },
      desc: { en: "Chef's daily selection of the freshest catch, 15 pieces.",
        ka: 'შეფ-მზარეულის დღიური არჩევანი უახლესი დაჭერილი თევზისგან, 15 ნაჭერი.',
        ru: 'Ежедневный выбор шефа из самого свежего улова, 15 кусочков.' } },

    // Tempura & Hot Dishes
    { category: 'tempura', price: '$12.0', tags: [],
      name: { en: 'Shrimp Tempura', ka: 'კრევეტის ტემპურა', ru: 'Темпура с креветками' },
      desc: { en: 'Five hand-battered shrimp, crisp-fried, served with tentsuyu dip.',
        ka: 'ხუთი ხელით ცომში ამოვლებული კრევეტი, გახრწნილებული, მიირთმევა ტენცუიუს საწებელთან ერთად.',
        ru: 'Пять креветок в кляре собственного приготовления, хрустящей обжарки, подаются с соусом тэнцую.' } },
    { category: 'tempura', price: '$9.0', tags: ['veg'],
      name: { en: 'Vegetable Tempura', ka: 'ბოსტნეულის ტემპურა', ru: 'Овощная темпура' },
      desc: { en: 'Seasonal vegetables in a light, crackling tempura batter.',
        ka: 'სეზონური ბოსტნეული მსუბუქ, ხრაშუნა ტემპურას ცომში.',
        ru: 'Сезонные овощи в лёгком, хрустящем кляре темпура.' } },
    { category: 'tempura', price: '$13.5', tags: [],
      name: { en: 'Chicken Katsu', ka: 'ქათმის კაცუ', ru: 'Куриное кацу' },
      desc: { en: 'Crispy panko-breaded chicken thigh with tonkatsu sauce and cabbage.',
        ka: 'ხრაშუნა პანკოში დაცურცლილი ქათმის ბარკალი ტონკაცუს საწებელითა და კომბოსტოთი.',
        ru: 'Хрустящее куриное бедро в панко с соусом тонкацу и капустой.' } },
    { category: 'tempura', price: '$22.0', tags: ['new'],
      name: { en: 'Miso Grilled Black Cod', ka: 'მისოში შემწვარი შავი ტრესკა', ru: 'Чёрная треска на гриле с мисо' },
      desc: { en: 'Marinated 48 hours in sweet miso, char-grilled to order.',
        ka: '48 საათი დამარინადებული ტკბილ მისოში, შეკვეთისამებრ შემწვარი ცეცხლზე.',
        ru: 'Маринуется 48 часов в сладком мисо, готовится на углях по заказу.' } },
    { category: 'tempura', price: '$11.5', tags: ['spicy', 'veg'],
      name: { en: 'Spicy Garlic Udon', ka: 'ცხარე ნიორის უდონი', ru: 'Острая удон с чесноком' },
      desc: { en: 'Thick wheat noodles stir-fried with garlic, chili oil and scallion.',
        ka: 'სქელი ხორბლის ატრია შემწვარი ნიორით, ცხარე ზეთითა და მწვანე ხახვით.',
        ru: 'Толстая пшеничная лапша, обжаренная с чесноком, острым маслом и зелёным луком.' } },

    // Starters & Salads
    { category: 'starters', price: '$5.0', tags: ['veg'],
      name: { en: 'Edamame', ka: 'ედამამე', ru: 'Эдамаме' },
      desc: { en: 'Steamed soybeans finished with sea salt.',
        ka: 'ორთქლზე მომზადებული სოიოს ლობიო, შემწვარი ზღვის მარილით.',
        ru: 'Соевые бобы на пару с морской солью.' } },
    { category: 'starters', price: '$4.0', tags: ['veg'],
      name: { en: 'Miso Soup', ka: 'მისო სუპი', ru: 'Суп мисо' },
      desc: { en: 'Traditional soybean broth with tofu, wakame and scallion.',
        ka: 'ტრადიციული სოიოს ბულიონი ტოფუთი, ვაკამეთი და მწვანე ხახვით.',
        ru: 'Традиционный соевый бульон с тофу, вакаме и зелёным луком.' } },
    { category: 'starters', price: '$6.5', tags: ['veg'],
      name: { en: 'Seaweed Salad', ka: 'ზღვის მცენარეების სალათი', ru: 'Салат из водорослей' },
      desc: { en: 'Marinated wakame with sesame and a citrus dressing.',
        ka: 'დამარინადებული ვაკამე სეზამითა და ციტრუსის სოუსით.',
        ru: 'Маринованное вакаме с кунжутом и цитрусовой заправкой.' } },
    { category: 'starters', price: '$12.5', tags: ['spicy'],
      name: { en: 'Spicy Tuna Tartare', ka: 'ცხარე თინუსის ტარტარი', ru: 'Острый тартар из тунца' },
      desc: { en: 'Diced tuna, avocado, chili and citrus soy over crispy wonton.',
        ka: 'დაკუბებული თინუსი, ავოკადო, ჩილი და ციტრუს-სოიო ხრაშუნა ვონტონზე.',
        ru: 'Тунец кубиками, авокадо, чили и цитрусовый соевый соус на хрустящем вонтоне.' } },
    { category: 'starters', price: '$8.5', tags: [],
      name: { en: 'Gyoza (5pc)', ka: 'გიოზა (5ც)', ru: 'Гёдза (5 шт)' },
      desc: { en: 'Pan-seared pork dumplings with a ginger soy dip.',
        ka: 'შემწვარი ღორის ხინკლები, გვერდით ჯანჯაფილ-სოიოს საწებელი.',
        ru: 'Обжаренные свиные пельмени с имбирно-соевым соусом.' } },

    // Drinks
    { category: 'drinks', price: '$3.5', tags: ['veg'],
      name: { en: 'Sencha Green Tea', ka: 'სენჩა მწვანე ჩაი', ru: 'Зелёный чай сенча' },
      desc: { en: 'Steamed Japanese green tea, served hot or iced.',
        ka: 'ორთქლდამუშავებული იაპონური მწვანე ჩაი, მიირთმევა ცხელი ან ცივი.',
        ru: 'Японский зелёный чай на пару, подаётся горячим или со льдом.' } },
    { category: 'drinks', price: '$9.0', tags: [],
      name: { en: 'Nami Signature Sake', ka: 'ნამის საფირმო საკე', ru: 'Фирменное саке NAMI' },
      desc: { en: 'Premium junmai sake, served warm or chilled.',
        ka: 'პრემიუმ კლასის ჯუნმაი საკე, მიირთმევა თბილი ან გაცივებული.',
        ru: 'Премиальное саке дзюммай, подаётся тёплым или охлаждённым.' } },
    { category: 'drinks', price: '$8.5', tags: ['new'],
      name: { en: 'Yuzu Sour', ka: 'იუძუ საური', ru: 'Юдзу Сауэр' },
      desc: { en: 'Shochu, fresh yuzu juice and soda over ice.',
        ka: 'შოჩუ, ახალი იუძუს წვენი და სოდა ყინულზე.',
        ru: 'Сётю, свежий сок юдзу и содовая со льдом.' } },
    { category: 'drinks', price: '$7.0', tags: [],
      name: { en: 'Georgian Saperavi (glass)', ka: 'საფერავი (ჭიქა)', ru: 'Саперави (бокал)' },
      desc: { en: 'Full-bodied local red wine, a house favorite pairing.',
        ka: 'მდიდარი ადგილობრივი წითელი ღვინო, სახლის საყვარელი შერჩევა.',
        ru: 'Насыщенное местное красное вино — любимое сочетание нашего дома.' } },
    { category: 'drinks', price: '$3.0', tags: ['veg'],
      name: { en: 'Sparkling Water', ka: 'გაზიანი წყალი', ru: 'Газированная вода' },
      desc: { en: 'Borjomi natural mineral water.',
        ka: 'ბორჯომის ბუნებრივი მინერალური წყალი.',
        ru: 'Натуральная минеральная вода «Боржоми».' } },

    // Desserts
    { category: 'desserts', price: '$7.5', tags: [],
      name: { en: 'Matcha Cheesecake', ka: 'მაჩა ჩიზქეიქი', ru: 'Чизкейк с матча' },
      desc: { en: 'Silky cheesecake infused with ceremonial-grade matcha.',
        ka: 'აბრეშუმისებრი ჩიზქეიქი, გაჯერებული საზეიმო ხარისხის მაჩათი.',
        ru: 'Нежный чизкейк с церемониальным матча.' } },
    { category: 'desserts', price: '$6.5', tags: ['veg'],
      name: { en: 'Mochi Trio', ka: 'მოჩის ტრიო', ru: 'Трио моти' },
      desc: { en: 'Three flavors of chewy mochi: mango, red bean and black sesame.',
        ka: 'სამი გემოს რბილი მოჩი: მანგო, წითელი ლობიო და შავი სეზამი.',
        ru: 'Три вкуса мягкого моти: манго, красная фасоль и чёрный кунжут.' } },
    { category: 'desserts', price: '$6.0', tags: ['new'],
      name: { en: 'Tempura Banana', ka: 'ბანანის ტემპურა', ru: 'Банан темпура' },
      desc: { en: 'Crisp-fried banana with vanilla ice cream and honey drizzle.',
        ka: 'ხრაშუნად შემწვარი ბანანი ვანილის ნაყინითა და თაფლის საწებელით.',
        ru: 'Хрустящий жареный банан с ванильным мороженым и медовой заправкой.' } },
  ];

  const BLOG_POSTS = [
    {
      icon: '🍣',
      gradient: 'linear-gradient(135deg,#4f7a5c,#ddc98d)',
      date: { en: 'Aug 12, 2026', ka: '12 აგვისტო, 2026', ru: '12 августа 2026' },
      tag: { en: 'News', ka: 'სიახლე', ru: 'Новости' },
      title: { en: 'NAMI Opens Its Doors on Rustaveli Avenue', ka: '„ნამი“ იხსნის კარებს რუსთაველის გამზირზე', ru: 'NAMI открывает двери на проспекте Руставели' },
      excerpt: {
        en: 'We are thrilled to welcome you to our new home in the heart of Tbilisi — come see the space and taste the opening menu.',
        ka: 'სიხარულით გიწვევთ ჩვენს ახალ სახლში — მოდით, იხილეთ სივრცე და გაასინჯეთ გახსნის მენიუ.',
        ru: 'Мы рады приветствовать вас в нашем новом доме в самом сердце Тбилиси — приходите увидеть пространство и попробовать открытие меню.',
      },
    },
    {
      icon: '🐟',
      gradient: 'linear-gradient(135deg,#2c4436,#93bb9e)',
      date: { en: 'Aug 28, 2026', ka: '28 აგვისტო, 2026', ru: '28 августа 2026' },
      tag: { en: 'Behind the Scenes', ka: 'კულისებს მიღმა', ru: 'За кулисами' },
      title: { en: 'How We Source Our Fish, Daily', ka: 'როგორ ვირჩევთ თევზს ყოველდღიურად', ru: 'Как мы ежедневно выбираем рыбу' },
      excerpt: {
        en: 'A look at our early-morning market runs and the relationships with suppliers that keep every plate honest and fresh.',
        ka: 'მოკლე მიმოხილვა დილაადრიანი ბაზრობებისა და მომწოდებლებთან ურთიერთობისა, რაც ყოველ კერძს პატიოსანსა და ახალს ხდის.',
        ru: 'Взгляд на наши ранние поездки на рынок и отношения с поставщиками, которые делают каждое блюдо честным и свежим.',
      },
    },
    {
      icon: '🍶',
      gradient: 'linear-gradient(135deg,#11241c,#4f7a5c)',
      date: { en: 'Sep 2, 2026', ka: '2 სექტემბერი, 2026', ru: '2 сентября 2026' },
      tag: { en: 'Guide', ka: 'გზამკვლევი', ru: 'Гид' },
      title: { en: "A Beginner's Guide to Sake Pairing", ka: 'დამწყებთათვის: საკეს შერჩევის გზამკვლევი', ru: 'Гид для начинающих по подбору саке' },
      excerpt: {
        en: 'Not sure what to order? Our head chef breaks down which sake styles go with which rolls — and why it matters.',
        ka: 'არ იცით რა შეუკვეთოთ? ჩვენი შეფ-მზარეული განმარტავს, რომელი საკე რომელ როლს უხდება და რატომ აქვს ამას მნიშვნელობა.',
        ru: 'Не знаете, что заказать? Наш шеф-повар объясняет, какое саке подходит к каким роллам — и почему это важно.',
      },
    },
    {
      icon: '🌶️',
      gradient: 'linear-gradient(135deg,#a8342a,#b7a369)',
      date: { en: 'Sep 10, 2026', ka: '10 სექტემბერი, 2026', ru: '10 сентября 2026' },
      tag: { en: 'Menu Update', ka: 'მენიუს განახლება', ru: 'Обновление меню' },
      title: { en: 'Introducing the Tbilisi Roll', ka: 'წარმოგიდგენთ თბილისის როლს', ru: 'Представляем ролл «Тбилиси»' },
      excerpt: {
        en: 'Our newest signature roll blends grilled eel and gold leaf — a tribute to the city we now call home.',
        ka: 'ჩვენი უახლესი საფირმო როლი აერთიანებს შემწვარ გველთევზასა და ოქროს ფურცელს — მოგონება ქალაქზე, რომელიც ჩვენთვის სახლად იქცა.',
        ru: 'Наш новый фирменный ролл сочетает жареного угря и золотую фольгу — дань городу, который стал нам домом.',
      },
    },
    {
      icon: '🎉',
      gradient: 'linear-gradient(135deg,#11241c,#93bb9e)',
      date: { en: 'Sep 20, 2026', ka: '20 სექტემბერი, 2026', ru: '20 сентября 2026' },
      tag: { en: 'Events', ka: 'ღონისძიებები', ru: 'События' },
      title: { en: 'Join Us for a Sushi-Rolling Workshop', ka: 'შემოგვიერთდით სუშის გახვევის შემოქმედებით საღამოზე', ru: 'Приходите на мастер-класс по скручиванию суши' },
      excerpt: {
        en: 'Learn knife skills and rolling technique from our chefs in a hands-on evening class. Limited seats available.',
        ka: 'ისწავლეთ დანით მუშაობისა და გახვევის ტექნიკა ჩვენი შეფ-მზარეულებისგან პრაქტიკულ საღამოზე. ადგილების რაოდენობა შეზღუდულია.',
        ru: 'Изучите технику владения ножом и скручивания роллов у наших шеф-поваров на практическом вечернем занятии. Количество мест ограничено.',
      },
    },
    {
      icon: '🍵',
      gradient: 'linear-gradient(135deg,#b7a369,#11241c)',
      date: { en: 'Sep 27, 2026', ka: '27 სექტემბერი, 2026', ru: '27 сентября 2026' },
      tag: { en: 'Culture', ka: 'კულტურა', ru: 'Культура' },
      title: { en: 'The Meaning Behind "Nami"', ka: 'რას ნიშნავს „ნამი“', ru: 'Что означает «Нами»' },
      excerpt: {
        en: 'In Georgian, ნამი means "dew" — in Japanese, 波 means "wave." Here\'s the story behind our name.',
        ka: 'ქართულად ნამი ნიშნავს „ცვარს“, იაპონურად 波 კი — „ტალღას“. აი ასეთია ჩვენი სახელის ისტორია.',
        ru: 'По-грузински «нами» значит «роса», а по-японски 波 — «волна». Вот история нашего названия.',
      },
    },
  ];

  /* ---------------------------------------------------------
     Menu rendering + filtering
  --------------------------------------------------------- */
  const menuGrid = document.getElementById('menuGrid');
  const menuTabs = document.getElementById('menuTabs');
  let currentCategory = 'all';

  function renderMenu(category) {
    currentCategory = category;
    const items = category === 'all'
      ? MENU_ITEMS
      : MENU_ITEMS.filter(item => item.category === category);

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

      card.innerHTML = `
        <div class="menu-item-top">
          <h3 class="menu-item-name">${name}</h3>
          <span class="menu-item-price">${item.price}</span>
        </div>
        <p class="menu-item-desc">${desc}</p>
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

  /* ---------------------------------------------------------
     Blog rendering
  --------------------------------------------------------- */
  const blogGrid = document.getElementById('blogGrid');

  function renderBlog() {
    blogGrid.innerHTML = BLOG_POSTS.map(post => {
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
          <a href="#" class="blog-readmore" data-title="${title}">${t('blog_readmore')}</a>
        </div>
      </article>
    `;
    }).join('');
  }

  blogGrid.addEventListener('click', (e) => {
    const link = e.target.closest('.blog-readmore');
    if (!link) return;
    e.preventDefault();
    alert(`"${link.dataset.title}"\n\n${t('blog_alert')}`);
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
    items.forEach(li => {
      const isToday = li.dataset.day === todayName;
      li.classList.toggle('today', isToday);
      if (isToday) todayRangeText = li.children[1].textContent.trim();
    });

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
  renderMenu('all');
  renderBlog();
  updateHours();
  renderFooterCopy();

})();
