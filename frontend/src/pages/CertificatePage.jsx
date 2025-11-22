import React, { useState } from 'react';
import ModuleList from '../components/ModuleList';

const initialCertificates = [
  {
    name: 'AWS Certified Developer',
    issuedBy: 'Amazon',
    status: 'approved',
    url: 'https://example.com/aws-cert.pdf',
  },
  {
    name: 'Data Science Specialization',
    issuedBy: 'Coursera',
    status: 'pending',
    url: '',
  },
];

const CertificatePage = () => {
  const [certificates, setCertificates] = useState(initialCertificates);
  const [form, setForm] = useState({ name: '', issuedBy: '', url: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setCertificates([...certificates, { ...form, status: 'pending' }]);
    setForm({ name: '', issuedBy: '', url: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Certificate Module</h1>
      <ModuleList title="Certificates" items={certificates.map(c => `${c.name} (${c.issuedBy}) - ${c.status}`)} />
      <form className="my-4" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Certificate Name" required className="border p-2 mr-2" />
        <input name="issuedBy" value={form.issuedBy} onChange={handleChange} placeholder="Issued By" required className="border p-2 mr-2" />
        <input name="url" value={form.url} onChange={handleChange} placeholder="Certificate URL" className="border p-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add Certificate</button>
      </form>
    </div>
  );
};

export default CertificatePage;
