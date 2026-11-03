import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "CzechBuy | Prémiové originální parfémy",
  description: "Exkluzivní nabídka originálních pánských, dámských a niche parfémů. Doprava zdarma nad 2 000 Kč a garance 100% původu.",
  keywords: ["parfémy", "originální parfémy", "niche vůně", "CzechBuy", "Dior Sauvage", "Baccarat Rouge"],
  openGraph: {
    title: "CzechBuy | Prémiové originální parfémy",
    description: "Široký výběr originálních parfémů z evropské distribuce s doručením do 48 hodin.",
    locale: "cs_CZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans transition-colors">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            {children}
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
