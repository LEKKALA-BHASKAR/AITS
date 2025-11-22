import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialSkills = [
  { name: 'JavaScript', description: 'Frontend development' },
  { name: 'Python', description: 'Data science' },
];

const SkillPage = () => {
  const [skills, setSkills] = useState(initialSkills);
  const [form, setForm] = useState({ name: '', description: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setSkills([...skills, { ...form }]);
    setForm({ name: '', description: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Skill Module</h1>
      <ModuleList title="Skills" items={skills.map(s => `${s.name}: ${s.description}`)} />
      <form className="my-4" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Skill Name" required className="border p-2 mr-2" />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" required className="border p-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add Skill</button>
      </form>
    </div>
  );
};

export default SkillPage;
