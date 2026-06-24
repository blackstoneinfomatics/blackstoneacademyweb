
'use client'; // Mark this as a Client Component


import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/app/(tenant)/modules/users/Academic-coach/CheckoutForm';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { AppApiEndpoints } from '@/app/_components/contents/api-endpoints';

const stripePromise = loadStripe('pk_test_51LilJwCsMeuBsi2YvvK4gor68JPLEOcF2KIt1GuO8qplGSzCSjKTI2BYZ7Z7XLKD1VA8riExXLOT73YHQIA8wbUJ000VrpQkNE');

interface Student {
  studentFirstName: string;
  studentLastName: string;
  learningInterest: string;
  studentCountry: string;
  studentEmail: string;
  studentCountryCode: string;
  studentPhone: string;
}

interface Subscription {
  subscriptionName: string;
  subscriptionPricePerHr: number;
  subscriptionDays: number;
}

interface InvoiceData {
  student: Student;
  subscription: Subscription;
  hours: number;
  planTotalPrice: number;
}

const Invoice = () => {
  const searchParams = useSearchParams(); // Use useSearchParams to access query params
  const studentId = searchParams.get('id'); // Get the student ID from the query string
  const [invoiceshow, setInvoiceShow] = useState(true); // Value and setter pair
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null); // Value and setter pair
  const [loading, setLoading] = useState(true); // Value and setter pair
  const [error, setError] = useState<string | null>(null); // Value and setter pair
  const [evaluationData, setEvaluationData] = useState<any>(null); // Value and setter pair
  const [clientSecret, setClientSecret] = useState(''); // Value and setter pair
  const [showPayment, setShowPayment] = useState(false); // Value and setter pair
  const invoiceDate = new Date().toLocaleDateString();

  const fetchInvoiceData = async (studentId: string) => {
    if (!studentId) {
      setError('Student ID is missing.');
      setLoading(false);
      return;
    }

    try {
     
      const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.EVALUATION.GET_LIST}/${studentId}`, {
        headers: {
          'Content-Type': 'application/json',
          
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setEvaluationData(data);
      return data;
    } catch (err: any) {
      console.error('Error fetching invoice data:', err.message);
      setError('Unable to fetch invoice data. Please try again later.');
    }
  };

  useEffect(() => {
    if (studentId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const data = await fetchInvoiceData(studentId);
          setInvoiceData(data);
        } catch (err) {
          setError('Failed to load invoice data.');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setError('No student ID provided in the URL.');
      setLoading(false);
    }
  }, [studentId]);

  if (loading) {
    return <div>Loading invoice...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!invoiceData) {
    return <div>No invoice data found.</div>;
  }

  const { student, subscription, hours, planTotalPrice } = invoiceData;
  const fullName = `${student.studentFirstName} ${student.studentLastName}`;
  const courseName = student.learningInterest;
  const packageName = subscription.subscriptionName;
  const amountPerHour = subscription.subscriptionPricePerHr;
  const totalAmount = planTotalPrice;
  const feesPerDay = amountPerHour * hours;
  const subscriptionDuration = subscription.subscriptionDays;
  const country = student.studentCountry;
  const email = student.studentEmail;
  const phoneNumber = `${student.studentCountryCode} ${student.studentPhone}`;
console.log(feesPerDay);
  const handleClick = async () => {
    const evaluationid = evaluationData._id; // Replace with your actual evaluation ID
    const totalprice = evaluationData.planTotalPrice;
   
    const response = await fetch(`${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.PAYMENT.CREATE_PAYMENT_INTENT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        
      },
      body: JSON.stringify({ amount: totalprice * 100, currency: 'usd', evaluationId: evaluationid, paymentIntentResponse: '' }),
    });
    const data = await response.json();
    setClientSecret(data.clientSecret);
    setShowPayment(true);
    setInvoiceShow(false);
  };

  return (
    <div className="invoice-container">
      {invoiceshow && (
        <div style={{ fontFamily: 'Arial, sans-serif' }} className="bg-[#f9f9f9] p-6 rounded-lg w-[900px] ml-72">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Image src="/assets/images/bsicon.png" width={150} height={150} className="p-6 w-52" alt="AL FURQAN Academy" />
            <div className="text-right p-10">
              <h2 className="text-right text-[30px]">INVOICE</h2>
              <p className="text-right text-[13px]">Invoice# AFA-24E928E-869</p>
            </div>
          </div>
          <div style={{ backgroundColor: '#f9f9f9', padding: '30px' }}>
            <p>
              <strong>BILL TO:</strong>
            </p>
            <p className="text-[13px] mb-14">
              {fullName}
              <br />
              Contact: {phoneNumber}
              <br />
              Email: <a href={`mailto:${email}`}>{email}</a>
            </p>
            <p className="text-right -mt-28 text-[13px]">
              Invoice Date: {invoiceDate}
              <br />
              Terms: Due on 2 days
              <br />
              Invoice Due Date: {subscriptionDuration}
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr className="bg-[#273450] text-white text-center">
                  <th style={{ padding: '10px' }}>#</th>
                  <th style={{ padding: '10px' }}>Item & Description</th>
                  <th style={{ padding: '10px' }}>Country</th>
                  <th style={{ padding: '10px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px' }} className="text-center border-b-2">
                    1
                  </td>
                  <td style={{ padding: '10px' }} className="text-center border-b-2">
                    {courseName} / {packageName}
                  </td>
                  <td style={{ padding: '10px' }} className="text-center border-b-2">
                    {country}
                  </td>
                  <td style={{ padding: '10px' }} className="text-center border-b-2">
                    ${totalAmount}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="ml-[610px]" style={{ fontWeight: 'bold', marginTop: '10px' }}>
              Sub Total &nbsp;&nbsp;&nbsp;${totalAmount}
            </p>

            <p className="ml-[645px]" style={{ fontWeight: 'bold', marginTop: '10px' }}>
              Total &nbsp;&nbsp;&nbsp;${totalAmount}
            </p>

            {/* Payment Button */}
            <div className="ml-[630px] mt-6">
              <button
                onClick={handleClick}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2c3e50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Pay Now
              </button>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px' }}>
            <p>Powered by AL Furqan</p>
          </div>
        </div>
      )}
      {/* Payment Form */}
      {showPayment && clientSecret && (
        <div className="payment-form-container mt-6">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm clientSecret={clientSecret} evaluationId={evaluationData._id} />
          </Elements>
        </div>
      )}
    </div>
  );
};

export default Invoice;
