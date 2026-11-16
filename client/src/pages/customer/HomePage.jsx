import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Star,
  Scale,
  Award,
  Truck,
  RefreshCw,
  Quote,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import Button from '../../components/common/Button';
import ProductCard from '../../components/common/ProductCard';
import Loader from '../../components/common/Loader';
import { useGetPublicProductsQuery } from '../../services/productApi';
import { useGetCategoriesQuery } from '../../services/categoryApi';
import { useGetPublicSellersQuery } from '../../services/sellerApi';

const HomePage = () => {
  const [marqueeDirection, setMarqueeDirection] = useState('normal'); // 'normal' | 'reverse'
  const [isPaused, setIsPaused] = useState(false);

  // Real backend queries
  const { data: catData, isLoading: catLoading } = useGetCategoriesQuery();
  const { data: featuredData, isLoading: featuredLoading } = useGetPublicProductsQuery({ limit: 8, sort: 'popular' });
  const { data: prodData, isLoading: prodLoading } = useGetPublicProductsQuery({ limit: 8, sort: 'newest' });
  const { data: sellersData, isLoading: sellersLoading } = useGetPublicSellersQuery({ limit: 3 });

  const categories = catData?.data?.categories || [];
  const featuredProducts = featuredData?.data?.products || [];
  const products = prodData?.data?.products || [];
  const featuredSellers = sellersData?.data?.sellers || [];

  // Duplicate items to guarantee a seamless infinite marquee loop
  const baseList = featuredProducts.length > 0 && featuredProducts.length < 6
    ? [...featuredProducts, ...featuredProducts, ...featuredProducts]
    : featuredProducts;
  const marqueeList = baseList.length > 0 ? [...baseList, ...baseList] : [];

  const testimonials = [
    {
      name: 'Dr. Ananya Sen',
      role: 'Clinical Nutritionist, Mumbai',
      quote: 'Being able to compare Ratnagiri alphonso chews with Shimla solar-dehydrated fruit batches in one cart is revolutionary. The lack of added sugar and sulfites is genuine and verified.',
      rating: 5,
      product: 'Ratnagiri Sun-Dried Alphonso Mango',
    },
    {
      name: 'Rohan Mehta',
      role: 'Marathon Runner, Bengaluru',
      quote: 'Spiced pineapple rings and wild cranberries are staple trail snacks. Ordered from two independent orchard vendors; both batches arrived vacuum-sealed in 3 days.',
      rating: 5,
      product: 'Spiced Dehydrated Pineapple Rings',
    },
    {
      name: 'Meera Nambiar',
      role: 'Home Baker & Mom, Kochi',
      quote: 'The Royal Afghan Anjeer (figs) are plump, crunchy with seeds, and completely chemical-free. Outstanding quality compared to commercial supermarket dried fruit aisles.',
      rating: 5,
      product: 'Royal Sun-Dried Figs (Anjeer)',
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-10 py-1">
      {/* 1. SIMPLE EDITORIAL MARKETPLACE HERO */}
      <section className="pt-2 pb-2 max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 border border-forest/15 text-forest text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-tomato"></span>
          <span>100% Sun &amp; Solar-Dried • Pure Harvest</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-forest tracking-tight leading-[1.15]">
          Pure Harvest. Naturally Concentrated.
        </h1>

        <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
          Wholesome solar-dried fruits from verified regional growers across India.
          Slow-dehydrated to lock in natural flavor and nutrition — with zero added sugar and zero preservatives.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link to="/explore">
            <Button size="md" variant="primary" className="gap-2 font-semibold shadow-2xs">
              <span>Explore All Fruits</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/brands">
            <Button size="md" variant="outline" className="gap-2 font-medium">
              <span>Meet The Growers</span>
            </Button>
          </Link>
        </div>

        {/* Minimal inline trust notes */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5 font-medium text-forest">
            <span className="w-1.5 h-1.5 rounded-full bg-forest/60"></span>
            Zero Refined Sugar
          </span>
          <span className="flex items-center gap-1.5 font-medium text-forest">
            <span className="w-1.5 h-1.5 rounded-full bg-forest/60"></span>
            FSSAI Certified Orchards
          </span>
          <span className="flex items-center gap-1.5 font-medium text-forest">
            <span className="w-1.5 h-1.5 rounded-full bg-forest/60"></span>
            Unified Multi-Vendor Cart
          </span>
        </div>
      </section>

      {/* Subtle Divider */}
      <hr className="border-forest/10" />

      {/* 2. COMPACT DISCOVERY WITH FEATURED PRODUCT MARQUEE */}
      <section className="space-y-5">
        {/* Top Copy */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest/10 text-forest text-[11px] font-bold border border-forest/15">
              <span className="w-1.5 h-1.5 rounded-full bg-tomato"></span>
              <span>Curated Multi-Vendor Marketplace</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-forest tracking-tight leading-tight">
              Dehydrated fruits, ready to explore.
            </h2>

            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Shop wholesome, pure dried fruits direct from certified regional processors across India.
            </p>
          </div>

          {/* Marquee Controls */}
          <div className="flex items-center gap-2 self-start sm:self-end shrink-0">
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest/10 hover:bg-forest/15 text-forest text-xs font-semibold transition-colors"
              title={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
            >
              <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-tomato' : 'bg-forest animate-pulse'}`}></span>
              <span>{isPaused ? 'Paused' : 'Auto-Scrolling'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMarqueeDirection('reverse');
                setIsPaused(false);
              }}
              className={`p-1.5 sm:p-2 rounded-full border border-forest/20 text-forest shadow-2xs transition-colors ${
                marqueeDirection === 'reverse'
                  ? 'bg-forest text-white'
                  : 'bg-oat-card hover:bg-forest hover:text-white'
              }`}
              title="Reverse marquee direction"
              aria-label="Reverse marquee direction"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setMarqueeDirection('normal');
                setIsPaused(false);
              }}
              className={`p-1.5 sm:p-2 rounded-full border border-forest/20 text-forest shadow-2xs transition-colors ${
                marqueeDirection === 'normal'
                  ? 'bg-forest text-white'
                  : 'bg-oat-card hover:bg-forest hover:text-white'
              }`}
              title="Forward marquee direction"
              aria-label="Forward marquee direction"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Infinite Product Marquee Carousel Track */}
        {featuredLoading ? (
          <Loader message="Loading featured fruits..." />
        ) : marqueeList.length === 0 ? null : (
          <div className="overflow-hidden py-1.5 -mx-1 px-1 relative group">
            <div
              className={`flex items-stretch gap-3 sm:gap-4 w-max ${
                marqueeDirection === 'reverse' ? 'animate-marquee-reverse' : 'animate-marquee'
              }`}
              style={{
                animationPlayState: isPaused ? 'paused' : undefined,
              }}
            >
              {marqueeList.map((p, idx) => (
                <div
                  key={`${p._id}-${idx}`}
                  className="w-[180px] sm:w-[220px] desktop:w-[240px] shrink-0 flex"
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 2. SHOP BY FRUIT (Real Category Navigation) */}
      {categories.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3 pb-2 border-b border-forest/15">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-forest/70">Orchard Categories</span>
              <h2 className="text-lg sm:text-xl font-bold font-display text-forest">Shop by Fruit</h2>
            </div>
            <Link to="/explore" className="text-xs font-bold text-forest hover:underline inline-flex items-center gap-1">
              All categories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/explore?category=${cat.slug}`}
                className="p-3 rounded-lg bg-oat-card border border-forest/15 hover:border-forest/40 hover:-translate-y-0.5 transition-all text-center flex flex-col items-center justify-center group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-md bg-forest/10 text-forest font-bold text-sm mb-1.5 flex items-center justify-center font-display group-hover:bg-forest group-hover:text-oat transition-colors">
                  {cat.name.charAt(0)}
                </div>
                <h3 className="text-xs font-bold text-forest group-hover:text-forest-muted transition-colors font-display line-clamp-1">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-ink-muted mt-0.5">Explore →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. FULL PRODUCT GRID (Shop Dehydrated Fruits) */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3 pb-3 border-b border-forest/15">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-forest/70">Fresh Harvest Catalog</span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-forest">Shop Dehydrated Fruits</h2>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold text-forest hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>View all products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {prodLoading ? (
          <Loader message="Loading fresh fruit catalog..." />
        ) : products.length === 0 ? (
          <div className="p-8 text-center bg-oat-card border border-forest/15 rounded-lg text-ink-muted text-sm">
            No dehydrated fruits currently available. Please check back shortly.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}

        <div className="pt-2 flex justify-center">
          <Link to="/explore">
            <Button variant="outline" size="md" className="font-semibold text-xs sm:text-sm">
              Explore All Dehydrated Fruits
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 4. DISCOVER SELLERS & BRANDS */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3 pb-3 border-b border-forest/15">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-forest/70">Verified Sellers</span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-forest">Discover Our Orchard Brands</h2>
          </div>
          <Link to="/brands" className="text-xs font-bold text-forest hover:underline inline-flex items-center gap-1">
            All brands <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {sellersLoading ? (
          <Loader message="Loading certified sellers..." />
        ) : featuredSellers.length === 0 ? null : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredSellers.map((s) => (
              <div
                key={s._id}
                className="p-5 rounded-lg bg-oat-card border border-forest/15 hover:border-forest/40 transition-all flex flex-col justify-between shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-forest/10 text-forest border border-forest/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-forest" /> FSSAI Verified
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#C88E2D]">
                      <Star className="w-3.5 h-3.5 fill-[#C88E2D] text-[#C88E2D]" />
                      <span>{s.rating > 0 ? s.rating.toFixed(1) : '5.0'}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-display text-forest">{s.storeName}</h3>
                    <p className="text-xs text-ink-muted mt-1 line-clamp-2 leading-relaxed">
                      {s.description || 'Certified regional fruit dehydration producer.'}
                    </p>
                    {s.businessAddress?.city && (
                      <p className="text-[11px] text-forest font-medium mt-1.5">
                        📍 {s.businessAddress.city}, {s.businessAddress.state}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-forest/15 flex items-center justify-between">
                  <span className="text-xs text-ink-muted">
                    {s.reviewCount || 0} reviews
                  </span>
                  <Link
                    to={`/sellers/${s.slug}`}
                    className="text-xs font-bold text-forest hover:underline inline-flex items-center gap-1"
                  >
                    View Store <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. WHY SHOP WITH US (Marketplace Trust Strip) */}
      <section className="bg-oat-card rounded-xl p-6 sm:p-8 border border-forest/15 shadow-2xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-forest/70">Quality & Safety Guarantee</span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-forest">Why Shop Dehydrated Fruits With Us?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-oat/60 border border-forest/15 space-y-2">
            <div className="w-9 h-9 rounded-md bg-forest/10 text-forest flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm font-display text-forest">100% Pure & Transparent</h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Every vendor declares added sugar and preservative status clearly so you get genuine fruit nutrition.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-oat/60 border border-forest/15 space-y-2">
            <div className="w-9 h-9 rounded-md bg-forest/10 text-forest flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm font-display text-forest">Farm-Direct Dispatch</h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Fruits dispatch directly from certified regional processors, eliminating warehouse storage degradation.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-oat/60 border border-forest/15 space-y-2">
            <div className="w-9 h-9 rounded-md bg-forest/10 text-forest flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm font-display text-forest">Multi-Vendor Cart</h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Combine mango chews from Konkan and cranberries from Himachal in a single seamless order.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-oat/60 border border-forest/15 space-y-2">
            <div className="w-9 h-9 rounded-md bg-forest/10 text-forest flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm font-display text-forest">FSSAI Certified</h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              All registered sellers undergo strict 14-digit FSSAI compliance verification before listing products.
            </p>
          </div>
        </div>
      </section>

      {/* 6. MARKETPLACE COMPARISON BANNER */}
      <section className="rounded-xl bg-forest text-oat p-6 sm:p-8 border border-forest-dark flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-card">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-oat/70 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-tomato" />
            Direct Comparison
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-oat leading-snug">
            Compare Harvests, Moisture Levels & Weights Side-by-Side.
          </h2>
          <p className="text-xs sm:text-sm text-oat/80 leading-relaxed">
            Inspect sugar content, drying techniques (solar vs air-dried), and weight tier pricing (100g, 250g, 500g, 1kg) across multiple independent orchards before buying.
          </p>
        </div>
        <div className="shrink-0">
          <Link to="/explore">
            <Button variant="accent" size="md" className="font-bold">
              Compare Fruits
            </Button>
          </Link>
        </div>
      </section>

      {/* 7. BUYER REVIEWS & EXPERIENCES */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-forest/70">Verified Feedback</span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-forest">Trusted by Conscious Food Lovers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-5 rounded-lg bg-oat-card border border-forest/15 shadow-2xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                <Quote className="w-5 h-5 text-forest/40" />
                <div className="flex items-center gap-1 text-[#C88E2D]">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C88E2D]" />
                  ))}
                </div>
                <p className="text-xs text-ink/90 leading-relaxed italic font-serif">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-forest/15">
                <p className="text-xs font-bold text-forest font-display">{t.name}</p>
                <p className="text-[10px] text-ink-muted">{t.role}</p>
                <p className="text-[10px] text-forest font-semibold mt-0.5">Verified: {t.product}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. SELL WITH US (Below the Shopping Experience) */}
      <section className="rounded-xl bg-forest-dark text-oat p-6 sm:p-10 border border-forest-deep text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-oat/70">Grower & Vendor Partnership</span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-oat leading-snug">
            Are you a fruit orchard grower or dehydration facility?
          </h2>
          <p className="text-xs sm:text-sm text-oat/80">
            Reach conscious buyers across India with dedicated store profiles, fair commissions, and guaranteed weekly bank payouts.
          </p>
        </div>
        <Link to="/sell-with-us" className="shrink-0">
          <Button variant="accent" size="md" className="font-bold">
            Sell With Us
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
