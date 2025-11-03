import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Approvals() {
  const [pending, setPending] = useState({ students: [], teachers: [], admins: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/admin/pending-approvals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPending(response.data);
    } catch (error) {
      toast.error('Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (role, id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/approve-user/${role}/${id}`, 
        { isApproved: true },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast.success('User approved successfully!');
      fetchPendingApprovals();
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (role, id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/approve-user/${role}/${id}`, 
        { isApproved: false },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast.success('User rejected');
      fetchPendingApprovals();
    } catch (error) {
      toast.error('Failed to reject user');
    }
  };

  const UserCard = ({ user, role }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <div className="mt-2 space-y-1">
              {role === 'student' && <p className="text-sm"><span className="font-medium">Roll:</span> {user.rollNumber}</p>}
              {role === 'teacher' && <p className="text-sm"><span className="font-medium">ID:</span> {user.teacherId}</p>}
              {role === 'admin' && <p className="text-sm"><span className="font-medium">ID:</span> {user.adminId}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleApprove(role, user._id)}
              className="bg-[#10B981] hover:bg-green-700"
              data-testid={`approve-${role}-${user._id}`}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleReject(role, user._id)}
              data-testid={`reject-${role}-${user._id}`}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  const totalPending = pending.students.length + pending.teachers.length + pending.admins.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900" data-testid="approvals-title">Pending Approvals</h1>
        <div className="flex items-center gap-2 text-[#FACC15]">
          <Clock className="h-5 w-5" />
          <span className="font-semibold">{totalPending} Pending</span>
        </div>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students">Students ({pending.students.length})</TabsTrigger>
          <TabsTrigger value="teachers">Teachers ({pending.teachers.length})</TabsTrigger>
          <TabsTrigger value="admins">Admins ({pending.admins.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-6">
          {pending.students.length > 0 ? (
            pending.students.map(student => (
              <UserCard key={student._id} user={student} role="student" />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">No pending student approvals</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="teachers" className="mt-6">
          {pending.teachers.length > 0 ? (
            pending.teachers.map(teacher => (
              <UserCard key={teacher._id} user={teacher} role="teacher" />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">No pending teacher approvals</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="admins" className="mt-6">
          {pending.admins.length > 0 ? (
            pending.admins.map(admin => (
              <UserCard key={admin._id} user={admin} role="admin" />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">No pending admin approvals</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
