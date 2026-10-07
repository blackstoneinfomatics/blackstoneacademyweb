// StripeContainer.js
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '@/app/(tenant)/modules/users/Academic-coach/PaymentMethod/CheckoutForm';

const stripePromise = loadStripe('pk_test_51TvwAn30fjU7QKT3W0mpWEFHaZskBPeUsocU1oEg2bCQwXNVDA6a39q4cOWPvhMNoCoqaAI7bbbZxIEabj8EhrK000rtACp2rV');

const StripeContainer = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default StripeContainer;
