import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialProjects = [
	// ...existing code removed, will fetch from backend
];

const ProjectPage = () => {
	const [projects, setProjects] = useState([]);
	const [form, setForm] = useState({ name: '', group: '' });

	// Fetch projects from backend on mount
	React.useEffect(() => {
		fetch('http://localhost:8001/api/project')
			.then(res => res.json())
			.then(data => {
				if (Array.isArray(data)) {
					setProjects(data.map(p => ({ name: p.name, group: p.group, status: p.status })));
				}
			});
	}, []);

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		await fetch('http://localhost:8001/api/project', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ...form, status: 'in-progress' })
		});
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
