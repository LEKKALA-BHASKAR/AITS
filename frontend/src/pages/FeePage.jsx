import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialFees = [
  { amount: 5000, status: 'unpaid' },
  { amount: 3000, status: 'paid' },
];

const FeePage = () => {
  const [fees, setFees] = useState(initialFees);
  const [form, setForm] = useState({ amount: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setFees([...fees, { ...form, status: 'unpaid' }]);
    setForm({ amount: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Fee Module</h1>
      <ModuleList title="Fees" items={fees.map(f => `₹${f.amount} - ${f.status}`)} />
      <form className="my-4" onSubmit={handleSubmit}>
        <input name="amount" value={form.amount} onChange={handleChange} placeholder="Amount" required className="border p-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add Fee</button>
      </form>
    </div>
  );
};

export default FeePage;
