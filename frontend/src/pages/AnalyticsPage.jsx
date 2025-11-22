import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialAnalytics = [
  { type: 'Attendance', data: '95%' },
  { type: 'Placement', data: '80%' },
];

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [form, setForm] = useState({ type: '', data: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setAnalytics([...analytics, { ...form }]);
    setForm({ type: '', data: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Analytics Module</h1>
      <ModuleList title="Analytics" items={analytics.map(a => `${a.type}: ${a.data}`)} />
      <form className="my-4" onSubmit={handleSubmit}>
        <input name="type" value={form.type} onChange={handleChange} placeholder="Type" required className="border p-2 mr-2" />
        <input name="data" value={form.data} onChange={handleChange} placeholder="Data" required className="border p-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add Analytics</button>
      </form>
    </div>
  );
};

export default AnalyticsPage;
