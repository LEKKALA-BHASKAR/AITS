import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Sections({ user }) {
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900" data-testid="sections-title">My Sections</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.length > 0 ? sections.map((section, idx) => (
          <Card key={idx} data-testid={`section-card-${idx}`} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-3">
              <Users className="h-6 w-6 text-[#2563EB]" />
              <div>
                <CardTitle className="text-lg">{section.name}</CardTitle>
                <p className="text-sm text-gray-600">{section.departmentId?.name}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1E3A8A] mb-2">{section.studentIds?.length || 0}</div>
              <p className="text-sm text-gray-600">Students enrolled</p>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">Student List:</p>
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {section.studentIds?.slice(0, 5).map((student, i) => (
                    <p key={i} className="text-sm">• {student.name} ({student.rollNumber})</p>
                  ))}
                  {section.studentIds?.length > 5 && (
                    <p className="text-xs text-gray-500 italic">+{section.studentIds.length - 5} more...</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <p className="text-gray-600 col-span-full">No sections assigned</p>
        )}
      </div>
    </div>
  );
}
