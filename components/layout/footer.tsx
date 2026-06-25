"use client";

import Link from "next/link";

const footerLinks = {
  company: [
    { label: "O nás", href: "/o-nas" },
    { label: "Kontakt", href: "/kontakt" },
    { label: "Kariéra", href: "/kariera" },
  ],
  legal: [
    { label: "Obchodní podmínky", href: "/obchodni-podminky" },
    { label: "Ochrana osobních údajů", href: "/ochrana-osobnich-udaju" },
    { label: "Reklamace", href: "/reklamace" },
  ],
  help: [
    { label: "Doprava", href: "/doprava" },
    { label: "Vrácení zboží", href: "/vraceni-zbozi" },
    { label: "FAQ", href: "/faq" },
  ],
};

const categories = [
  "Pánské oblečení",
  "Dámské oblečení",
  "Tenisky",
  "Bundy",
  "Mikiny",
  "Trička",
  "Kalhoty",
  "Doplňky",
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold tracking-tight">
                Czech<span className="text-muted/80">Buy</span>
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Prémiová móda v České republice. Moderní online obchod inspirovaný
              Zalando.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Společnost</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Právní informace</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h3 className="font-semibold mb-4">Nápověda</h3>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Categories */}
        <div className="border-t border-primary-foreground/20 pt-8 mb-8">
          <h3 className="font-semibold mb-4">Kategorie</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/kategorie/${category.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/60 text-sm">
            &copy; {new Date().getFullYear()} CzechBuy. Všechna práva vyhrazena.
          </p>
          <p className="text-primary-foreground/50 text-sm">
            Made with care in Czech Republic
          </p>
        </div>
      </div>
    </footer>
  );
}
