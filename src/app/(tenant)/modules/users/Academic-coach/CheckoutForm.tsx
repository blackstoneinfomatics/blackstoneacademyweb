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
  evaluationId?: string;
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
  event: StripeCardNumberElementChangeEvent
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

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, evaluationId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [cardBrand, setCardBrand] = useState<LocalCardBrand>('unknown');
  const [zip, setZip] = useState('');

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
          billing_details: {
            address: {
              postal_code: zip,
            },
          },
        },
      });

      if (error) {
        setMessage(error.message ?? 'An unexpected error occurred.');
      } else if (paymentIntent?.status === 'succeeded') {
        const payload = {
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          evaluationId,
          paymentIntentResponse: paymentIntent,
        };

        const backendRes = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PAYMENT.CREATE_PAYMENT_INTENT}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        if (backendRes.ok) {
          setMessage('✅ Payment successful!');
        } else {
          setMessage('❌ Backend failed to confirm payment.');
        }
      }
    } catch (err: any) {
      setMessage('❌ Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200"
    >
      <h3 className="flex items-center text-lg font-semibold text-[#223857] mb-4">
        <CreditCard className="w-5 h-5 mr-2 text-[#223857]" />
        Card
      </h3>

      <label className="block text-sm font-medium text-gray-800 mb-1">Card Number</label>
      <div className="relative border rounded-md px-3 py-2 mb-4 flex items-center bg-white">
        <CardNumberElement
          options={{
            style: {
              base: {
                fontSize: '14px',
                color: '#2d3748',
                '::placeholder': { color: '#a0aec0' },
              },
              invalid: { color: '#e53e3e' },
            },
          }}
          onChange={handleCardChange}
          className="w-full"
        />
        {cardBrand && cardBrand !== 'unknown' && getCardLogo(cardBrand) && (
          <img
            src={getCardLogo(cardBrand)}
            alt={cardBrand}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-auto max-w-[40px]"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Expiration Date</label>
          <div className="border rounded-md px-3 py-2 text-sm text-gray-800 bg-white">
            <CardExpiryElement
              options={{
                style: {
                  base: {
                    fontSize: '14px',
                    color: '#2d3748',
                    '::placeholder': { color: '#a0aec0' },
                  },
                  invalid: { color: '#e53e3e' },
                },
              }}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Security Code</label>
          <div className="border rounded-md px-3 py-2 text-sm text-gray-800 bg-white">
            <CardCvcElement
              options={{
                style: {
                  base: {
                    fontSize: '14px',
                    color: '#2d3748',
                    '::placeholder': { color: '#a0aec0' },
                  },
                  invalid: { color: '#e53e3e' },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-800 mb-1">ZIP Code</label>
        <input
          type="text"
          maxLength={6}
          pattern="\d{6}"
          required
          value={zip}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/\D/g, '');
            setZip(cleaned);
          }}
          placeholder="123456"
          className="w-full border rounded-md px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <hr className="my-6" />

      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-2 px-4 rounded text-white font-bold transition-colors ${
          !stripe || loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>

      {message && (
        <p
          className={`mt-4 text-center text-sm ${
            message.includes('success') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
};

export default CheckoutForm;
