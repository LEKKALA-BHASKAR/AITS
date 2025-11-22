import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialProjects = [
	{
		name: 'Smart Attendance System',
		group: 'Group A',
		status: 'in-progress',
	},
	{
		name: 'Library Management App',
		group: 'Group B',
		status: 'completed',
	},
];

const ProjectPage = () => {
	const [projects, setProjects] = useState(initialProjects);
	const [form, setForm] = useState({ name: '', group: '' });

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = (e) => {
		e.preventDefault();
		setProjects([...projects, { ...form, status: 'in-progress' }]);
		setForm({ name: '', group: '' });
	};

	return (
		<div>
			<h1 className="text-2xl font-bold">Project Module</h1>
			<ModuleList title="Projects" items={projects.map((p) => `${p.name} - ${p.group} (${p.status})`)} />
			<form className="my-4" onSubmit={handleSubmit}>
				<input
					name="name"
					value={form.name}
					onChange={handleChange}
					placeholder="Project Name"
					required
					className="border p-2 mr-2"
				/>
				<input
					name="group"
					value={form.group}
					onChange={handleChange}
					placeholder="Group"
					required
					className="border p-2 mr-2"
				/>
				<button type="submit" className="bg-blue-500 text-white px-4 py-2">
					Add Project
				</button>
			</form>
		</div>
	);
};

export default ProjectPage;
