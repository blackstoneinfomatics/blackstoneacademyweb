'use client';

import React from 'react';
import { toast } from "react-toastify";
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { AppFailureToastMessages } from "@/app/_components/contents/toast_message";

type StripePaymentFormProps = {
  onPaymentSuccess: (token: any) => void;
};

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      console.error('Card element not found');
      toast.error(AppFailureToastMessages.PAYMENT_ELEMENT_UNAVAILABLE);
      return;
    }

    try {
      const { token, error } = await stripe.createToken(cardElement);

      if (error) {
        console.error(error);
        toast.error(error.message || AppFailureToastMessages.PAYMENT_PROCESSING_FAILED);
      } else {
        onPaymentSuccess(token);
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      toast.error(AppFailureToastMessages.PAYMENT_PROCESSING_FAILED);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <CardElement />
      </div>
      <button
        type="submit"
        disabled={!stripe}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Pay Now
      </button>
    </form>
  );
};

export default StripePaymentForm;
