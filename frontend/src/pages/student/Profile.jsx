import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Profile({ user }) {
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/student/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setPhone(response.data.phone || '');
      setGuardianName(response.data.guardianName || '');
      setGuardianPhone(response.data.guardianPhone || '');
    } catch (error) {
      toast.error('Failed to fetch profile');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/student/profile`, {
        phone,
        guardianName,
        guardianPhone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile updated successfully!');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900" data-testid="profile-title">My Profile</h1>

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
              <Label className="text-sm font-medium text-gray-700">Roll Number</Label>
              <p className="text-lg font-semibold mt-1">{profile.rollNumber}</p>
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
              <Label className="text-sm font-medium text-gray-700">Section</Label>
              <p className="text-lg font-semibold mt-1">{profile.sectionId?.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information (Editable)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                data-testid="phone-input"
              />
            </div>
            <div>
              <Label htmlFor="guardianName">Guardian Name</Label>
              <Input
                id="guardianName"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Enter guardian name"
                data-testid="guardian-name-input"
              />
            </div>
            <div>
              <Label htmlFor="guardianPhone">Guardian Phone</Label>
              <Input
                id="guardianPhone"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="Enter guardian phone"
                data-testid="guardian-phone-input"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#1E3A8A] hover:bg-[#2563EB]"
              data-testid="update-profile-button"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
