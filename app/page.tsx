import { HeroSection } from '@/components/sections/hero-section';
import { ProductGrid } from '@/components/product/product-grid';
import { TrendingSection } from '@/components/sections/trending-section';
import { FeaturesSection } from '@/components/sections/features-section';
import { NewsletterSection } from '@/components/sections/newsletter-section';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <TrendingSection />
      <ProductGrid />
      <NewsletterSection />
    </>
  );
}
