import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialPortfolio = [
  // ...existing code removed, will fetch from backend
];

const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [form, setForm] = useState({ title: '', type: '' });

  // Fetch portfolio items from backend on mount
  React.useEffect(() => {
    fetch('http://localhost:8001/api/portfolio')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPortfolio(data.map(p => ({ title: p.title, type: p.type, status: p.status })));
        }
      });
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    await fetch('http://localhost:8001/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, status: 'draft' })
    });
    setForm({ title: '', type: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Portfolio Module</h1>
      <ModuleList title="Portfolio Items" items={portfolio.map(p => `${p.title} (${p.type}) - ${p.status}`)} />
      <form className="my-4" onSubmit={handleSubmit}>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className="border p-2 mr-2" />
        <input name="type" value={form.type} onChange={handleChange} placeholder="Type" required className="border p-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add Item</button>
      </form>
    </div>
  );
};

export default PortfolioPage;
