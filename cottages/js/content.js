/* Pitsruli — default site content and shared helpers.
   The site shows this content until the Supabase table has a saved copy;
   the admin panel starts from it on first save. */
(function () {
  var DEFAULT = {
  "version": 1,
  "contact": {
    "phone": "+995 5XX XX XX XX",
    "email": "info@pitsruli.ge"
  },
  "models": [
    {
      "code": "36",
      "shape": "aframe",
      "area": 36,
      "days": 30,
      "price": 89000,
      "beds": {
        "ka": "1 + მანსარდა",
        "en": "1 + loft",
        "ru": "1 + мансарда"
      },
      "tag": {
        "ka": "A-ფრეიმი",
        "en": "A-frame",
        "ru": "A-фрейм"
      },
      "desc": {
        "ka": "იდეალური პირველი კოტეჯი ან გასაქირავებელი სახლი",
        "en": "A perfect first cottage or rental home",
        "ru": "Идеальный первый коттедж или дом для аренды"
      }
    },
    {
      "code": "58",
      "shape": "gable",
      "area": 58,
      "days": 40,
      "price": 139000,
      "beds": {
        "ka": "2",
        "en": "2",
        "ru": "2"
      },
      "tag": {
        "ka": "ორფერდა",
        "en": "Gable roof",
        "ru": "Двускатный"
      },
      "desc": {
        "ka": "წყვილისთვის ან პატარა ოჯახისთვის",
        "en": "For a couple or a small family",
        "ru": "Для пары или небольшой семьи"
      }
    },
    {
      "code": "84",
      "shape": "terrace",
      "area": 84,
      "days": 50,
      "price": 198000,
      "beds": {
        "ka": "3",
        "en": "3",
        "ru": "3"
      },
      "tag": {
        "ka": "ტერასით",
        "en": "With terrace",
        "ru": "С террасой"
      },
      "desc": {
        "ka": "დიდი ღია ტერასა და მისაღები ბუხრით",
        "en": "A large open terrace and a living room with a fireplace",
        "ru": "Большая открытая терраса и гостиная с камином"
      }
    },
    {
      "code": "120",
      "shape": "family",
      "area": 120,
      "days": 60,
      "price": 279000,
      "beds": {
        "ka": "4",
        "en": "4",
        "ru": "4"
      },
      "tag": {
        "ka": "საოჯახო · 2 სართული",
        "en": "Family · 2 floors",
        "ru": "Семейный · 2 этажа"
      },
      "desc": {
        "ka": "მუდმივი საცხოვრებლისთვის, წლის ნებისმიერ დროს",
        "en": "For year-round living",
        "ru": "Для постоянного проживания круглый год"
      }
    }
  ],
  "texts": {
    "brand.name": {
      "ka": "ფიცრული",
      "en": "Pitsruli",
      "ru": "Пицрули"
    },
    "brand.sub": {
      "ka": "COTTAGES",
      "en": "WOODEN COTTAGES",
      "ru": "ДЕРЕВЯННЫЕ КОТТЕДЖИ"
    },
    "nav.models": {
      "ka": "მოდელები",
      "en": "Models",
      "ru": "Модели"
    },
    "nav.process": {
      "ka": "როგორ ვაშენებთ",
      "en": "How we build",
      "ru": "Как мы строим"
    },
    "nav.regions": {
      "ka": "სად ვაშენებთ",
      "en": "Where we build",
      "ru": "Где мы строим"
    },
    "nav.materials": {
      "ka": "მასალები",
      "en": "Materials",
      "ru": "Материалы"
    },
    "cta.consult": {
      "ka": "კონსულტაცია",
      "en": "Consultation",
      "ru": "Консультация"
    },
    "hero.eyebrow": {
      "ka": "ხის კოტეჯები · მთელი საქართველო",
      "en": "Wooden cottages · All of Georgia",
      "ru": "Деревянные коттеджи · Вся Грузия"
    },
    "hero.title": {
      "ka": "ვაშენებთ სახლს იქ, სადაც გული გეძახის",
      "en": "We build homes where your heart belongs",
      "ru": "Строим дом там, куда зовёт сердце"
    },
    "hero.lead": {
      "ka": "ვაპროექტებთ და ვაშენებთ ხის კოტეჯებს ყაზბეგიდან ზღვისპირამდე. ერთი გუნდი, ერთი ხელშეკრულება, ფიქსირებული ფასი და ვადა. თქვენ იღებთ გასაღებს.",
      "en": "We design and build wooden cottages from Kazbegi to the Black Sea coast. One team, one contract, a fixed price and timeline. You get the keys.",
      "ru": "Проектируем и строим деревянные коттеджи от Казбеги до морского побережья. Одна команда, один договор, фиксированные цена и сроки. Вы получаете ключи."
    },
    "hero.btn1": {
      "ka": "მოდელების ნახვა",
      "en": "See the models",
      "ru": "Смотреть модели"
    },
    "hero.btn2": {
      "ka": "უფასო კონსულტაცია",
      "en": "Free consultation",
      "ru": "Бесплатная консультация"
    },
    "f1.dd": {
      "ka": "დღე მშენებლობის დაწყებიდან ჩაბარებამდე",
      "en": "days from the start of construction to handover",
      "ru": "дней от начала строительства до сдачи"
    },
    "f2.dt": {
      "ka": "9 ბალი",
      "en": "9 points",
      "ru": "9 баллов"
    },
    "f2.dd": {
      "ka": "მიწისძვრა, რომელსაც კარკასი უძლებს",
      "en": "earthquake intensity the frame withstands",
      "ru": "землетрясение, которое выдерживает каркас"
    },
    "f3.dt": {
      "ka": "10 წელი",
      "en": "10 years",
      "ru": "10 лет"
    },
    "f3.dd": {
      "ka": "გარანტია კონსტრუქციაზე",
      "en": "structural warranty",
      "ru": "гарантия на конструкцию"
    },
    "models.title": {
      "ka": "ოთხი მზა პროექტი. თითოეულს თქვენს ნაკვეთს მოვარგებთ",
      "en": "Four ready-made designs, each adapted to your plot",
      "ru": "Четыре готовых проекта. Каждый адаптируем под ваш участок"
    },
    "models.lead": {
      "ka": "ყველა მოდელი იცვლება: ტერასა, მანსარდა, ბუხარი, საუნა, ფასადის მასალა. ინდივიდუალურ პროექტსაც ვაკეთებთ.",
      "en": "Every model can be changed: terrace, loft, fireplace, sauna, facade material. We also do custom designs.",
      "ru": "Любую модель можно изменить: терраса, мансарда, камин, сауна, материал фасада. Делаем и индивидуальные проекты."
    },
    "spec.area": {
      "ka": "ფართი",
      "en": "Area",
      "ru": "Площадь"
    },
    "spec.beds": {
      "ka": "საძინებელი",
      "en": "Bedrooms",
      "ru": "Спальни"
    },
    "spec.build": {
      "ka": "მშენებლობა",
      "en": "Construction",
      "ru": "Строительство"
    },
    "models.note": {
      "ka": "ფასი საორიენტაციოა და მოიცავს მშენებლობას „გასაღები ხელში“ საძირკვლის ჩათვლით. ზუსტი ღირებულება დამოკიდებულია ნაკვეთზე, რეგიონზე და მისასვლელ გზაზე.",
      "en": "Prices are indicative and include turnkey construction with the foundation. The exact cost depends on the plot, the region and the access road.",
      "ru": "Цены ориентировочные и включают строительство под ключ с фундаментом. Точная стоимость зависит от участка, региона и подъездной дороги."
    },
    "process.title": {
      "ka": "პირველი ზარიდან გასაღებამდე, ხუთ ეტაპად",
      "en": "From the first call to the keys, in five steps",
      "ru": "От первого звонка до ключей за пять этапов"
    },
    "s1.h": {
      "ka": "კონსულტაცია",
      "en": "Consultation",
      "ru": "Консультация"
    },
    "s1.p": {
      "ka": "ვსაუბრობთ თქვენს იდეაზე, ბიუჯეტზე და ვადაზე. ვაფასებთ ნაკვეთს ადგილზე.",
      "en": "We discuss your idea, budget and timeline, and assess the plot on site.",
      "ru": "Обсуждаем вашу идею, бюджет и сроки. Оцениваем участок на месте."
    },
    "s2.h": {
      "ka": "პროექტი და ნებართვა",
      "en": "Design and permit",
      "ru": "Проект и разрешение"
    },
    "s2.p": {
      "ka": "ვამზადებთ არქიტექტურულ და კონსტრუქციულ პროექტს, ვიღებთ მშენებლობის ნებართვას.",
      "en": "We prepare the architectural and structural design and obtain the building permit.",
      "ru": "Готовим архитектурный и конструктивный проект, получаем разрешение на строительство."
    },
    "s3.h": {
      "ka": "წარმოება",
      "en": "Production",
      "ru": "Производство"
    },
    "s3.p": {
      "ka": "კარკასის პანელებს ვამზადებთ საამქროში, ამიტომ ამინდი ხარისხზე არ მოქმედებს.",
      "en": "We make the frame panels in our workshop, so the weather doesn’t affect quality.",
      "ru": "Каркасные панели изготавливаем в цеху, поэтому погода не влияет на качество."
    },
    "s4.h": {
      "ka": "მშენებლობა ადგილზე",
      "en": "On-site construction",
      "ru": "Строительство на участке"
    },
    "s4.p": {
      "ka": "საძირკველი, აწყობა, სახურავი, კომუნიკაციები და მოპირკეთება. ყოველ კვირას გიგზავნით ფოტოანგარიშს.",
      "en": "Foundation, assembly, roof, utilities and finishing. Every week we send you a photo report.",
      "ru": "Фундамент, сборка, кровля, коммуникации и отделка. Каждую неделю присылаем фотоотчёт."
    },
    "s5.h": {
      "ka": "ჩაბარება",
      "en": "Handover",
      "ru": "Сдача"
    },
    "s5.p": {
      "ka": "ერთად ვამოწმებთ ყველა დეტალს და გადმოგცემთ გასაღებს, ტექნიკურ პასპორტს და გარანტიას.",
      "en": "We check every detail together and hand over the keys, the technical passport and the warranty.",
      "ru": "Вместе проверяем каждую деталь и передаём ключи, технический паспорт и гарантию."
    },
    "regions.title": {
      "ka": "მთელ საქართველოში, ყოველი კუთხის კლიმატის გათვალისწინებით",
      "en": "All over Georgia, adapted to each region’s climate",
      "ru": "По всей Грузии, с учётом климата каждого региона"
    },
    "regions.lead": {
      "ka": "2000 მეტრზე სახლი სხვა სახურავს და სხვა იზოლაციას საჭიროებს, ვიდრე ზღვასთან. ამიტომ ყველა პროექტს ერთ-ერთ კლიმატურ პაკეტს ვურგებთ.",
      "en": "A house at 2,000 metres needs a different roof and insulation than one by the sea. That’s why every design gets one of three climate packages.",
      "ru": "Дому на высоте 2000 метров нужны другие кровля и утепление, чем у моря. Поэтому каждый проект получает один из трёх климатических пакетов."
    },
    "pkg1.h": {
      "ka": "ალპური",
      "en": "Alpine",
      "ru": "Альпийский"
    },
    "pkg1.p": {
      "ka": "1500 მ-ზე მაღლა. გაძლიერებული სახურავი დიდი თოვლისთვის, 250 მმ იზოლაცია, სამმაგი მინაპაკეტი.",
      "en": "Above 1,500 m. Reinforced roof for heavy snow, 250 mm insulation, triple glazing.",
      "ru": "Выше 1500 м. Усиленная кровля под большой снег, утепление 250 мм, тройной стеклопакет."
    },
    "pkg2.h": {
      "ka": "მთის",
      "en": "Mountain",
      "ru": "Горный"
    },
    "pkg2.p": {
      "ka": "500–1500 მ. 200 მმ იზოლაცია, ბუხარი ან თბური ტუმბო, ქარისგან დაცული ტერასა.",
      "en": "500–1,500 m. 200 mm insulation, a fireplace or heat pump, a wind-sheltered terrace.",
      "ru": "500–1500 м. Утепление 200 мм, камин или тепловой насос, защищённая от ветра терраса."
    },
    "pkg3.h": {
      "ka": "ბარის და ზღვისპირა",
      "en": "Lowland and coastal",
      "ru": "Равнинный и прибрежный"
    },
    "pkg3.p": {
      "ka": "500 მ-მდე. ტენისგან დაცვა, ვენტილირებადი ფასადი, მზისგან დამჩრდილავი ფარდულები.",
      "en": "Below 500 m. Moisture protection, a ventilated facade, sun-shading canopies.",
      "ru": "До 500 м. Защита от влаги, вентилируемый фасад, навесы от солнца."
    },
    "materials.title": {
      "ka": "რისგან ვაშენებთ",
      "en": "What we build with",
      "ru": "Из чего мы строим"
    },
    "materials.lead": {
      "ka": "ვიყენებთ გამოცდილ მასალებს, რომლებიც კოტეჯს თბილს, მშრალს და მყარს ხდის ათწლეულების განმავლობაში.",
      "en": "We use proven materials that keep a cottage warm, dry and solid for decades.",
      "ru": "Используем проверенные материалы, благодаря которым коттедж остаётся тёплым, сухим и прочным десятилетиями."
    },
    "mat1.dt": {
      "ka": "კარკასი",
      "en": "Frame",
      "ru": "Каркас"
    },
    "mat1.b": {
      "ka": "საშრობში გამომშრალი ფიჭვი C24",
      "en": "Kiln-dried pine, grade C24",
      "ru": "Сосна камерной сушки C24"
    },
    "mat1.s": {
      "ka": "ანტისეპტიკით და ცეცხლდამცავით დამუშავებული",
      "en": "Treated with antiseptic and fire retardant",
      "ru": "Обработана антисептиком и антипиреном"
    },
    "mat2.dt": {
      "ka": "საძირკველი",
      "en": "Foundation",
      "ru": "Фундамент"
    },
    "mat2.b": {
      "ka": "ხრახნიანი ხიმინჯი ან ფილა",
      "en": "Screw piles or a slab",
      "ru": "Винтовые сваи или плита"
    },
    "mat2.s": {
      "ka": "ვარჩევთ ნიადაგისა და ფერდობის მიხედვით",
      "en": "Chosen according to the soil and slope",
      "ru": "Выбираем по грунту и уклону"
    },
    "mat3.dt": {
      "ka": "თბოიზოლაცია",
      "en": "Insulation",
      "ru": "Утепление"
    },
    "mat3.b": {
      "ka": "მინერალური ბამბა 200–250 მმ",
      "en": "Mineral wool, 200–250 mm",
      "ru": "Минеральная вата 200–250 мм"
    },
    "mat3.s": {
      "ka": "ორთქლ- და ქარდამცავი მემბრანებით",
      "en": "With vapour and wind barrier membranes",
      "ru": "С пароизоляционной и ветрозащитной мембранами"
    },
    "mat4.dt": {
      "ka": "ფანჯრები",
      "en": "Windows",
      "ru": "Окна"
    },
    "mat4.b": {
      "ka": "ორმაგი ან სამმაგი მინაპაკეტი",
      "en": "Double or triple glazing",
      "ru": "Двойной или тройной стеклопакет"
    },
    "mat4.s": {
      "ka": "ხის ან ალუმინის ჩარჩოთი",
      "en": "Wooden or aluminium frames",
      "ru": "С деревянной или алюминиевой рамой"
    },
    "mat5.dt": {
      "ka": "სახურავი",
      "en": "Roof",
      "ru": "Кровля"
    },
    "mat5.b": {
      "ka": "ლითონის სახურავი ან რბილი კრამიტი",
      "en": "Metal roofing or soft shingles",
      "ru": "Металлочерепица или мягкая черепица"
    },
    "mat5.s": {
      "ka": "თოვლის შემაკავებლებით მთის რეგიონებში",
      "en": "With snow guards in mountain regions",
      "ru": "Со снегозадержателями в горных регионах"
    },
    "mat6.dt": {
      "ka": "ფასადი",
      "en": "Facade",
      "ru": "Фасад"
    },
    "mat6.b": {
      "ka": "თერმოხე, დამწვარი ხე ან ბლოკჰაუსი",
      "en": "Thermowood, charred wood or block house",
      "ru": "Термодерево, обожжённое дерево или блок-хаус"
    },
    "mat6.s": {
      "ka": "ქარხნულად შეღებილი, დაცული მზისა და ტენისგან",
      "en": "Factory-painted, protected from sun and moisture",
      "ru": "Заводская покраска, защита от солнца и влаги"
    },
    "contact.eyebrow": {
      "ka": "კონტაქტი",
      "en": "Contact",
      "ru": "Контакты"
    },
    "contact.title": {
      "ka": "მოგვიყევით თქვენს სახლზე",
      "en": "Tell us about your home",
      "ru": "Расскажите о своём доме"
    },
    "contact.lead": {
      "ka": "დაგვიტოვეთ ნომერი და 24 საათში დაგირეკავთ. პირველი კონსულტაცია და ნაკვეთის შეფასება უფასოა.",
      "en": "Leave your number and we’ll call you within 24 hours. The first consultation and plot assessment are free.",
      "ru": "Оставьте номер, и мы перезвоним в течение 24 часов. Первая консультация и оценка участка бесплатны."
    },
    "form.phone": {
      "ka": "ტელეფონი",
      "en": "Phone",
      "ru": "Телефон"
    },
    "contact.email": {
      "ka": "ელფოსტა",
      "en": "Email",
      "ru": "Эл. почта"
    },
    "form.name": {
      "ka": "სახელი",
      "en": "Name",
      "ru": "Имя"
    },
    "form.model": {
      "ka": "მოდელი",
      "en": "Model",
      "ru": "Модель"
    },
    "opt.unsure": {
      "ka": "ჯერ არ ვიცი",
      "en": "Not sure yet",
      "ru": "Пока не знаю"
    },
    "opt.custom": {
      "ka": "ინდივიდუალური პროექტი",
      "en": "Custom design",
      "ru": "Индивидуальный проект"
    },
    "form.region": {
      "ka": "სად გაქვთ ნაკვეთი?",
      "en": "Where is your plot?",
      "ru": "Где ваш участок?"
    },
    "r.none": {
      "ka": "ჯერ არ მაქვს ნაკვეთი",
      "en": "I don’t have a plot yet",
      "ru": "Участка пока нет"
    },
    "r.mm": {
      "ka": "მცხეთა-მთიანეთი",
      "en": "Mtskheta-Mtianeti",
      "ru": "Мцхета-Мтианети"
    },
    "r.sj": {
      "ka": "სამცხე-ჯავახეთი",
      "en": "Samtskhe-Javakheti",
      "ru": "Самцхе-Джавахети"
    },
    "r.aj": {
      "ka": "აჭარა",
      "en": "Adjara",
      "ru": "Аджария"
    },
    "r.gu": {
      "ka": "გურია",
      "en": "Guria",
      "ru": "Гурия"
    },
    "r.sz": {
      "ka": "სამეგრელო-ზემო სვანეთი",
      "en": "Samegrelo-Zemo Svaneti",
      "ru": "Самегрело-Земо Сванети"
    },
    "r.rl": {
      "ka": "რაჭა-ლეჩხუმი",
      "en": "Racha-Lechkhumi",
      "ru": "Рача-Лечхуми"
    },
    "r.im": {
      "ka": "იმერეთი",
      "en": "Imereti",
      "ru": "Имерети"
    },
    "r.ka": {
      "ka": "კახეთი",
      "en": "Kakheti",
      "ru": "Кахети"
    },
    "r.sk": {
      "ka": "შიდა ქართლი",
      "en": "Shida Kartli",
      "ru": "Шида Картли"
    },
    "r.kk": {
      "ka": "ქვემო ქართლი",
      "en": "Kvemo Kartli",
      "ru": "Квемо Картли"
    },
    "r.tb": {
      "ka": "თბილისი",
      "en": "Tbilisi",
      "ru": "Тбилиси"
    },
    "form.msg": {
      "ka": "კომენტარი",
      "en": "Comment",
      "ru": "Комментарий"
    },
    "form.send": {
      "ka": "გაგზავნა",
      "en": "Send",
      "ru": "Отправить"
    },
    "footer.text": {
      "ka": "© 2026 ფიცრული · ხის კოტეჯების დაპროექტება და მშენებლობა",
      "en": "© 2026 Pitsruli · Wooden cottage design and construction",
      "ru": "© 2026 Пицрули · Проектирование и строительство деревянных коттеджей"
    },
    "footer.bb": {
      "ka": "ბრენდბუქი",
      "en": "Brand book",
      "ru": "Брендбук"
    },
    "form.name.ph": {
      "ka": "მაგ. ნინო",
      "en": "e.g. Nino",
      "ru": "например, Нино"
    },
    "form.msg.ph": {
      "ka": "მაგ. გვინდა 2 საძინებლიანი სახლი ბაკურიანში, 2027 წლის ზამთრამდე",
      "en": "e.g. We’d like a 2-bedroom house in Bakuriani before winter 2027",
      "ru": "например, хотим дом с 2 спальнями в Бакуриани до зимы 2027 года"
    },
    "brand.aria": {
      "ka": "ფიცრული — მთავარი",
      "en": "Pitsruli — home",
      "ru": "Пицрули — главная"
    },
    "nav.aria": {
      "ka": "მთავარი მენიუ",
      "en": "Main menu",
      "ru": "Главное меню"
    },
    "meta.title": {
      "ka": "ფიცრული — ხის კოტეჯები საქართველოში",
      "en": "Pitsruli — Wooden Cottages in Georgia",
      "ru": "Пицрули — деревянные коттеджи в Грузии"
    },
    "meta.desc": {
      "ka": "ფიცრული აპროექტებს და აშენებს ხის კოტეჯებს მთელ საქართველოში — ყაზბეგიდან ზღვისპირამდე. ერთი გუნდი, ერთი ხელშეკრულება, გასაღები ხელში.",
      "en": "Pitsruli designs and builds wooden cottages all over Georgia, from Kazbegi to the Black Sea coast. One team, one contract, turnkey.",
      "ru": "Пицрули проектирует и строит деревянные коттеджи по всей Грузии, от Казбеги до черноморского побережья. Одна команда, один договор, под ключ."
    },
    "form.err": {
      "ka": "გთხოვთ, მიუთითოთ სახელი და სრული ტელეფონის ნომერი.",
      "en": "Please enter your name and full phone number.",
      "ru": "Пожалуйста, укажите имя и полный номер телефона."
    },
    "form.ok": {
      "ka": "მადლობა, {name}! 24 საათში დაგირეკავთ ნომერზე {phone}.",
      "en": "Thank you, {name}! We’ll call you within 24 hours at {phone}.",
      "ru": "Спасибо, {name}! Мы перезвоним в течение 24 часов по номеру {phone}."
    },
    "f1.dt": {
      "ka": "30–60",
      "en": "30–60",
      "ru": "30–60"
    }
  }
};

  var SHAPES = {
    aframe:  { label: 'A-ფრეიმი', svg: '<path class="g" d="M10 112 H190"/><path class="r" d="M55 112 L100 20 L145 112"/><path class="w" d="M92 112 V96 a8 8 0 0 1 16 0 V112 Z"/>' },
    gable:   { label: 'ორფერდა', svg: '<path class="g" d="M10 112 H190"/><path class="r" d="M40 112 V62 L100 26 L160 62 V112"/><path class="w" d="M66 80 h20 v18 h-20 Z M114 80 h20 v18 h-20 Z"/>' },
    terrace: { label: 'ტერასით', svg: '<path class="g" d="M10 112 H190"/><path class="r" d="M24 112 V60 L80 28 L136 60 V112 M136 74 H184 V112"/><path class="w" d="M54 76 h22 v36 h-22 Z M150 86 h20 v14 h-20 Z"/>' },
    family:  { label: 'საოჯახო, 2 სართული', svg: '<path class="g" d="M10 112 H190"/><path class="r" d="M34 112 V54 L100 14 L166 54 V112 M34 80 H166"/><path class="w" d="M56 88 h18 v24 h-18 Z M92 88 h16 v24 h-16 Z M126 88 h18 v24 h-18 Z M90 50 h20 v18 h-20 Z"/>' }
  };

  function group(n, sep) { return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, sep); }
  function ruPlural(n, one, few, many) {
    var a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b === 1) return one;
    if (b > 1 && b < 5) return few;
    return many;
  }
  var FORMAT = {
    area:  function (n, lang) { return n + (lang === 'ru' ? ' м²' : lang === 'en' ? ' m²' : ' მ²'); },
    days:  function (n, lang) {
      if (lang === 'en') return n + (Number(n) === 1 ? ' day' : ' days');
      if (lang === 'ru') return n + ' ' + ruPlural(Number(n), 'день', 'дня', 'дней');
      return n + ' დღე';
    },
    price: function (n, lang) {
      if (lang === 'en') return 'from ₾' + group(n, ',');
      if (lang === 'ru') return 'от ' + group(n, '\u00A0') + ' ₾';
      return group(n, '\u00A0') + ' ₾-დან';
    }
  };

  window.PITSRULI = { DEFAULT: DEFAULT, SHAPES: SHAPES, FORMAT: FORMAT, LANGS: ['ka', 'en', 'ru'], TABLE: 'pitsruli_site' };
})();
