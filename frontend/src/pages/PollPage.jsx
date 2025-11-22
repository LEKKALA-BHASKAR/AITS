import React, { useState } from 'react';
import { useEffect } from 'react';
import io from 'socket.io-client';
import ModuleList from '../components/ModuleList';

const initialPolls = [
	// ...existing code removed, will fetch from backend
];

const PollPage = () => {
	const [polls, setPolls] = useState([]);
	const [form, setForm] = useState({ question: '', options: '' });

	// Socket.IO client setup
	useEffect(() => {
		// Fetch polls from backend
		fetch('http://localhost:8001/api/polls')
			.then(res => res.json())
			.then(data => {
				if (Array.isArray(data)) {
					setPolls(data.map(p => ({ question: p.question, options: p.options.map(o => o.text || o), status: 'open' })));
				}
			});

		const socket = io('http://localhost:8001');
		socket.on('pollUpdated', poll => {
			setPolls(prev => [
				{ question: poll.question, options: poll.options.map(o => o.text || o), status: 'open' },
				...prev
			]);
		});
		return () => {
			socket.disconnect();
		};
	}, []);

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		await fetch('http://localhost:8001/api/polls', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ question: form.question, options: form.options.split(',').map((o) => ({ text: o.trim(), votes: 0 })) })
		});
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
