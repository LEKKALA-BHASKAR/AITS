import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialIDCards = [
  { cardNumber: 'AITS2025001', status: 'active' },
  { cardNumber: 'AITS2025002', status: 'inactive' },
];

const IDCardPage = () => {
  const [idCards, setIDCards] = useState(initialIDCards);
  const [form, setForm] = useState({ cardNumber: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setIDCards([...idCards, { ...form, status: 'active' }]);
    setForm({ cardNumber: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">IDCard Module</h1>
      <ModuleList title="ID Cards" items={idCards.map(i => `${i.cardNumber} - ${i.status}`)} />
      <form className="my-4" onSubmit={handleSubmit}>
        <input name="cardNumber" value={form.cardNumber} onChange={handleChange} placeholder="Card Number" required className="border p-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add ID Card</button>
      </form>
    </div>
  );
};

export default IDCardPage;
