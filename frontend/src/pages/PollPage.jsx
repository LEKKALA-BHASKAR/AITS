import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialPolls = [
	{ question: 'Best Programming Language?', options: ['Python', 'JavaScript'], status: 'open' },
	{ question: 'Favorite Sport?', options: ['Cricket', 'Football'], status: 'closed' },
];

const PollPage = () => {
	const [polls, setPolls] = useState(initialPolls);
	const [form, setForm] = useState({ question: '', options: '' });

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = (e) => {
		e.preventDefault();
		setPolls([
			...polls,
			{ question: form.question, options: form.options.split(',').map((o) => o.trim()), status: 'open' },
		]);
		setForm({ question: '', options: '' });
	};

	return (
		<div>
			<h1 className="text-2xl font-bold">Poll Module</h1>
			<ModuleList
				title="Polls"
				items={polls.map((p) => `${p.question} [${p.options.join(', ')}] - ${p.status}`)}
			/>
			<form className="my-4" onSubmit={handleSubmit}>
				<input
					name="question"
					value={form.question}
					onChange={handleChange}
					placeholder="Question"
					required
					className="border p-2 mr-2"
				/>
				<input
					name="options"
					value={form.options}
					onChange={handleChange}
					placeholder="Options (comma separated)"
					required
					className="border p-2 mr-2"
				/>
				<button type="submit" className="bg-blue-500 text-white px-4 py-2">
					Add Poll
				</button>
			</form>
		</div>
	);
};

export default PollPage;
