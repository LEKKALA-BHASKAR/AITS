import React, { useState } from 'react';
import { useEffect } from 'react';
import io from 'socket.io-client';
import ModuleList from '../components/ModuleList';

const initialNotifications = [
  { message: 'Exam on Monday', status: 'unread' },
  { message: 'Library books due', status: 'read' },
];

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({ title: '', message: '' });

  // Fetch notifications from backend on mount
  useEffect(() => {
    fetch('http://localhost:8001/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data.map(n => ({ message: n.title + ': ' + n.message, status: 'unread' })));
        }
      });
  }, []);

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

  const handleSubmit = async e => {
    e.preventDefault();
    // Send notification to backend
    await fetch('http://localhost:8001/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: form.title || 'Notification', message: form.message, targetAudience: 'all' })
    });
    setForm({ title: '', message: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Notification Module</h1>
      <ModuleList title="Notifications" items={notifications.map(n => `${n.message} - ${n.status}`)} />
      <form className="my-4" onSubmit={handleSubmit}>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required className="border p-2 mr-2" />
        <input name="message" value={form.message} onChange={handleChange} placeholder="Message" required className="border p-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Send Notification</button>
      </form>
    </div>
  );
};

export default NotificationPage;
