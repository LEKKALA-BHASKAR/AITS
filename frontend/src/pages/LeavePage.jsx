import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialLeaves = [
  { type: 'Sick', reason: 'Fever', status: 'pending' },
  { type: 'Casual', reason: 'Family event', status: 'approved' },
];

const LeavePage = () => {
  const [leaves, setLeaves] = useState(initialLeaves);
  const [form, setForm] = useState({ type: '', reason: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setLeaves([...leaves, { ...form, status: 'pending' }]);
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
