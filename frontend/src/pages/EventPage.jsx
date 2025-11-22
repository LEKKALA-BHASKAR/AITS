import React, { useState } from 'react';
import { useEffect } from 'react';
import io from 'socket.io-client';
import ModuleList from '../components/ModuleList';

const initialEvents = [
  // ...existing code removed, will fetch from backend
];

const EventPage = () => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', date: '' });

  // Socket.IO client setup
  useEffect(() => {
    // Fetch events from backend
    fetch('http://localhost:8001/api/events')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data.map(e => ({ title: e.title, date: e.date, status: 'upcoming' })));
        }
      });

    const socket = io('http://localhost:8001');
    socket.on('eventUpdated', event => {
      setEvents(prev => [
        { title: event.title, date: event.date, status: 'upcoming' },
        ...prev
      ]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    await fetch('http://localhost:8001/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
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
