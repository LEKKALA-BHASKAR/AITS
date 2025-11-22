import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialEvents = [
  { title: 'Tech Fest', date: '2025-12-01', status: 'upcoming' },
  { title: 'Sports Day', date: '2025-11-15', status: 'completed' },
];

const EventPage = () => {
  const [events, setEvents] = useState(initialEvents);
  const [form, setForm] = useState({ title: '', date: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setEvents([...events, { ...form, status: 'upcoming' }]);
    setForm({ title: '', date: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Event Module</h1>
      <ModuleList title="Events" items={events.map(e => `${e.title} (${e.date}) - ${e.status}`)} />
      <form className="my-4" onSubmit={handleSubmit}>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className="border p-2 mr-2" />
        <input name="date" value={form.date} onChange={handleChange} placeholder="Date" required className="border p-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add Event</button>
      </form>
    </div>
  );
};

export default EventPage;
