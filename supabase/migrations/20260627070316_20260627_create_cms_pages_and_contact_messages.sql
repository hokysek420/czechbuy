/*
# Create CMS pages and contact messages tables

1. New Tables
- `cms_pages` - Editable content for static pages (about, contact, shipping, returns, faq, terms, privacy, complaints)
  - `slug` - unique identifier for the page
  - `title` - page title
  - `content` - rich text content (markdown/html)
  - `meta_description` - SEO meta description
  - `updated_at` - last modified

- `contact_messages` - Messages submitted via contact form
  - `name`, `email`, `subject`, `message`
  - `is_read` flag for admin
  - `created_at`

2. Security
- CMS pages: public read, admin write
- Contact messages: public insert, admin read/update/delete
*/

CREATE TABLE IF NOT EXISTS cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  meta_description text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- CMS pages: public read, admin write
DROP POLICY IF EXISTS "cms_pages_select_public" ON cms_pages;
CREATE POLICY "cms_pages_select_public" ON cms_pages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "cms_pages_insert_admin" ON cms_pages;
CREATE POLICY "cms_pages_insert_admin" ON cms_pages FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "cms_pages_update_admin" ON cms_pages;
CREATE POLICY "cms_pages_update_admin" ON cms_pages FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "cms_pages_delete_admin" ON cms_pages;
CREATE POLICY "cms_pages_delete_admin" ON cms_pages FOR DELETE
  TO authenticated USING (public.is_admin());

-- Contact messages: anyone can submit, admin can manage
DROP POLICY IF EXISTS "contact_messages_select_admin" ON contact_messages;
CREATE POLICY "contact_messages_select_admin" ON contact_messages FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "contact_messages_insert_public" ON contact_messages;
CREATE POLICY "contact_messages_insert_public" ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "contact_messages_update_admin" ON contact_messages;
CREATE POLICY "contact_messages_update_admin" ON contact_messages FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "contact_messages_delete_admin" ON contact_messages;
CREATE POLICY "contact_messages_delete_admin" ON contact_messages FOR DELETE
  TO authenticated USING (public.is_admin());

-- Insert default CMS content
INSERT INTO cms_pages (slug, title, content, meta_description) VALUES
  ('o-nas', 'O nás', '<p>CzechBuy je moderní český e-shop zaměřený na prémiovou módu a doplňky. Naším cílem je nabídnout zákazníkům kvalitní produkty za férové ceny s rychlým doručením po celé České republice.</p><h3>Naše mise</h3><p>Věříme, že každý si zaslouží stylové oblečení, které vydrží. Proto pečlivě vybíráme dodavatele a dbáme na kvalitu materiálů i zpracování.</p><h3>Hodnoty</h3><ul><li>Kvalita před kvantitou</li><li>Férové ceny</li><li>Rychlé doručení</li><li>Výjimečný zákaznický servis</li></ul>', 'CzechBuy - moderní český e-shop s prémiovou módou. Kvalitní oblečení a doplňky za férové ceny.'),
  ('kontakt', 'Kontakt', '<p>Máte dotaz? Neváhejte nás kontaktovat.</p><h3>Kontaktní údaje</h3><p><strong>Email:</strong> info@czechbuy.cz<br><strong>Telefon:</strong> +420 123 456 789<br><strong>Adresa:</strong> CzechBuy s.r.o., Ulice 123, 110 00 Praha 1</p><h3>Otevírací doba</h3><p>Po–Pá: 9:00–17:00</p>', 'Kontaktujte CzechBuy. Email, telefon a adresa našeho zákaznického centra.'),
  ('doprava', 'Doprava a doručení', '<p>Nabízíme několik způsobů doručení, abyste si mohli vybrat ten, který vám nejvíce vyhovuje.</p><h3>Zásilkovna</h3><p>Doručení na výdejní místo Zásilkovny. Cena: 79 Kč. Doba doručení: 2–3 pracovní dny.</p><h3>PPL</h3><p>Doručení na adresu kurýrem PPL. Cena: 99 Kč. Doba doručení: 1–2 pracovní dny.</p><h3>DPD</h3><p>Doručení na adresu kurýrem DPD. Cena: 99 Kč. Doba doručení: 1–2 pracovní dny.</p><h3>Česká pošta</h3><p>Doručení na poštu nebo na adresu. Cena: 89 Kč. Doba doručení: 2–4 pracovní dny.</p><h3>Osobní odběr</h3><p>Osobní odběr v naší prodejně v Praze. Zdarma. Otevírací doba: Po–Pá 9:00–17:00.</p><h3>Doprava zdarma</h3><p>Při nákupu nad 5 000 Kč máte dopravu zdarma na jakékoli doručovací místo.</p>', 'Doprava a doručení na CzechBuy. Zásilkovna, PPL, DPD, Česká pošta a osobní odběr. Doprava zdarma nad 5000 Kč.'),
  ('vraceni-zbozi', 'Vrácení zboží', '<p>U nás máte 30 dní na bezplatné vrácení zboží bez udání důvodu.</p><h3>Jak vrátit zboží</h3><ol><li>Zboží zabalte do původního obalu</li><li>Přiložte kopii faktury nebo dodacího listu</li><li>Zašte na adresu: CzechBuy s.r.o., Ulice 123, 110 00 Praha 1</li><li>Peníze vrátíme do 14 dnů od přijetí zásilky</li></ol><h3>Podmínky vrácení</h3><ul><li>Zboží musí být nepoužité, s visačkami</li><li>V původním obalu</li><li>S dokladem o koupi</li></ul><p>V případě dotazů nás kontaktujte na info@czechbuy.cz.</p>', 'Vrácení zboží do 30 dnů na CzechBuy. Bezplatné vrácení bez udání důvodu. Návod a podmínky.'),
  ('faq', 'Často kladené otázky', '<h3>Objednávky</h3><p><strong>Jak mohete sledovat stav objednávky?</strong><br>Stav objednávky můžete sledovat ve svém profilu v sekci "Moje objednávky".</p><p><strong>Mohu změnit nebo zrušit objednávku?</strong><br>Objednávku lze zrušit, pokud ještě nebyla odeslána. Kontaktujte nás co nejdříve.</p><h3>Platby</h3><p><strong>Jaké platební metody přijímáte?</strong><br>Přijímáme bankovní převod a online platbu přes GoPay.</p><p><strong>Je platba na internetu bezpečná?</strong><br>Ano, všechny platby probíhají přes zabezpečené spojení SSL.</p><h3>Doprava</h3><p><strong>Kdy obdržím svou objednávku?</strong><br>Standardní doba doručení je 2–3 pracovní dny.</p><h3>Vrácení</h3><p><strong>Kolik máte na vrácení zboží?</strong><br>Na vrácení máte 30 dnů od převzetí zboží.</p><h3>Účet</h3><p><strong>Jak si vytvořím účet?</strong><br>Klikněte na "Registrace" v horní části stránky a vyplňte registrační formulář.</p>', 'FAQ - často kladené otázky na CzechBuy. Objednávky, platby, doprava, vrácení, účet.'),
  ('obchodni-podminky', 'Obchodní podmínky', '<h3>1. Úvodní ustanovení</h3><p>Tyto obchodní podmínky upravují vztahy mezi společností CzechBuy s.r.o., IČ: 12345678, se sídlem Praha 1, Ulice 123, 110 00 (dále jen "prodávající") a zákazníkem (dále jen "kupující").</p><h3>2. Objednávka a uzavření kupní smlouvy</h3><p>Kupující podává objednávku prostřednictvím webového rozhraní obchodu. Objednávka je závazným návrhem na uzavření kupní smlouvy.</p><h3>3. Ceny a platba</h3><p>Všechny ceny jsou uvedeny včetně DPH. Platba probíhá bankovním převodem nebo online platební bránou GoPay.</p><h3>4. Dodací podmínky</h3><p>Dodací lhůta je obvykle 2–3 pracovní dny. Doprava zdarma při nákupu nad 5 000 Kč.</p><h3>5. Odstoupení od smlouvy</h3><p>Kupující má právo odstoupit od smlouvy do 14 dnů od převzetí zboží bez udání důvodu.</p><h3>6. Reklamace</h3><p>Záruční lhůta je 24 měsíců. Reklamaci uplatněte písemně na adresu prodávajícího nebo e-mailem.</p><h3>7. Ochrana osobních údajů</h3><p>Veškeré osobní údaje jsou zpracovávány v souladu s GDPR.</p>', 'Obchodní podmínky CzechBuy. Práva a povinnosti kupujícího a prodávajícího.'),
  ('ochrana-osobnich-udaju', 'Ochrana osobních údajů', '<h3>1. Správce osobních údajů</h3><p>Správcem osobních údajů je CzechBuy s.r.o., IČ: 12345678, se sídlem Praha 1, Ulice 123, 110 00.</p><h3>2. Rozsah zpracování</h3><p>Zpracováváme tyto osobní údaje: jméno, e-mail, telefon, doručovací adresa, historie objednávek.</p><h3>3. Účel zpracování</h3><p>Údaje zpracováváme za účelem vyřízení objednávky, doručení zboží, komunikace se zákazníkem a plnění právních povinností.</p><h3>4. Doba uchování</h3><p>Osobní údaje uchováváme po dobu nezbytnou pro splnění účelu zpracování, nejdéle však 5 let od poslední objednávky.</p><h3>5. Práva subjektu údajů</h3><p>Máte právo na přístup k údajům, jejich opravu, výmaz, omezení zpracování, přenositelnost a právo vznést námitku.</p><h3>6. Kontakt</h3><p>Pro uplatnění práv nás kontaktujte na info@czechbuy.cz.</p>', 'Ochrana osobních údajů na CzechBuy. GDPR, zpracování údajů, práva zákazníků.'),
  ('reklamace', 'Reklamace a záruka', '<h3>Záruční podmínky</h3><p>Na všechny produkty poskytujeme záruku 24 měsíců v souladu s občanským zákoníkem.</p><h3>Jak uplatnit reklamaci</h3><ol><li>Zabalte reklamované zboží včetně kopie faktury</li><li>Přiložte popis závady</li><li>Zašte na adresu: CzechBuy s.r.o., Ulice 123, 110 00 Praha 1</li><li>O vyřízení vás budeme informovat do 30 dnů</li></ol><h3>Co nelze reklamovat</h3><ul><li>Poškození způsobené nesprávným používáním</li><li>Běžné opotřebení</li><li>Poškození mechanického původu</li></ul><h3>Kontakt pro reklamace</h3><p>Email: reklamace@czechbuy.cz<br>Telefon: +420 123 456 789</p>', 'Reklamace a záruka na CzechBuy. 24 měsíců záruka. Jak uplatnit reklamaci.')
ON CONFLICT (slug) DO NOTHING;
