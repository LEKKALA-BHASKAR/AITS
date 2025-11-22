import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialMentoring = [
  { mentor: 'Dr. Rao', mentee: 'Sita', status: 'active' },
  { mentor: 'Ms. Priya', mentee: 'Ram', status: 'completed' },
];

const MentoringPage = () => {
  const [mentoring, setMentoring] = useState(initialMentoring);
  const [form, setForm] = useState({ mentor: '', mentee: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setMentoring([...mentoring, { ...form, status: 'active' }]);
    setForm({ mentor: '', mentee: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Mentoring Module</h1>
      <ModuleList title="Mentoring" items={mentoring.map(m => `${m.mentor} → ${m.mentee} - ${m.status}`)} />
      <form className="my-4" onSubmit={handleSubmit}>
        <input name="mentor" value={form.mentor} onChange={handleChange} placeholder="Mentor" required className="border p-2 mr-2" />
        <input name="mentee" value={form.mentee} onChange={handleChange} placeholder="Mentee" required className="border p-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add Mentoring</button>
      </form>
    </div>
  );
};

export default MentoringPage;
