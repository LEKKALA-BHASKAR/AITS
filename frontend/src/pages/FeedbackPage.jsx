import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialFeedbacks = [
  { message: 'Great teaching!', rating: 5 },
  { message: 'Needs more examples.', rating: 3 },
];

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
  const [form, setForm] = useState({ message: '', rating: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setFeedbacks([...feedbacks, { ...form }]);
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
