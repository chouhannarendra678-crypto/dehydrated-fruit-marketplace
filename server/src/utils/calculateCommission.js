/**
 * calculateCommission.js
 * 
 * Production-ready utility for calculating marketplace platform commission,
 * seller net earnings, and payout disbursements for the Dehydrated Fruit Marketplace.
 * 
 * Rules:
 * - Configurable commission rate (initial default: 5–10%, standard default: 8%).
 * - Commission is calculated on the dehydrated fruit products subtotal.
 * - Shipping fee and taxes remain with the vendor / pass-through to cover packaging & dispatch.
 * - All financial calculations are rounded cleanly to 2 decimal places to prevent floating-point discrepancies.
 */

const DEFAULT_COMMISSION_RATE = 8; // 8% default platform commission (within agreed 5–10% bracket)

/**
 * Calculate financial breakdown for a single SellerOrder
 * 
 * @param {Object} params
 * @param {number} params.subtotal - Line items subtotal
 * @param {number} [params.shippingFee=0] - Vendor courier dispatch fee
 * @param {number} [params.tax=0] - 5% GST on packaged dried fruits
 * @param {number} [params.totalAmount=null] - Pre-calculated gross total, or computed from subtotal+shipping+tax
 * @param {number} [params.commissionRate=8] - Percentage commission rate (e.g., 5 to 20)
 * @returns {Object} { grossOrderAmount, commissionRate, platformCommission, sellerEarning, payoutAmount }
 */
function calculateCommission({
  subtotal = 0,
  shippingFee = 0,
  tax = 0,
  totalAmount = null,
  commissionRate = DEFAULT_COMMISSION_RATE,
}) {
  const parsedSubtotal = Math.max(0, Number(subtotal) || 0);
  const parsedShipping = Math.max(0, Number(shippingFee) || 0);
  const parsedTax = Math.max(0, Number(tax) || 0);

  // 1. Gross Order Amount
  const grossOrderAmount =
    totalAmount !== null && totalAmount !== undefined
      ? Math.round(Number(totalAmount) * 100) / 100
      : Math.round((parsedSubtotal + parsedShipping + parsedTax) * 100) / 100;

  // 2. Validate Commission Rate (default 8% if invalid or negative)
  const validRate =
    typeof commissionRate === 'number' && !isNaN(commissionRate) && commissionRate >= 0
      ? commissionRate
      : DEFAULT_COMMISSION_RATE;

  // 3. Platform Commission (commissionRate % of products subtotal)
  const platformCommission = Math.round(((parsedSubtotal * validRate) / 100) * 100) / 100;

  // 4. Seller Earning (Gross order amount minus platform commission deduction)
  const sellerEarning = Math.max(
    0,
    Math.round((grossOrderAmount - platformCommission) * 100) / 100
  );

  // 5. Payout Amount (Net earnings payable to the seller)
  const payoutAmount = sellerEarning;

  return {
    grossOrderAmount,
    commissionRate: validRate,
    platformCommission,
    sellerEarning,
    payoutAmount,
  };
}

/**
 * Calculate aggregated totals for a batch of SellerOrders for a payout disbursement
 * 
 * @param {Array<Object>} sellerOrders - Array of SellerOrder documents
 * @returns {Object} Aggregated totals { orderCount, grossAmount, commissionDeducted, amount, payoutAmount }
 */
function calculateBatchPayout(sellerOrders = []) {
  let grossAmount = 0;
  let commissionDeducted = 0;
  let totalSellerEarnings = 0;

  for (const order of sellerOrders) {
    grossAmount += Number(order.totalAmount || 0);
    commissionDeducted += Number(order.commissionAmount || 0);
    totalSellerEarnings += Number(order.sellerEarnings || 0);
  }

  const roundedGross = Math.round(grossAmount * 100) / 100;
  const roundedCommission = Math.round(commissionDeducted * 100) / 100;
  const roundedEarnings = Math.round(totalSellerEarnings * 100) / 100;

  return {
    orderCount: sellerOrders.length,
    grossAmount: roundedGross,
    commissionDeducted: roundedCommission,
    amount: roundedEarnings, // Net payout amount
    payoutAmount: roundedEarnings,
  };
}

/**
 * Mask a bank account number for secure display (e.g. •••• •••• 4321)
 * Prevents unnecessary exposure of seller banking details
 * 
 * @param {string} accountNumber - Raw bank account string
 * @returns {string} Masked string
 */
function maskAccountNumber(accountNumber = '') {
  if (!accountNumber || typeof accountNumber !== 'string') return '•••• •••• ••••';
  const clean = accountNumber.replace(/\s+/g, '');
  if (clean.length <= 4) return `•••• ${clean}`;
  const lastFour = clean.slice(-4);
  return `•••• •••• ${lastFour}`;
}

module.exports = {
  calculateCommission,
  calculateBatchPayout,
  maskAccountNumber,
  DEFAULT_COMMISSION_RATE,
};
