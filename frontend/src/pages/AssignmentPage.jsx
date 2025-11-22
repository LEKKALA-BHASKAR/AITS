import React from 'react';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import ModuleList from '../components/ModuleList';

const assignments = [
  // ...existing code removed, will fetch from backend
];

const AssignmentPage = () => {
  const [assignmentList, setAssignmentList] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });

  useEffect(() => {
    // Fetch assignments from backend
    fetch('http://localhost:8001/api/assignments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAssignmentList(data.map(a => `${a.title || 'New Assignment'}: ${a.description || ''}`));
        }
      });

    const socket = io('http://localhost:8001');
    socket.on('assignmentUpdated', assignment => {
      setAssignmentList(prev => [
        `${assignment.title || 'New Assignment'}: ${assignment.description || ''}`,
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
    await fetch('http://localhost:8001/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ title: '', description: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Assignment Module</h1>
      <ModuleList title="Assignments" items={assignmentList} />
      <form className="my-4" onSubmit={handleSubmit}>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className="border p-2 mr-2" />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" required className="border p-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add Assignment</button>
      </form>
    </div>
  );
};

export default AssignmentPage;
