'use client'; // Mark this as a Client Component

import React from 'react';

import Invoice from '@/components/Invoice';

const Form = () => {
 
 return (
    <div style={{ padding: '20px' }}>
      <button>Go to Invoice</button>
      <Invoice />
    </div>
  );
};

export default Form;
