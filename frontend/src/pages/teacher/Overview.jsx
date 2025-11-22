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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const totalStudents = sections.reduce((acc, section) => acc + (section.studentIds?.length || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent" data-testid="teacher-dashboard-title">
          Welcome, {user.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your sections and students</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-testid="sections-card" className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Sections</CardTitle>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {sections.length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Assigned sections</p>
          </CardContent>
        </Card>

        <Card data-testid="students-card" className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Students</CardTitle>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
              {totalStudents}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total students</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-yellow-50 dark:from-gray-900 dark:to-yellow-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Subjects</CardTitle>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400 bg-clip-text text-transparent">
              --
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Teaching subjects</p>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-xl transition-shadow border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Your Sections</CardTitle>
        </CardHeader>
        <CardContent>
          {sections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.map((section, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-900 rounded-lg border border-blue-100 dark:border-blue-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{section.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{section.departmentId?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                      {section.studentIds?.length || 0}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Students</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No sections assigned</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
