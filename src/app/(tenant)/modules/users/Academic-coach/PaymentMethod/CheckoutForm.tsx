import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51BTUDGJAJfZb9HEBwDg86TN1KNprHjkfipXmEDMb0gSCassK5T3ZfxsAbcgKVmAIXF7oZ6ItlZZbXO6idTHE67IM007EwQ4uN3');

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
