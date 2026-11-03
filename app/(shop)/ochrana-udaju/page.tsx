import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zásady zpracování osobních údajů (GDPR) | CzechBuy",
  description:
    "Kompletní informace o zpracování a ochraně osobních údajů v souladu s nařízením GDPR na e-shopu CzechBuy.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-8">
        <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500">
          Právní dokumentace
        </span>
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">
          Zásady zpracování osobních údajů (GDPR)
        </h1>
        <p className="text-xs text-neutral-500 mt-2">
          Platné a účinné od 1. ledna 2026. Zpracováno v souladu s Nařízením Evropského parlamentu a Rady (EU) 2016/679 (GDPR) a zákonem č. 110/2019 Sb., o zpracování osobních údajů.
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none text-xs leading-relaxed space-y-6 text-neutral-700 dark:text-neutral-300">
        <section>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            1. Správce osobních údajů
          </h2>
          <p>
            Správcem vašich osobních údajů je obchodní společnost:
          </p>
          <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-lg my-3 space-y-1">
            <p><strong>CzechBuy s.r.o.</strong></p>
            <p>Sídlo: Na Příkopě 853/12, 110 00 Praha 1, Česká republika</p>
            <p>IČO: 19842511, DIČ: CZ19842511</p>
            <p>Zapsaná v obchodním rejstříku vedeném Městským soudem v Praze, oddíl C</p>
            <p>Kontaktní e-mail: gdpr@czechbuy.cz / podpora@czechbuy.cz</p>
            <p>Telefon: +420 777 123 456</p>
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            2. Rozsah zpracovávaných osobních údajů
          </h2>
          <p>
            Zpracováváme pouze osobní údaje nezbytné pro řádné vyřízení vaší objednávky, komunikaci s vámi a splnění zákonných povinností:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Identifikační údaje:</strong> jméno, příjmení, případně název společnosti a IČO/DIČ.</li>
            <li><strong>Kontaktní údaje:</strong> doručovací adresa, fakturační adresa, e-mailová adresa, telefonní číslo.</li>
            <li><strong>Údaje o objednávce:</strong> specifikace objednaného zboží (parfémy, objem), platební metoda, způsob dopravy, historie nákupů.</li>
            <li><strong>Transakční údaje:</strong> číslo účtu, informace o provedené platbě (nikdy však neukládáme kompletní čísla platebních karet, která zpracovává licencovaná zabezpečená platební brána).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            3. Účel a právní základ zpracování
          </h2>
          <p>
            Vaše osobní údaje zpracováváme na základě následujících právních titulů dle čl. 6 odst. 1 GDPR:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <strong>Plnění smlouvy (čl. 6 odst. 1 písm. b GDPR):</strong> Zpracování je nezbytné pro uzavření a splnění kupní smlouvy, expedici objednaného zboží, vystavení dokladů a doručení zásilky na vámi zvolenou adresu nebo výdejní místo.
            </li>
            <li>
              <strong>Plnění právních povinností (čl. 6 odst. 1 písm. c GDPR):</strong> Zejména uchování účetních a daňových dokladů podle zákona č. 563/1991 Sb., o účetnictví, a zákona č. 235/2004 Sb., o dani z přidané hodnoty.
            </li>
            <li>
              <strong>Oprávněný zájem správce (čl. 6 odst. 1 písm. f GDPR):</strong> Ochrana právních nároků správce (řešení reklamací, vymáhání pohledávek) a zabezpečení webového portálu před zneužitím a podvody.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            4. Příjemci osobních údajů a předávání třetím stranám
          </h2>
          <p>
            Pro zajištění doručení a provozu e-shopu předáváme osobní údaje v nezbytném rozsahu prověřeným smluvním partnerům (zpracovatelům):
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Přepravním společnostem: Zásilkovna s.r.o. (Packeta), PPL CZ s.r.o., Direct Parcel Distribution CZ s.r.o. (DPD).</li>
            <li>Poskytovatelům zabezpečených platebních bran a bankovním institucím.</li>
            <li>Poskytovateli serverové a cloudové infrastruktury a účetního softwaru.</li>
          </ul>
          <p className="mt-2">
            Osobní údaje <strong>nepředáváme</strong> do třetích zemí mimo Evropský hospodářský prostor (EHP) ani žádným mezinárodním organizacím.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            5. Doba uchování údajů
          </h2>
          <p>
            Osobní údaje uchováváme po dobu nezbytnou k výkonu práv a povinností vyplývajících ze smluvního vztahu a po dobu uplatnitelnosti nároků z vadného plnění či záruky (zpravidla 3 roky od splnění smlouvy). Daňové a účetní doklady uchováváme po dobu 10 let od konce zdaňovacího období v souladu s platnými právními předpisy ČR.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            6. Vaše práva jako subjektu údajů
          </h2>
          <p>
            V souladu s nařízením GDPR máte následující práva:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Právo na přístup:</strong> máte právo požadovat potvrzení, zda zpracováváme vaše údaje, a získat jejich kopii.</li>
            <li><strong>Právo na opravu:</strong> máte právo na bezodkladnou opravu nepřesných či neúplných osobních údajů.</li>
            <li><strong>Právo na výmaz (právo být zapomenut):</strong> pokud pominuly účely zpracování nebo byl odvolán souhlas a neexistuje jiný zákonný důvod.</li>
            <li><strong>Právo na omezení zpracování:</strong> v případech stanovených čl. 18 GDPR.</li>
            <li><strong>Právo na přenositelnost údajů:</strong> získat své údaje ve strukturovaném, běžně používaném a strojově čitelném formátu.</li>
            <li><strong>Právo vznést námitku:</strong> proti zpracování založenému na oprávněném zájmu správce.</li>
            <li><strong>Právo podat stížnost:</strong> máte právo obrátit se s případnou stížností na dozorový úřad: <em>Úřad pro ochranu osobních údajů (ÚOOÚ)</em>, se sídlem Pplk. Sochora 27, 170 00 Praha 7, www.uoou.cz.</li>
          </ul>
          <p className="mt-4">
            Veškerá práva můžete uplatnit písemně na adrese sídla správce nebo e-mailem na <strong className="text-neutral-900 dark:text-white">gdpr@czechbuy.cz</strong>. Na vaše žádosti reagujeme bez zbytečného odkladu, nejpozději do 30 dnů.
          </p>
        </section>
      </div>
    </div>
  );
}
