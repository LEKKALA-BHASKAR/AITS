import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialHostels = [
  // ...existing code removed, will fetch from backend
];

const HostelPage = () => {
  const [hostels, setHostels] = useState([]);
  const [form, setForm] = useState({ name: '', location: '' });

  // Fetch hostels from backend on mount
  React.useEffect(() => {
    fetch('http://localhost:8001/api/hostel')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHostels(data.map(h => ({ name: h.name, location: h.location, status: h.status })));
        }
      });
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    await fetch('http://localhost:8001/api/hostel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, status: 'active' })
    });
    setForm({ name: '', location: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Hostel Module</h1>
      <ModuleList title="Hostels" items={hostels.map(h => `${h.name} (${h.location}) - ${h.status}`)} />
      <form className="my-4" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required className="border p-2 mr-2" />
        <input name="location" value={form.location} onChange={handleChange} placeholder="Location" required className="border p-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add Hostel</button>
      </form>
    </div>
  );
};

export default HostelPage;
