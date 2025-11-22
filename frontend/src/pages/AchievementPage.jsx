import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialAchievements = [
  {
    title: 'Math Olympiad Winner',
    type: 'olympiad',
    status: 'approved',
    tags: ['math', 'competition'],
    certificateUrl: 'https://example.com/cert1.pdf',
  },
  {
    title: 'Hackathon Finalist',
    type: 'hackathon',
    status: 'pending',
    tags: ['coding', 'teamwork'],
    certificateUrl: '',
  },
];

const AchievementPage = () => {
  const [achievements, setAchievements] = useState(initialAchievements);
  const [form, setForm] = useState({ title: '', type: 'other', tags: '', certificateUrl: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setAchievements([...achievements, { ...form, tags: form.tags.split(',').map(t => t.trim()), status: 'pending' }]);
    setForm({ title: '', type: 'other', tags: '', certificateUrl: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Achievement Module</h1>
      <ModuleList title="Achievements" items={achievements.map(a => `${a.title} (${a.type}) - ${a.status}`)} />
      <form className="my-4" onSubmit={handleSubmit}>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className="border p-2 mr-2" />
        <select name="type" value={form.type} onChange={handleChange} className="border p-2 mr-2">
          <option value="olympiad">Olympiad</option>
          <option value="hackathon">Hackathon</option>
          <option value="publication">Publication</option>
          <option value="patent">Patent</option>
          <option value="course">Course</option>
          <option value="other">Other</option>
        </select>
        <input name="tags" value={form.tags} onChange={handleChange} placeholder="Tags (comma separated)" className="border p-2 mr-2" />
        <input name="certificateUrl" value={form.certificateUrl} onChange={handleChange} placeholder="Certificate URL" className="border p-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add Achievement</button>
      </form>
    </div>
  );
};

export default AchievementPage;
