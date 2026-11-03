"use client";

import React, { useState } from "react";
import { ChevronDown, Truck, RotateCcw, ShieldCheck, HelpCircle } from "lucide-react";

interface FaqItem {
  id: string;
  category: "doprava" | "vraceni" | "reklamace" | "pravost";
  question: string;
  answer: string | React.ReactNode;
}

const FAQS: FaqItem[] = [
  {
    id: "dodaci-lhuta",
    category: "doprava",
    question: "Jaká je dodací lhůta pro objednané parfémy?",
    answer:
      "Všechny produkty označené jako 'Skladem' expedujeme do 24 hodin od přijetí objednávky (v pracovní dny). Obvyklá doba doručení přepravci Zásilkovna, PPL či DPD po celé České republice činí 24 až 48 hodin. V případě volby osobního odběru v našem centrálním skladu v Praze je zboží připraveno k vyzvednutí do 2 hodin.",
  },
  {
    id: "doprava-zdarma",
    category: "doprava",
    question: "Od jaké částky je doprava zdarma?",
    answer:
      "Dopravu zdarma poskytujeme pro všechny objednávky v celkové hodnotě nad 2 000 Kč. U objednávek do 2 000 Kč činí cena doručení na výdejní místo Zásilkovny 79 Kč a kurýrem PPL či DPD na adresu 99 Kč. Osobní odběr na centrálním výdejním místě je vždy bez poplatku.",
  },
  {
    id: "odstoupeni-14-dni",
    category: "vraceni",
    question: "Jak mohu vrátit zboží ve 14denní zákonné lhůtě?",
    answer: (
      <div className="space-y-2">
        <p>
          V souladu s § 1829 odst. 1 občanského zákoníku (zákon č. 89/2012 Sb.) máte jako spotřebitel právo odstoupit od kupní smlouvy bez udání důvodu do 14 dnů od převzetí zboží.
        </p>
        <p>
          <strong>Důležité upozornění pro kosmetiku a parfémy:</strong> Podle § 1837 písm. g) občanského zákoníku nelze odstoupit od smlouvy o dodávce zboží v zapečetěném obalu, které spotřebitel z obalu vyňal a z hygienických důvodů jej není možné vrátit. Parfém je proto možné v plné výši vrátit pouze v původním neporušeném celofánovém obalu a nepoškozené krabičce.
        </p>
        <p>
          Zboží zašlete na adresu: CzechBuy s.r.o. – Vratky, Na Příkopě 853/12, 110 00 Praha 1, s přiloženým číslem objednávky a číslem bankovního účtu pro vrácení peněz. Peníze vám vrátíme do 14 dnů od doručení zásilky k nám.
        </p>
      </div>
    ),
  },
  {
    id: "postup-reklamace",
    category: "reklamace",
    question: "Jak postupovat při reklamaci vadného zboží?",
    answer: (
      <div className="space-y-2">
        <p>
          Na veškeré spotřební zboží poskytujeme zákonnou záruku v délce 24 měsíců. V případě zjištění výrobní vady (např. vadný rozprašovač, poškozený flakon) postupujte následovně:
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Napište nám na reklamace@czechbuy.cz a uveďte číslo objednávky a popis vady (ideálně připojte fotografii).</li>
          <li>Zboží bezpečně zabalte a zašlete na naši adresu pro reklamace, nebo vám zašleme bezplatný kód pro odeslání přes Zásilkovnu.</li>
          <li>Reklamaci posoudíme a vyřídíme bez zbytečného odkladu, nejpozději do 30 kalendářních dnů v souladu se zákonem o ochraně spotřebitele.</li>
        </ol>
      </div>
    ),
  },
  {
    id: "zaruka-originality",
    category: "pravost",
    question: "Jak mohu mít jistotu, že jsou vaše parfémy 100% originální?",
    answer:
      "Všechny naše produkty nakupujeme výhradně od oficiálních evropských autorizovaných distributorů a přímo od renomovaných parfémových domů. Každý flakon nese originální šarži (tzv. batch code), podle kterého lze na mezinárodních kosmetických registrech ověřit datum i závod výroby. Nikdy neprodáváme testerské verze bez víčka jako plnohodnotné zboží ani žádné napodobeniny.",
  },
];

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<string[]>(["dodaci-lhuta", "odstoupeni-14-dni"]);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs =
    activeCategory === "all"
      ? FAQS
      : FAQS.filter((f) => f.category === activeCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-8 text-center sm:text-left">
        <span className="text-xs uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500">
          Zákaznická podpora
        </span>
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">
          Často kladené otázky (FAQ)
        </h1>
        <p className="text-xs text-neutral-500 mt-2">
          Vše, co potřebujete vědět o nákupu, expedici, vrácení zboží do 14 dnů a záruce pravosti.
        </p>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mt-6 justify-center sm:justify-start">
          {[
            { id: "all", label: "Všechny dotazy" },
            { id: "doprava", label: "Doprava a dodání" },
            { id: "vraceni", label: "Vrácení do 14 dnů" },
            { id: "reklamace", label: "Reklamace a záruka" },
            { id: "pravost", label: "Garance pravosti" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-neutral-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion List */}
      <div className="divide-y divide-neutral-200 dark:divide-neutral-800 border-y border-neutral-200 dark:border-neutral-800">
        {filteredFaqs.map((faq) => {
          const isOpen = openItems.includes(faq.id);
          return (
            <div key={faq.id} id={faq.id} className="py-4">
              <button
                type="button"
                onClick={() => toggleItem(faq.id)}
                className="w-full flex items-center justify-between text-left gap-4 focus:outline-none group"
              >
                <span className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-neutral-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="mt-3 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed pr-6 animate-in fade-in-50">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still need help callout */}
      <div className="mt-12 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 text-center">
        <HelpCircle className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          Nenašli jste odpověď na svůj dotaz?
        </h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
          Náš zákaznický tým je vám k dispozici každý všední den od 9:00 do 17:00.
        </p>
        <p className="text-xs font-semibold text-neutral-900 dark:text-white mt-2">
          podpora@czechbuy.cz · +420 777 123 456
        </p>
      </div>
    </div>
  );
}
