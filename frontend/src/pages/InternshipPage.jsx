import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialBatches = [
	{
		company: 'Infosys',
		batch: 'Summer 2025',
		status: 'ongoing',
	},
	{
		company: 'TCS',
		batch: 'Winter 2024',
		status: 'completed',
	},
];

const InternshipPage = () => {
	const [batches, setBatches] = useState(initialBatches);
	const [form, setForm] = useState({ company: '', batch: '' });

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = (e) => {
		e.preventDefault();
		setBatches([...batches, { ...form, status: 'ongoing' }]);
		setForm({ company: '', batch: '' });
	};

	return (
		<div>
			<h1 className="text-2xl font-bold">Internship Module</h1>
			<ModuleList
				title="Internship Batches"
				items={batches.map((b) => `${b.company} - ${b.batch} (${b.status})`)}
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
					name="batch"
					value={form.batch}
					onChange={handleChange}
					placeholder="Batch"
					required
					className="border p-2 mr-2"
				/>
				<button type="submit" className="bg-blue-500 text-white px-4 py-2">
					Add Batch
				</button>
			</form>
		</div>
	);
};

export default InternshipPage;
