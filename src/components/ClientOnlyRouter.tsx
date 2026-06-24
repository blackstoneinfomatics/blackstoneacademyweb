'use client';

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Invoice from '@/components/Invoice';
import Form from '@/app/(tenant)/modules/users/Academic-coach/invoice/page';

const ClientOnlyRouter = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Form />} />

        <Route path="/invoice" element={<Invoice />} />
      </Routes>
    </Router>
  );
};

export default ClientOnlyRouter;
