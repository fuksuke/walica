import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import GroupDetails from './pages/GroupDetails';
import AddPayment from './pages/AddPayment';
import JoinGroup from './pages/JoinGroup';
import EditPayment from './pages/EditPayment';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/group/:id" element={<GroupDetails />} />
      <Route path="/group/:id/add-payment" element={<AddPayment />} />
      <Route path="/group/:groupId/payment/:paymentId/edit" element={<EditPayment />} />
      <Route path="/invite/:id" element={<JoinGroup />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
