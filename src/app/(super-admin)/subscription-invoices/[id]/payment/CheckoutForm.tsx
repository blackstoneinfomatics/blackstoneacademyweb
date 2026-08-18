'use client';

import React, { useState } from 'react';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { StripeCardNumberElementChangeEvent } from '@stripe/stripe-js';
import { CreditCard } from 'lucide-react';
import { AppApiEndpoints } from '@/app/_components/contents/api-endpoints';

interface CheckoutFormProps {
  clientSecret: string;
  invoice?: any;
  onClose?: () => void;
}

type LocalCardBrand =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'discover'
  | 'diners'
  | 'jcb'
  | 'unionpay'
  | 'rupay'
  | 'unknown';

const getCardLogo = (brand: LocalCardBrand): string => {
  const logos: Record<LocalCardBrand, string> = {
    visa: 'https://img.icons8.com/color/48/visa.png',
    mastercard: 'https://img.icons8.com/color/48/mastercard-logo.png',
    amex: 'https://img.icons8.com/color/48/amex.png',
    discover: 'https://img.icons8.com/color/48/discover.png',
    diners: 'https://img.icons8.com/color/48/diners-club.png',
    jcb: 'https://img.icons8.com/color/48/jcb.png',
    unionpay: 'https://img.icons8.com/color/48/unionpay.png',
    rupay: '/assets/images/icons8-rupay-48.png',
    unknown: '',
  };
  return logos[brand] || '';
};

const detectBrandWithRupayOverride = (
  event: StripeCardNumberElementChangeEvent,
): LocalCardBrand => {
  const value = (event as any)?.value || '';
  const bin = value.replace(/\D/g, '').slice(0, 6);
  const stripeBrand = event.brand;

  if (
    stripeBrand === 'unionpay' ||
    stripeBrand === 'unknown' ||
    /^(508|60|65|6521|6522|81|82)/.test(bin)
  ) {
    return 'rupay';
  }

  return stripeBrand as LocalCardBrand;
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, invoice, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [cardBrand, setCardBrand] = useState<LocalCardBrand>('unknown');
  const [zip, setZip] = useState('');
  const [method, setMethod] = useState<'card' | 'upi'>('card');
  const [upiId, setUpiId] = useState('');

  const handleCardChange = (event: StripeCardNumberElementChangeEvent) => {
    const detected = detectBrandWithRupayOverride(event);
    setCardBrand(detected);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage('');

    const cardNumberElement = elements.getElement(CardNumberElement);
    const expiryElement = elements.getElement(CardExpiryElement);
    const cvcElement = elements.getElement(CardCvcElement);

    if (!cardNumberElement || !expiryElement || !cvcElement) {
      setMessage('Payment elements not ready. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: { address: { postal_code: zip } },
        },
      });

      if (error) {
        setMessage(error.message ?? 'An unexpected error occurred.');
      } else if (paymentIntent?.status === 'succeeded') {
        console.log("invoice._id", invoice);
        const payload = { invoiceId:invoice._id,  paymentIntentResponse: paymentIntent };
        console.log('Payment succeeded:', payload);
        const backendRes = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PAYMENT.CREATE_SUPERADMIN_SUBSCRIPTION}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          payload: {
            invoiceId:invoice.invoiceId,  paymentIntentResponse: paymentIntent 
          },
        }),
        });

        if (backendRes.ok) setMessage('✅ Payment successful!');
        else setMessage('❌ Backend failed to confirm payment.');
      }
    } catch (err) {
      setMessage('❌ Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpiPay = async () => {
    setMessage('');
    if (!upiId) {
      setMessage('Please enter a valid UPI ID.');
      return;
    }

    setLoading(true);
    try {
      const amount = invoice?.totalAmount || 0;
      const payload = { amount: amount * 100, currency: 'usd', payment_method_type: 'upi', upi_id: upiId };
      const res = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PAYMENT.CREATE_SUPERADMIN_SUBSCRIPTION}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.clientSecret) {
        setMessage('UPI payment initiated. Follow the instructions sent to your UPI app.');
      } else if (!res.ok) {
        setMessage(data?.message || 'Failed to initiate UPI payment.');
      } else {
        setMessage('UPI flow started. Complete payment in your UPI app.');
      }
    } catch (err) {
      setMessage('Failed to start UPI payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="fixed inset-0 bg-black/40" onClick={() => onClose?.()} />

      <div className="relative w-full max-w-2xl mx-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="flex items-center text-lg font-semibold text-[#223857]"><CreditCard className="w-5 h-5 mr-2 text-[#223857]"/> Payment</h3>
            <button onClick={() => onClose?.()} className="text-gray-600 hover:text-gray-800">✕</button>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <label className="inline-flex items-center mr-4">
                <input type="radio" name="method" className="mr-2" checked={method === 'card'} onChange={() => setMethod('card')} /> Card
              </label>
              <label className="inline-flex items-center">
                <input type="radio" name="method" className="mr-2" checked={method === 'upi'} onChange={() => setMethod('upi')} /> UPI
              </label>
            </div>

            {method === 'card' && (
              <form onSubmit={handleSubmit}>
                <label className="block text-sm font-medium text-gray-800 mb-1">Card Number</label>
                <div className="relative border rounded-md px-3 py-2 mb-4 flex items-center bg-white">
                  <CardNumberElement options={{ style: { base: { fontSize: '14px', color: '#2d3748', '::placeholder': { color: '#a0aec0' } }, invalid: { color: '#e53e3e' } } }} onChange={handleCardChange} className="w-full" />
                  {cardBrand && cardBrand !== 'unknown' && getCardLogo(cardBrand) && (
                    <img src={getCardLogo(cardBrand)} alt={cardBrand} className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-auto max-w-[40px]" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Expiration Date</label>
                    <div className="border rounded-md px-3 py-2 text-sm text-gray-800 bg-white"><CardExpiryElement options={{ style: { base: { fontSize: '14px', color: '#2d3748', '::placeholder': { color: '#a0aec0' } }, invalid: { color: '#e53e3e' } } }} /></div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Security Code</label>
                    <div className="border rounded-md px-3 py-2 text-sm text-gray-800 bg-white"><CardCvcElement options={{ style: { base: { fontSize: '14px', color: '#2d3748', '::placeholder': { color: '#a0aec0' } }, invalid: { color: '#e53e3e' } } }} /></div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-800 mb-1">ZIP Code</label>
                  <input type="text" maxLength={6} pattern="\d{6}" required value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))} placeholder="123456" className="w-full border rounded-md px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <hr className="my-6" />

                <button type="submit" disabled={!stripe || loading} className={`w-full py-2 px-4 rounded text-white font-bold transition-colors ${!stripe || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {loading ? 'Processing...' : 'Pay Now'}
                </button>
              </form>
            )}

            {method === 'upi' && (
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">UPI ID</label>
                <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="example@bank" className="w-full border rounded-md px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4" />

                <button onClick={handleUpiPay} disabled={loading} className={`w-full py-2 px-4 rounded text-white font-bold transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                  {loading ? 'Initiating UPI...' : 'Pay with UPI'}
                </button>
              </div>
            )}

            {message && <p className={`mt-4 text-center text-sm ${message.includes('success') || message.includes('initiated') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
// import React, { useState } from 'react';
// import {
//   CardNumberElement,
//   CardExpiryElement,
//   CardCvcElement,
//   useStripe,
//   useElements,
// } from '@stripe/react-stripe-js';
// import type { StripeCardNumberElementChangeEvent } from '@stripe/stripe-js';
// import { CreditCard } from 'lucide-react';import { loadStripe } from '@stripe/stripe-js';

// const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// if (!stripePublishableKey) {
//   console.warn(
//     'Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable. Set it in your .env.local or environment.'
//   );
// }

// const stripePromise = loadStripe(stripePublishableKey);



// interface CheckoutFormProps {
//   clientSecret: string;
//   evaluationId?: string;
// }

// type LocalCardBrand =
//   | 'visa'
//   | 'mastercard'
//   | 'amex'
//   | 'discover'
//   | 'diners'
//   | 'jcb'
//   | 'unionpay'
//   | 'rupay'
//   | 'unknown';

// const getCardLogo = (brand: LocalCardBrand): string => {
//   const logos: Record<LocalCardBrand, string> = {
//     visa: 'https://img.icons8.com/color/48/visa.png',
//     mastercard: 'https://img.icons8.com/color/48/mastercard-logo.png',
//     amex: 'https://img.icons8.com/color/48/amex.png',
//     discover: 'https://img.icons8.com/color/48/discover.png',
//     diners: 'https://img.icons8.com/color/48/diners-club.png',
//     jcb: 'https://img.icons8.com/color/48/jcb.png',
//     unionpay: 'https://img.icons8.com/color/48/unionpay.png',
//     rupay: '/assets/images/icons8-rupay-48.png',
//     unknown: '',
//   };
//   return logos[brand] || '';
// };

// const detectBrandWithRupayOverride = (
//   event: StripeCardNumberElementChangeEvent
// ): LocalCardBrand => {
//   const value = (event as any)?.value || '';
//   const bin = value.replace(/\D/g, '').slice(0, 6);
//   const stripeBrand = event.brand;

//   if (
//     stripeBrand === 'unionpay' ||
//     stripeBrand === 'unknown' ||
//     /^(508|60|65|6521|6522|81|82)/.test(bin)
//   ) {
//     return 'rupay';
//   }

//   return stripeBrand as LocalCardBrand;
// };

// const CheckoutForm: React.FC = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string>('');

//   const handleClick = async () => {
//     setLoading(true);
//     setError('');

//     const stripe = await stripePromise;

//     if (!stripe) {
//       setError('Stripe initialization failed');
//       setLoading(false);
//       return;
//     }

//     const sessionId = 'your_predefined_session_id_here'; // Replace this with your predefined session ID

//     const { error } = await stripe.redirectToCheckout({ sessionId });

//     if (error) {
//       // Providing a fallback value in case error.message is undefined
//       setError(error.message   ?? 'An unexpected error occurred');
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="p-96 bg-slate-400">
//       <button onClick={handleClick} disabled={loading}>
//         {loading ? 'Processing...' : 'Pay'}
//       </button>
//       {error && <div className="text-red-600 mt-4">{error}</div>}
//     </div>
//   );
// };

// export default CheckoutForm;
