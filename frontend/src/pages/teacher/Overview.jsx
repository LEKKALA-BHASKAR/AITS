import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Overview({ user }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/teacher/sections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSections(response.data);
    } catch (error) {
      toast.error('Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  const totalStudents = sections.reduce((acc, section) => acc + (section.studentIds?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900" data-testid="teacher-dashboard-title">Welcome, {user.name}!</h1>
        <p className="text-gray-600 mt-1">Manage your sections and students</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-testid="sections-card" className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sections</CardTitle>
            <Users className="h-5 w-5 text-[#2563EB]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1E3A8A]">{sections.length}</div>
            <p className="text-xs text-gray-600 mt-1">Assigned sections</p>
          </CardContent>
        </Card>

        <Card data-testid="students-card" className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <GraduationCap className="h-5 w-5 text-[#10B981]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1E3A8A]">{totalStudents}</div>
            <p className="text-xs text-gray-600 mt-1">Total students</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-5 w-5 text-[#FACC15]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1E3A8A]">--</div>
            <p className="text-xs text-gray-600 mt-1">Teaching subjects</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Sections</CardTitle>
        </CardHeader>
        <CardContent>
          {sections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.map((section, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="font-semibold text-lg">{section.name}</h3>
                    <p className="text-sm text-gray-600">{section.departmentId?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#1E3A8A]">{section.studentIds?.length || 0}</p>
                    <p className="text-xs text-gray-600">Students</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">No sections assigned</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
