import React, { useState } from 'react';
import { useEffect } from 'react';
import io from 'socket.io-client';
import ModuleList from '../components/ModuleList';

const initialNotifications = [
  { message: 'Exam on Monday', status: 'unread' },
  { message: 'Library books due', status: 'read' },
];

const NotificationPage = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [form, setForm] = useState({ message: '' });

  // Socket.IO client setup
  useEffect(() => {
    const socket = io('http://localhost:8001');
    socket.on('newNotification', notif => {
      setNotifications(prev => [
        { message: notif.title + ': ' + notif.message, status: 'unread' },
        ...prev
      ]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setNotifications([...notifications, { ...form, status: 'unread' }]);
    setForm({ message: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Notification Module</h1>
      <ModuleList title="Notifications" items={notifications.map(n => `${n.message} - ${n.status}`)} />
      <form className="my-4" onSubmit={handleSubmit}>
        <input name="message" value={form.message} onChange={handleChange} placeholder="Message" required className="border p-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Send Notification</button>
      </form>
    </div>
  );
};

export default NotificationPage;
