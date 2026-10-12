import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { orderService } from '../../services/order.service';
import { paymentService } from '../../services/payment.service';
import { env } from '../../config/env';
import { ShippingAddress } from '../../types/order.types';
import { useAuth } from '../../hooks/useAuth';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const cart = useSelector((state: RootState) => state.cart.cart);

  const [address, setAddress] = useState<ShippingAddress>({
    recipientName: user?.fullName || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN',
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const subtotal = cart?.subtotal || 0;
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const shipping = subtotal >= 50 ? 0 : 5.0;
  const total = subtotal + tax + shipping;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.recipientName || !address.addressLine1 || !address.city || !address.postalCode) {
      setError('Please fill in all required shipping address fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (paymentMethod === 'card' || paymentMethod === 'upi') {
        // Razorpay Online Payment Flow
        if (!(window as any).Razorpay) {
          throw new Error('Razorpay payment gateway failed to load. Please check your internet connection.');
        }

        const rzpOrder = await paymentService.createOrder();

        const options = {
          key: rzpOrder.keyId || env.razorpayKeyId,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency || 'INR',
          name: 'NovaMarket',
          description: `Order Payment (${cart?.items?.length || 1} items)`,
          order_id: rzpOrder.orderId,
          prefill: {
            name: address.recipientName,
            email: user?.email || '',
            contact: address.phone || '',
          },
          theme: {
            color: '#4f46e5',
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
            },
          },
          handler: async function (response: any) {
            try {
              setSubmitting(true);
              const order = await paymentService.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                shippingAddress: address,
              });
              navigate(`/order-success/${order.orderNumber}`);
            } catch (verifyErr: any) {
              setError(verifyErr.response?.data?.message || verifyErr.message || 'Payment verification failed.');
              setSubmitting(false);
            }
          },
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.on('payment.failed', function (resp: any) {
          setError(resp.error?.description || 'Payment failed. Please try again.');
          setSubmitting(false);
        });
        razorpayInstance.open();
      } else {
        // Cash on Delivery Flow
        const order = await orderService.checkout(address, 'cod');
        navigate(`/order-success/${order.orderNumber}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Checkout failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Checkout</h1>
        <p className="text-sm text-slate-500 mt-1">Complete your delivery address and choose a payment method</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Address & Payment selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Shipping Address */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" /> 1. Shipping Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={address.recipientName}
                  onChange={(e) => setAddress({ ...address, recipientName: e.target.value })}
                  placeholder="Full name"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={address.addressLine1}
                  onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                  placeholder="House number, street name"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Apt, suite, unit (optional)</label>
                <input
                  type="text"
                  value={address.addressLine2}
                  onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                  placeholder="Apartment, suite, or floor"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="City"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State / Province *</label>
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="State"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code *</label>
                <input
                  type="text"
                  required
                  value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  placeholder="Postal Code"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  disabled
                  value="United States (US)"
                  className="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" /> 2. Payment Method
            </h2>

            <div className="space-y-3">
              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800">Credit / Debit Card (Razorpay)</p>
                    <p className="text-xs text-slate-500">Visa, Mastercard, RuPay, Amex via Razorpay</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-600">Instant</span>
              </label>

              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800">UPI / QR Code (Razorpay)</p>
                    <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, BHIM via Razorpay</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-600">Instant</span>
              </label>

              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800">Cash on Delivery (COD)</p>
                    <p className="text-xs text-slate-500">Pay cash upon delivery at your doorstep</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500">Standard</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Confirmation */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Cart Review</h2>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-slate-100">
            {cart?.items.map((i) => (
              <div key={i.id} className="pt-2 flex justify-between text-xs">
                <span className="text-slate-700 font-medium">
                  {i.product?.name} × {i.quantity}
                </span>
                <span className="font-bold text-slate-900">
                  ${((i.product?.discountPrice ?? i.product?.price ?? 0) * i.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2.5 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (18%)</span>
              <span className="font-semibold text-slate-900">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-slate-900">
                {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between text-lg font-bold text-slate-900">
              <span>Order Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {submitting ? 'Processing Order...' : `Pay $${total.toFixed(2)} & Place Order`}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            256-Bit SSL Encrypted Verification
          </div>
        </div>
      </form>
    </div>
  );
};
