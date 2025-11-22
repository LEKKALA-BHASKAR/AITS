import React from 'react';
import { Link } from 'react-router-dom';

const modules = [
  'Chat', 'Internship', 'Project', 'Portfolio', 'Placement', 'Assignment', 'Timetable', 'Leave', 'Feedback', 'IDCard', 'Analytics', 'Library', 'Hostel', 'Event', 'Poll', 'Notification', 'Skill', 'HallTicket', 'Fee', 'Mentoring'
];

const Navbar = () => (
  <nav className="bg-gray-800 p-4 text-white flex flex-wrap">
    {modules.map(m => (
      <Link key={m} to={`/${m.toLowerCase()}`} className="mx-2 hover:underline">
        {m}
      </Link>
    ))}
  </nav>
);

export default Navbar;
