import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Profile({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/teacher/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900" data-testid="teacher-profile-title">My Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Name</Label>
              <p className="text-lg font-semibold mt-1">{profile.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Teacher ID</Label>
              <p className="text-lg font-semibold mt-1">{profile.teacherId}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <p className="text-lg font-semibold mt-1">{profile.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Department</Label>
              <p className="text-lg font-semibold mt-1">{profile.departmentId?.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Designation</Label>
              <p className="text-lg font-semibold mt-1">{profile.designation || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Experience</Label>
              <p className="text-lg font-semibold mt-1">{profile.experience} years</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teaching Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-sm font-medium text-gray-700">Subjects</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.subjects?.length > 0 ? profile.subjects.map((subject, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {subject}
                </span>
              )) : <p className="text-gray-600">No subjects assigned</p>}
            </div>
          </div>

          <div className="mt-4">
            <Label className="text-sm font-medium text-gray-700">Assigned Sections</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.assignedSections?.length > 0 ? profile.assignedSections.map((section, idx) => (
                <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {section.name}
                </span>
              )) : <p className="text-gray-600">No sections assigned</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
