import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialApplications = [
	{
		company: 'Google',
		position: 'Software Engineer',
		status: 'applied',
		round: 'Technical Interview',
	},
	{
		company: 'Microsoft',
		position: 'Data Analyst',
		status: 'selected',
		round: 'HR Interview',
	},
];

const PlacementPage = () => {
	const [applications, setApplications] = useState(initialApplications);
	const [form, setForm] = useState({ company: '', position: '', round: '' });

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = (e) => {
		e.preventDefault();
		setApplications([...applications, { ...form, status: 'applied' }]);
		setForm({ company: '', position: '', round: '' });
	};

	return (
		<div>
			<h1 className="text-2xl font-bold">Placement Module</h1>
			<ModuleList
				title="Applications"
				items={applications.map((a) => `${a.company} - ${a.position} (${a.round}) - ${a.status}`)}
			/>
			<form className="my-4" onSubmit={handleSubmit}>
				<input
					name="company"
					value={form.company}
					onChange={handleChange}
					placeholder="Company"
					required
					className="border p-2 mr-2"
				/>
				<input
					name="position"
					value={form.position}
					onChange={handleChange}
					placeholder="Position"
					required
					className="border p-2 mr-2"
				/>
				<input
					name="round"
					value={form.round}
					onChange={handleChange}
					placeholder="Round"
					className="border p-2 mr-2"
				/>
				<button type="submit" className="bg-blue-500 text-white px-4 py-2">
					Add Application
				</button>
			</form>
		</div>
	);
};

export default PlacementPage;
