import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialTimetable = [
  { day: 'Monday', period: 1, subject: 'Math' },
  { day: 'Monday', period: 2, subject: 'Physics' },
];

const TimetablePage = () => {
  const [timetable, setTimetable] = useState(initialTimetable);
  const [form, setForm] = useState({ day: '', period: '', subject: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setTimetable([...timetable, { ...form }]);
    setForm({ day: '', period: '', subject: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Timetable Module</h1>
      <ModuleList title="Timetable" items={timetable.map(t => `${t.day} Period ${t.period}: ${t.subject}`)} />
      <form className="my-4" onSubmit={handleSubmit}>
        <input name="day" value={form.day} onChange={handleChange} placeholder="Day" required className="border p-2 mr-2" />
        <input name="period" value={form.period} onChange={handleChange} placeholder="Period" required className="border p-2 mr-2" />
        <input name="subject" value={form.subject} onChange={handleChange} placeholder="Subject" required className="border p-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add Period</button>
      </form>
    </div>
  );
};

export default TimetablePage;
