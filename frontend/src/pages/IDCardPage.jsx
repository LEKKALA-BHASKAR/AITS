import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialIDCards = [
  // ...existing code removed, will fetch from backend
];

const IDCardPage = () => {
  const [idCards, setIDCards] = useState([]);
  const [form, setForm] = useState({ cardNumber: '' });

  // Fetch ID cards from backend on mount
  React.useEffect(() => {
    fetch('http://localhost:8001/api/idcard')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setIDCards(data.map(i => ({ cardNumber: i.cardNumber, status: i.status })));
        }
      });
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    await fetch('http://localhost:8001/api/idcard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, status: 'active' })
    });
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
