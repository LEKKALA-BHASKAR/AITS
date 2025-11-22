import React from 'react';
import ModuleList from '../components/ModuleList';

const assignments = [
  'Assignment 1: Math Homework',
  'Assignment 2: Physics Lab',
  'Assignment 3: Literature Essay'
];

const AssignmentPage = () => (
  <div>
    <h1 className="text-2xl font-bold">Assignment Module</h1>
    <ModuleList title="Assignments" items={assignments} />
    {/* Add form and CRUD logic here */}
  </div>
);

export default AssignmentPage;
