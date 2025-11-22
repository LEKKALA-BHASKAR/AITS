import React from 'react';

const ModuleList = ({ title, items }) => (
  <div className="my-4">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <ul className="list-disc ml-6">
      {items.map((item, idx) => <li key={idx}>{item}</li>)}
    </ul>
  </div>
);

export default ModuleList;
