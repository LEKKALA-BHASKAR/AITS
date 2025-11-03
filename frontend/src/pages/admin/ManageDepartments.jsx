import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/department`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (error) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900" data-testid="manage-departments-title">Manage Departments</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.length > 0 ? departments.map((dept, idx) => (
          <Card key={idx} data-testid={`department-card-${idx}`} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center gap-3">
              <Building className="h-6 w-6 text-[#2563EB]" />
              <div>
                <CardTitle className="text-lg">{dept.name}</CardTitle>
                <p className="text-sm text-gray-600">{dept.code}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-600">HOD: </span>
                  <span className="font-semibold">{dept.hodId?.name || 'Not Assigned'}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Sections: </span>
                  <span className="font-semibold">{dept.sections?.length || 0}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )) : (
          <p className="text-gray-600 col-span-full">No departments found</p>
        )}
      </div>
    </div>
  );
}
