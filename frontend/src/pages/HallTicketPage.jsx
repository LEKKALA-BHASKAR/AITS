import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialHallTickets = [
  { examName: 'Midterm', status: 'active' },
  { examName: 'Finals', status: 'inactive' },
];

const HallTicketPage = () => {
  const [hallTickets, setHallTickets] = useState(initialHallTickets);
  const [form, setForm] = useState({ examName: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setHallTickets([...hallTickets, { ...form, status: 'active' }]);
    setForm({ examName: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">HallTicket Module</h1>
      <ModuleList title="Hall Tickets" items={hallTickets.map(h => `${h.examName} - ${h.status}`)} />
      <form className="my-4" onSubmit={handleSubmit}>
        <input name="examName" value={form.examName} onChange={handleChange} placeholder="Exam Name" required className="border p-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Issue Hall Ticket</button>
      </form>
    </div>
  );
};

export default HallTicketPage;
