import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialFeedbacks = [
  // ...existing code removed, will fetch from backend
];

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm] = useState({ message: '', rating: '' });

  // Fetch feedbacks from backend on mount
  React.useEffect(() => {
    fetch('http://localhost:8001/api/feedback')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeedbacks(data.map(f => ({ message: f.message, rating: f.rating })));
        }
      });
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    await fetch('http://localhost:8001/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ message: '', rating: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Feedback Module</h1>
      <ModuleList title="Feedbacks" items={feedbacks.map(f => `${f.message} (Rating: ${f.rating})`)} />
      <form className="my-4" onSubmit={handleSubmit}>
        <input name="message" value={form.message} onChange={handleChange} placeholder="Message" required className="border p-2 mr-2" />
        <input name="rating" value={form.rating} onChange={handleChange} placeholder="Rating" required className="border p-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Submit Feedback</button>
      </form>
    </div>
  );
};

export default FeedbackPage;
