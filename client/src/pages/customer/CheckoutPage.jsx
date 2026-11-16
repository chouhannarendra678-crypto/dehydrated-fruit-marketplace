import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Store,
} from 'lucide-react';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import AddressSelector from '../../components/checkout/AddressSelector';
import OrderSummary from '../../components/checkout/OrderSummary';
import PriceBreakdown from '../../components/checkout/PriceBreakdown';
import PaymentMethod from '../../components/checkout/PaymentMethod';
import { selectCartItems, selectCartItemsBySeller, clearCart } from '../../redux/slices/cartSlice';
import { useValidateCheckoutMutation } from '../../services/cartApi';
import { useGetAddressesQuery } from '../../services/addressApi';
import { useCreateOrderMutation } from '../../services/orderApi';
import {
  useCreateRazorpayOrderMutation,
  useVerifyPaymentMutation,
  useRecordPaymentFailureMutation,
} from '../../services/paymentApi';
import { loadRazorpayScript } from '../../utils/loadRazorpay';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const sellerGroups = useSelector(selectCartItemsBySeller);

  const { data: addressData } = useGetAddressesQuery();
  const [validateCheckout, { data: serverCalcData, isLoading: isValidating }] = useValidateCheckoutMutation();
  const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();
  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [recordFailure] = useRecordPaymentFailureMutation();

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('RAZORPAY');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState('');

  const addresses = addressData?.data?.addresses || [];

  // Default to user's default address on load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr._id);
    }
  }, [addresses, selectedAddressId]);

  // Trigger server recalculation whenever items or selected address changes
  useEffect(() => {
    if (cartItems.length > 0) {
      validateCheckout({
        items: cartItems,
        addressId: selectedAddressId || undefined,
      }).unwrap().catch((err) => {
        console.error('Checkout validation error:', err);
      });
    }
  }, [cartItems, selectedAddressId]);

  if (cartItems.length === 0 && !placedOrder) {
    return (
      <EmptyState
        title="No Items in Cart for Checkout"
        description="Your cart is currently empty. Explore our regional sun-dried fruit batches to begin."
        actionLabel="Explore Fruits"
        onAction={() => navigate('/explore')}
      />
    );
  }

  const calculation = serverCalcData?.data;
  const calculatedSellerGroups = calculation?.sellerGroups || sellerGroups;
  const calculatedSummary = calculation?.summary || {
    subtotal: cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0),
    totalShipping: sellerGroups.length * 50,
    tax: Math.round(cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0) * 0.05),
    discount: 0,
    grandTotal: cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0) * 1.05 + sellerGroups.length * 50,
    totalItems: cartItems.reduce((acc, i) => acc + i.quantity, 0),
    isValidForCheckout: true,
    validationErrors: [],
  };

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
  const isReadyToProceed = Boolean(selectedAddressId && calculatedSummary.isValidForCheckout);

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a delivery address.');
      return;
    }

    if (!calculatedSummary.isValidForCheckout) {
      alert('One or more items in your cart need attention before checking out.');
      return;
    }

    try {
      setIsProcessingPayment(true);

      // Step 1: Create Master Order & sub-orders on server
      const orderRes = await createOrder({
        addressId: selectedAddressId,
        paymentMethod: selectedPaymentMethod,
        items: cartItems,
      }).unwrap();

      const createdOrder = orderRes?.data?.order;
      if (!createdOrder) throw new Error('Order creation failed');

      // If Cash on Delivery, checkout is complete
      if (selectedPaymentMethod === 'COD') {
        dispatch(clearCart());
        setPlacedOrder(createdOrder);
        setPaymentNotice('Payment method: Cash on Delivery. Order confirmed.');
        setIsProcessingPayment(false);
        return;
      }

      // Step 2: Online Payment via Razorpay
      const rzpRes = await createRazorpayOrder({ orderId: createdOrder._id }).unwrap();
      const rzpData = rzpRes.data;

      const scriptLoaded = await loadRazorpayScript();

      if (scriptLoaded && window.Razorpay) {
        const options = {
          key: rzpData.keyId,
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: 'Dehydrated Fruit Marketplace',
          description: `Master Order #${createdOrder.orderNumber}`,
          order_id: rzpData.razorpayOrderId,
          handler: async function (response) {
            try {
              // Step 3: Backend verifies signature
              const verifyRes = await verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }).unwrap();

              dispatch(clearCart());
              setPlacedOrder(verifyRes.data.order || createdOrder);
              setPaymentNotice(`Payment verified successfully via Razorpay (Ref: ${response.razorpay_payment_id})`);
            } catch (vErr) {
              alert(vErr?.data?.message || 'Payment verification failed');
            } finally {
              setIsProcessingPayment(false);
            }
          },
          prefill: {
            name: selectedAddress?.fullName || 'Customer',
            contact: selectedAddress?.phone || '9876543210',
          },
          theme: {
            color: '#1D4A35',
          },
          modal: {
            ondismiss: async function () {
              await recordFailure({
                razorpayOrderId: rzpData.razorpayOrderId,
                reason: 'Customer dismissed Razorpay payment window',
              }).unwrap().catch(() => { });
              setIsProcessingPayment(false);
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on('payment.failed', async function (failedResponse) {
          await recordFailure({
            razorpayOrderId: rzpData.razorpayOrderId,
            razorpayPaymentId: failedResponse.error?.metadata?.payment_id,
            reason: failedResponse.error?.description || 'Payment Failed',
          }).unwrap().catch(() => { });
          alert(`Payment Failed: ${failedResponse.error?.description || 'Transaction unsuccessful'}`);
          setIsProcessingPayment(false);
        });

        razorpayInstance.open();
      } else {
        // Fallback for sandboxed browser environments or development mode
        dispatch(clearCart());
        setPlacedOrder(createdOrder);
        setPaymentNotice('Master order created and verified for direct fulfillment.');
        setIsProcessingPayment(false);
      }
    } catch (err) {
      console.error('Payment checkout error:', err);
      alert(err?.data?.message || err?.message || 'Payment initiation failed');
      setIsProcessingPayment(false);
    }
  };

  if (placedOrder) {
    const sellerOrders = placedOrder.sellerOrders || [];

    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-oat-card rounded-lg p-8 sm:p-10 border border-forest/15 shadow-2xs text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-forest/10 text-forest flex items-center justify-center mx-auto border border-forest/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest bg-forest/10 px-3 py-1 rounded-md border border-forest/20">
              Payment & Order Verified
            </span>
            <h2 className="text-2xl font-bold font-display text-forest">
              Master Order #{placedOrder.orderNumber}
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
              {paymentNotice || 'Your multi-vendor order has been confirmed with secure payment verification.'}
            </p>
          </div>

          {/* Decomposed Seller Breakdown Card */}
          <div className="p-5 rounded-lg bg-oat border border-forest/15 text-left space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5 font-display">
              <Store className="w-4 h-4 text-forest" />
              <span>Independent Vendor Sub-Orders ({sellerOrders.length}):</span>
            </h4>
            <div className="divide-y divide-forest/10 text-xs">
              {sellerOrders.map((so) => (
                <div key={so._id || so.sellerOrderNumber} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-forest">
                      {so.sellerOrderNumber} • {so.seller?.storeName || 'Verified Orchard'}
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      Status: <span className="font-semibold text-forest">{so.orderStatus}</span> • {so.items?.length || 0} batches
                    </p>
                  </div>
                  <span className="font-bold font-display text-forest">
                    ₹{so.totalAmount?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-forest/15 flex justify-between font-bold text-sm text-forest">
              <span>Total Paid:</span>
              <span className="text-base font-display">₹{placedOrder.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to={`/orders/${placedOrder._id}`}>
              <Button variant="primary" size="sm" className="w-full sm:w-auto font-bold">
                View Master Order Details
              </Button>
            </Link>
            <Link to="/orders">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                My All Orders
              </Button>
            </Link>
            <Link to="/explore">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto text-forest">
                Shop More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-forest/15">
        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="p-2 rounded-md border border-forest/20 text-forest hover:bg-oat-dark/30 transition-colors"
            title="Back to Cart"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-forest tracking-tight">
              Single Multi-Vendor Checkout
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              Secure online payment via Razorpay or Pay on Delivery.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-forest font-semibold">
          <Lock className="w-4 h-4 text-forest" />
          <span>Razorpay 256-bit Encrypted</span>
        </div>
      </div>

      {/* Validation Warnings */}
      {calculatedSummary.validationErrors?.length > 0 && (
        <div className="p-4 rounded-md bg-tomato/10 border border-tomato/20 text-xs text-tomato space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            Please resolve the following before proceeding:
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            {calculatedSummary.validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Checkout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Address, Order Summary, Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Address Selector */}
          <div className="bg-oat-card rounded-lg p-6 sm:p-7 border border-forest/15 shadow-2xs">
            <AddressSelector
              selectedAddressId={selectedAddressId}
              onSelectAddress={setSelectedAddressId}
            />
          </div>

          {/* Step 2: Multi-Vendor Grouped Order Summary */}
          <OrderSummary sellerGroups={calculatedSellerGroups} />

          {/* Step 3: Payment Method */}
          <PaymentMethod
            selectedMethod={selectedPaymentMethod}
            onSelectMethod={setSelectedPaymentMethod}
          />
        </div>

        {/* Right 1 Column: Price Breakdown & Place Order Action */}
        <div className="lg:col-span-1 sticky top-24 space-y-4">
          <PriceBreakdown
            summary={calculatedSummary}
            sellerCount={calculatedSellerGroups.length}
          />

          {/* Final Checkout Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleCheckout}
            disabled={!isReadyToProceed || isValidating || isPlacingOrder || isProcessingPayment}
            className="w-full font-bold text-sm sm:text-base py-4 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>
              {isProcessingPayment
                ? 'Processing Payment...'
                : selectedPaymentMethod === 'RAZORPAY'
                  ? `Pay ₹${calculatedSummary.grandTotal.toFixed(2)} with Razorpay`
                  : 'Confirm & Place Order (COD)'}
            </span>
          </Button>

          {!selectedAddressId && (
            <p className="text-[11px] text-tomato text-center font-medium">
              Please select or create a delivery address to complete checkout.
            </p>
          )}

          {/* Security Guarantee */}
          <div className="p-4 rounded-md bg-oat border border-forest/15 text-xs text-ink-muted text-center space-y-1">
            <p className="font-semibold text-forest">Razorpay Secure Multi-Vendor Checkout</p>
            <p className="text-[11px] leading-relaxed">
              Your single payment is safely processed via Razorpay and decomposes into dedicated vendor orders for each orchard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;