import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Všeobecné obchodní podmínky | CzechBuy",
  description:
    "Všeobecné obchodní podmínky internetového obchodu CzechBuy v souladu s českým občanským zákoníkem (č. 89/2012 Sb.).",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-8">
        <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500">
          Právní dokumentace
        </span>
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">
          Všeobecné obchodní podmínky
        </h1>
        <p className="text-xs text-neutral-500 mt-2">
          Platné a účinné od 1. ledna 2026 pro nákup v internetovém obchodě CzechBuy provozovaném na adrese czechbuy.cz.
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none text-xs leading-relaxed space-y-6 text-neutral-700 dark:text-neutral-300">
        <section>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            1. Úvodní ustanovení
          </h2>
          <p>
            Tyto všeobecné obchodní podmínky (dále jen „obchodní podmínky“) obchodní společnosti:
          </p>
          <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-lg my-3 space-y-1">
            <p><strong>CzechBuy s.r.o.</strong></p>
            <p>Sídlo: Na Příkopě 853/12, 110 00 Praha 1</p>
            <p>IČO: 19842511, DIČ: CZ19842511</p>
            <p>E-mail: podpora@czechbuy.cz, telefon: +420 777 123 456</p>
          </div>
          <p>
            (dále jen „prodávající“) upravují v souladu s ustanovením § 1751 odst. 1 zákona č. 89/2012 Sb., občanský zákoník, ve znění pozdějších předpisů (dále jen „občanský zákoník“) vzájemná práva a povinnosti smluvních stran vzniklé v souvislosti nebo na základě kupní smlouvy uzavírané mezi prodávajícím a jinou fyzickou či právnickou osobou (dále jen „kupující“) prostřednictvím internetového obchodu prodávajícího.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            2. Uzavření kupní smlouvy
          </h2>
          <p>
            Veškerá prezentace zboží umístěná ve webovém rozhraní obchodu je informativního charakteru a prodávající není povinen uzavřít kupní smlouvu ohledně tohoto zboží (§ 1732 odst. 2 občanského zákoníku se nepoužije).
          </p>
          <p className="mt-2">
            Kupující provádí objednávku prostřednictvím objednávkového formuláře na webovém rozhraní. Před odesláním objednávky je kupujícímu umožněno zkontrolovat a měnit údaje, které do objednávky vložil. Objednávku odešle kupující prodávajícímu kliknutím na tlačítko „Dokončit a odeslat objednávku“. Smluvní vztah mezi prodávajícím a kupujícím vzniká doručením přijetí objednávky (akceptací), jež je prodávajícím zaslána kupujícímu elektronickou poštou na adresu uvedenou v objednávce.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            3. Cena zboží a platební podmínky
          </h2>
          <p>
            Všechny ceny zboží jsou uvedeny v českých korunách (Kč) včetně daně z přidané hodnoty (DPH) v zákonné výši a všech souvisejících poplatků, s výjimkou nákladů na doručení zboží. Ceny zboží zůstávají v platnosti po dobu, po kterou jsou zobrazovány ve webovém rozhraní.
          </p>
          <p className="mt-2">
            Cenu zboží a případné náklady spojené s dodáním může kupující uhradit následujícími způsoby:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Bezhotovostně platební kartou online přes platební bránu.</li>
            <li>Digitální peněženkou Apple Pay / Google Pay.</li>
            <li>Bezhotovostně převodem na bankovní účet prodávajícího.</li>
            <li>V hotovosti nebo kartou na dobírku při převzetí zásilky (poplatek 39 Kč).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            4. Přeprava a dodání zboží
          </h2>
          <p>
            Způsob doručení zboží volí kupující v průběhu objednávky. Náklady na dodání zboží v závislosti na zvoleném způsobu jsou uvedeny v objednávce. U objednávek přesahujících částku 2 000 Kč hradí náklady na doručení prodávající (doprava zdarma).
          </p>
          <p className="mt-2">
            Při převzetí zboží od přepravce je kupující povinen zkontrolovat neporušenost obalů zboží a v případě jakýchkoliv závad toto neprodleně oznámit přepravci i prodávajícímu.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            5. Odstoupení od smlouvy spotřebitelem (Lhůta 14 dnů)
          </h2>
          <p>
            Kupující, který je spotřebitelem, má v souladu s ustanovením § 1829 odst. 1 občanského zákoníku právo od kupní smlouvy odstoupit bez udání důvodu, a to do čtrnácti (14) dnů ode dne převzetí zboží.
          </p>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 rounded-md my-2 text-amber-900 dark:text-amber-300">
            <strong>Výjimka pro parfémy a kosmetiku:</strong> Dle § 1837 písm. g) občanského zákoníku spotřebitel nemůže odstoupit od smlouvy o dodávce zboží v zapečetěném obalu, které z něj vyňal a z hygienických důvodů jej není možné vrátit. Parfém je možné vrátit výhradně v původním neporušeném celofánu a neotevřené krabičce.
          </div>
          <p className="mt-2">
            Odstoupí-li kupující od smlouvy, vrátí mu prodávající peněžní prostředky do 14 dnů od okamžiku, kdy od kupujícího obdrží vrácené zboží. Náklady spojené s navrácením zboží prodávajícímu nese kupující.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            6. Práva z vadného plnění a záruka za jakost
          </h2>
          <p>
            Práva a povinnosti smluvních stran ohledně práv z vadného plnění se řídí příslušnými obecně závaznými právními předpisy (zejména § 1914 až 1925, § 2099 až 2117 a § 2161 až 2174b občanského zákoníku) a zákonem č. 634/1992 Sb., o ochraně spotřebitele.
          </p>
          <p className="mt-2">
            Prodávající odpovídá kupujícímu, že zboží při převzetí nemá vady. Záruční doba pro spotřebitele činí 24 měsíců od převzetí zboží. Prodávající garantuje 100% originální původ veškerých dodávaných parfémů z ověřené evropské distribuce.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            7. Mimosoudní řešení spotřebitelských sporů
          </h2>
          <p>
            K mimosoudnímu řešení spotřebitelských sporů z kupní smlouvy je příslušná <strong>Česká obchodní inspekce (ČOI)</strong>, se sídlem Štěpánská 567/15, 120 00 Praha 2, IČ: 000 20 869, internetová adresa: <a href="https://www.coi.cz" target="_blank" rel="noopener noreferrer" className="underline">www.coi.cz</a>. Platformu pro řešení sporů on-line nacházející se na internetové adrese <a href="http://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="underline">http://ec.europa.eu/consumers/odr</a> je možné využít při řešení sporů mezi prodávajícím a kupujícím z kupní smlouvy.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
            8. Závěrečná ustanovení
          </h2>
          <p>
            Vztahy a případné spory, které vzniknou na základě smlouvy, budou řešeny výhradně podle práva České republiky a budou řešeny příslušnými soudy České republiky. Tyto obchodní podmínky nabývají platnosti a účinnosti dnem 1. ledna 2026.
          </p>
        </section>
      </div>
    </div>
  );
}
