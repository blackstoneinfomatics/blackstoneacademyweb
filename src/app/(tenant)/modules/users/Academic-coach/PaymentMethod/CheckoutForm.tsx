import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51TvwAn30fjU7QKT3W0mpWEFHaZskBPeUsocU1oEg2bCQwXNVDA6a39q4cOWPvhMNoCoqaAI7bbbZxIEabj8EhrK000rtACp2rV');

const CheckoutForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleClick = async () => {
    setLoading(true);
    setError('');

    const stripe = await stripePromise;

    if (!stripe) {
      setError('Stripe initialization failed');
      setLoading(false);
      return;
    }

    const sessionId = 'your_predefined_session_id_here'; // Replace this with your predefined session ID

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      // Providing a fallback value in case error.message is undefined
      setError(error.message   ?? 'An unexpected error occurred');
    }

    setLoading(false);
  };

  return (
    <div className="p-96 bg-slate-400">
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Processing...' : 'Pay'}
      </button>
      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
};

export default CheckoutForm;
