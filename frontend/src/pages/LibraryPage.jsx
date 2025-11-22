import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialBooks = [
  { title: 'Introduction to Algorithms', author: 'Cormen', status: 'available' },
  { title: 'Operating Systems', author: 'Silberschatz', status: 'issued' },
];

const LibraryPage = () => {
  const [books, setBooks] = useState(initialBooks);
  const [form, setForm] = useState({ title: '', author: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setBooks([...books, { ...form, status: 'available' }]);
    setForm({ title: '', author: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Library Module</h1>
      <ModuleList title="Books" items={books.map(b => `${b.title} by ${b.author} - ${b.status}`)} />
      <form className="my-4" onSubmit={handleSubmit}>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className="border p-2 mr-2" />
        <input name="author" value={form.author} onChange={handleChange} placeholder="Author" required className="border p-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add Book</button>
      </form>
    </div>
  );
};

export default LibraryPage;
