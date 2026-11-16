import React from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  ShieldCheck,
  TrendingUp,
  Percent,
  ArrowRight,
  CreditCard,
  Award,
} from 'lucide-react';
import Button from '../../components/common/Button';

const SellWithUsPage = () => {
  const steps = [
    {
      num: '01',
      title: 'Quick Registration',
      desc: 'Create your vendor account with store name and contact credentials in under 2 minutes.',
    },
    {
      num: '02',
      title: 'Verification Submission',
      desc: 'Submit your FSSAI food business registration, business PAN, and bank details for payout disbursement.',
    },
    {
      num: '03',
      title: 'Admin Verification',
      desc: 'Our compliance team reviews your certifications to maintain a 100% genuine dried fruit standard.',
    },
    {
      num: '04',
      title: 'List & Sell Nationwide',
      desc: 'Publish your fruit variants (100g, 250g, 500g, 1kg) and receive direct orders with weekly payouts.',
    },
  ];

  const benefits = [
    {
      icon: Store,
      title: 'Specialized Niche Marketplace',
      desc: 'No clutter. Customers come specifically looking for pure, high-quality dehydrated and sun-dried fruits.',
    },
    {
      icon: Percent,
      title: 'Fair Commission (5-10%)',
      desc: 'Transparent take-rate with no hidden marketing charges or listing penalties.',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Vendor Trust Badge',
      desc: 'Certified FSSAI badge on your store inspires buyer confidence and premium basket sizes.',
    },
    {
      icon: CreditCard,
      title: 'Timely & Reliable Payouts',
      desc: 'Track gross sales, platform commissions, and net bank disbursements directly from your Seller Portal.',
    },
    {
      icon: TrendingUp,
      title: 'Multi-Vendor Cart Support',
      desc: 'Buyers combine your fruits with other regional producers in a single checkout, maximizing conversion.',
    },
    {
      icon: Award,
      title: 'Orchard-Direct Transparency',
      desc: 'Showcase your harvest source, processing technique, and no-sugar certifications directly to consumers.',
    },
  ];

  return (
    <div className="space-y-16 tablet:space-y-24 py-4">
      {/* Hero */}
      <section className="relative rounded-xl bg-forest-dark text-oat p-8 tablet:p-14 border border-forest-deep shadow-card overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-oat-card/10 border border-oat/20 text-oat text-xs font-semibold">
            <Store className="w-3.5 h-3.5 text-tomato" />
            <span>Dedicated Multi-Vendor Fruit Processing Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl desktop:text-6xl font-bold font-display tracking-tight leading-[1.15]">
            Turn your fruit dehydration business into a <span className="italic font-normal text-oat-dark">premier online store</span>.
          </h1>

          <p className="text-base sm:text-lg text-oat/80 leading-relaxed max-w-2xl">
            Reach thousands of health-focused households, fitness enthusiasts, and gourmet food buyers across India. Enjoy dedicated vendor analytics, transparent commissions, and streamlined payouts.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/seller/register">
              <Button size="lg" variant="accent" className="font-bold">
                Register as Seller Today
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-oat/40 text-oat hover:bg-oat hover:text-forest">
                Vendor Portal Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How Onboarding Works */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-forest/70">
            Step-by-Step
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-forest">
            Simple 4-Step Onboarding Process
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted">
            All fruit processors are verified before publishing products to ensure superior quality.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="p-6 rounded-lg bg-oat-card border border-forest/15 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl font-bold font-display text-forest/30 mb-3 block">
                  {step.num}
                </span>
                <h3 className="text-base font-bold font-display text-forest mb-2">{step.title}</h3>
                <p className="text-xs text-ink-muted leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Sell On Our Marketplace */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-forest/70">
            Vendor Advantages
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-forest">
            Why Partner with Dehydrated Fruit Marketplace?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="p-6 rounded-lg bg-oat-card border border-forest/15 shadow-2xs hover:border-forest/40 transition-all flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-md bg-forest/10 flex items-center justify-center text-forest shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-display text-forest mb-1">{b.title}</h4>
                  <p className="text-xs text-ink-muted leading-relaxed">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="rounded-xl bg-forest text-oat p-8 tablet:p-12 text-center max-w-4xl mx-auto space-y-6 shadow-card border border-forest-dark">
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-oat">
          Ready to scale your dehydrated fruit production?
        </h2>
        <p className="text-sm text-oat/80 max-w-xl mx-auto leading-relaxed">
          Join India's dedicated dehydrated fruit network. Register now and complete your FSSAI verification to get your products discovered.
        </p>
        <div>
          <Link to="/seller/register">
            <Button size="lg" variant="accent" className="font-bold">
              Start Seller Onboarding
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SellWithUsPage;
