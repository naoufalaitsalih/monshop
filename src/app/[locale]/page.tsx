import { HeroHome } from "@/components/home/hero-home";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { FeaturedProductsHome } from "@/components/home/featured-products-home";
import { PromoCarousel } from "@/components/home/promo-carousel";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { ValuesSection } from "@/components/home/values-section";

export default function HomePage() {
  return (
    <>
      <div className="px-4 pt-4 sm:px-6 sm:pt-6 lg:pt-8">
        <HeroHome />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
        <CategoryShowcase />
        <FeaturedProductsHome />
        <PromoCarousel />
        <TestimonialsSection />
        <NewsletterSection />
        <ValuesSection />
      </div>
    </>
  );
}
