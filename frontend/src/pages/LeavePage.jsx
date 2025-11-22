import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialLeaves = [
  // ...existing code removed, will fetch from backend
];

const LeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ type: '', reason: '' });

  // Fetch leaves from backend on mount
  React.useEffect(() => {
    fetch('http://localhost:8001/api/leave')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLeaves(data.map(l => ({ type: l.type, reason: l.reason, status: l.status })));
        }
      });
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    await fetch('http://localhost:8001/api/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, status: 'pending' })
    });
    setForm({ type: '', reason: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Leave Module</h1>
      <ModuleList title="Leave Requests" items={leaves.map(l => `${l.type}: ${l.reason} - ${l.status}`)} />
      <form className="my-4" onSubmit={handleSubmit}>
        <input name="type" value={form.type} onChange={handleChange} placeholder="Type" required className="border p-2 mr-2" />
        <input name="reason" value={form.reason} onChange={handleChange} placeholder="Reason" required className="border p-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Request Leave</button>
      </form>
    </div>
  );
};

export default LeavePage;
