import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialPortfolio = [
  { title: 'Personal Website', type: 'web', status: 'published' },
  { title: 'Mobile App', type: 'app', status: 'draft' },
];

const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [form, setForm] = useState({ title: '', type: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setPortfolio([...portfolio, { ...form, status: 'draft' }]);
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
