import React from 'react';
import { CreditCard, Banknote, ShieldCheck, CheckCircle2 } from 'lucide-react';

const PAYMENT_OPTIONS = [
  {
    id: 'RAZORPAY',
    name: 'Online Payment (Razorpay)',
    description: 'Instant checkout via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking & Wallets.',
    icon: CreditCard,
    badge: 'Fast & Secure',
    isDefault: true,
  },
  {
    id: 'COD',
    name: 'Pay on Delivery / Cash on Delivery',
    description: 'Pay by cash or scan QR upon physical package delivery by our courier partner.',
    icon: Banknote,
    badge: 'Convenient',
    isDefault: false,
  },
];

const PaymentMethod = ({
  selectedMethod = 'RAZORPAY',
  onSelectMethod,
}) => {
  return (
    <div className="bg-oat-card rounded-lg border border-forest/15 shadow-2xs p-6 sm:p-7 space-y-5">
      <div className="pb-3 border-b border-forest/15">
        <h3 className="text-base font-bold font-display text-forest flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-forest" />
          <span>Select Payment Method</span>
        </h3>
        <p className="text-xs text-ink-muted mt-0.5">
          Single unified payment decomposes automatically into individual seller orders.
        </p>
      </div>

      <div className="space-y-3">
        {PAYMENT_OPTIONS.map((opt) => {
          const isSelected = selectedMethod === opt.id;
          const Icon = opt.icon;

          return (
            <div
              key={opt.id}
              onClick={() => onSelectMethod(opt.id)}
              className={`p-4 sm:p-5 rounded-lg border transition-all cursor-pointer flex items-start gap-4 ${
                isSelected
                  ? 'border-forest bg-oat-light/80 shadow-2xs ring-1 ring-forest'
                  : 'border-forest/15 hover:border-forest/30 bg-oat-card'
              }`}
            >
              <div className={`p-2.5 rounded-md shrink-0 ${isSelected ? 'bg-forest text-oat' : 'bg-oat text-forest border border-forest/15'}`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-display text-sm text-forest">{opt.name}</span>
                    <span className="text-[10px] font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-md border border-forest/20">
                      {opt.badge}
                    </span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-forest shrink-0" />}
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {opt.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3.5 rounded-md bg-oat border border-forest/15 text-xs text-ink flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-forest shrink-0 mt-0.5" />
        <span className="leading-snug">
          <strong className="text-forest">Single Checkout Guarantee:</strong> Your payment covers all selected sellers. Separate orders with dedicated tracking will be initiated for each regional orchard.
        </span>
      </div>
    </div>
  );
};

export default PaymentMethod;