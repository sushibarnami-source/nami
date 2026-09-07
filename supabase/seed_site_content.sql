-- Seed the real current site text into site_content + site_settings
insert into site_content (key, value_en, value_ka, value_ru) values
  ('hero_eyebrow', 'Tradition · Taste · Innovation', 'ტრადიცია · გემო · სიახლე', 'Традиция · Вкус · Новинка'),
  ('hero_title', 'A <span class="accent">Wave</span> of Japanese Flavor', 'იაპონური გემოს <span class="accent">ტალღა</span>', '<span class="accent">Волна</span> японского вкуса'),
  ('hero_sub', 'A wave never stops—it only changes its form. This is how we understand gastronomy: a tradition that evolves into new flavors over time.', 'ტალღა არასდროს ჩერდება — ის მხოლოდ ფორმას იცვლის. ჩვენც ასე გვესმის გასტრონომია: ტრადიცია, რომელიც დროთა განმავლობაში ახალ გემოდ იქცევა.', 'Волна никогда не останавливается — она лишь меняет форму. Именно так мы понимаем гастрономию: традиция, которая со временем превращается в новый вкус.'),
  ('about_p1', 'They say that Hokusai''s famous wave began its long journey from Kanagawa and stopped in the heart of Guria. "Nami" means a wave in Japanese — a wave that brought Asian flavors right to you.', 'ამბობენ, რომ ჰოკუსაის ცნობილმა ტალღამ კანაგავადან შორეული მოგზაურობა დაიწყო და გურიის გულში შეჩერდა. „ნამი“ იაპონურად ტალღას ნიშნავს, ტალღას, რომელმაც თქვენამდე აზიური გემო მოიტანა.', 'Говорят, что знаменитая волна Хокусаи начала свое далекое путешествие из Канагавы и остановилась в самом сердце Гурии. «Нами» по-японски означает волну — волну, которая принесла азиатский вкус прямо к вам.'),
  ('stat_dishes', 'Dishes on the menu', 'კერძი მენიუში', 'блюд в меню'),
  ('stat_fresh', 'Fresh fish', 'ფრეში თევზი', 'Свежая рыба'),
  ('info_address_value', '15 Chavchavadze Street, Ozurgeti, Georgia', 'ჭავჭავაძის ქუჩა 15, ოზურგეთი, საქართველო', 'ул. Чавчавадзе 15, Озургети, Грузия'),
  ('info_hours_value', 'Mon–Sat 13:30–23:30 · Sunday: Closed', 'ორშ–შაბ 13:30–23:30 · კვირა: დასვენების დღე', 'Пн–Сб 13:30–23:30 · Вс: выходной'),
  ('stat1_num', '25+', '25+', '25+'),
  ('stat2_num', '100%', '100%', '100%')
on conflict (key) do nothing;

insert into site_settings (id, phone, email, weekday_open, weekday_close)
values (1, '+995 597 05 08 17', 'sushibarnami@gmail.com', '13:30', '23:30')
on conflict (id) do nothing;
