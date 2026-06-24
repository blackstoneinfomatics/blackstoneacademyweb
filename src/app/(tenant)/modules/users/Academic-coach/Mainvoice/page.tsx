'use client';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/app/(tenant)/modules/users/Academic-coach/CheckoutForm';
import { AppApiEndpoints } from '@/app/_components/contents/api-endpoints';



const stripePromise = loadStripe('pk_test_51LilJwCsMeuBsi2YvvK4gor68JPLEOcF2KIt1GuO8qplGSzCSjKTI2BYZ7Z7XLKD1VA8riExXLOT73YHQIA8wbUJ000VrpQkNE');

const HomePage = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [evaluationId, setEvaluationId] = useState<string | null>(null);

  const createPaymentIntent = async () => {
   
    const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PAYMENT.CREATE_PAYMENT_INTENT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        
      },
      body: JSON.stringify({ amount: 5000, currency: 'usd' }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetch response:', data); // Log the response here
    console.log("Received clientSecret:", data.clientSecret);
    setClientSecret(data.clientSecret);

    // Set evaluationId based on your business logic
    setEvaluationId(data.evaluationId || 'default-evaluation-id');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Stripe Payment
        </h1>
        <button
          onClick={createPaymentIntent}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Start Payment
        </button>
        {clientSecret && evaluationId && (
          <div className="mt-6">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} evaluationId={evaluationId} />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
