import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Plus, Edit, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const API_URL = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : 'http://localhost:8001/api';

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    hodId: ''
  });

  useEffect(() => {
    fetchDepartments();
    fetchTeachers();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/department`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (error) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/teachers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(response.data);
    } catch (error) {
      console.error('Failed to fetch teachers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = editingDept 
        ? `${API_URL}/department/${editingDept._id}`
        : `${API_URL}/department`;
      
      const method = editingDept ? 'put' : 'post';
      
      await axios[method](endpoint, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`Department ${editingDept ? 'updated' : 'created'} successfully!`);
      setIsDialogOpen(false);
      resetForm();
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${editingDept ? 'update' : 'create'} department`);
    }
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      hodId: dept.hodId?._id || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (deptId) => {
    setDeptToDelete(deptId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deptToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/department/${deptToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Department deleted successfully!');
      setIsDeleteDialogOpen(false);
      setDeptToDelete(null);
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete department');
    }
  };

  const resetForm = () => {
    setEditingDept(null);
    setFormData({ name: '', code: '', hodId: '' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="manage-departments-title">Manage Departments</h1>
          <p className="text-muted-foreground">Create and manage academic departments</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDept ? 'Edit' : 'Add'} Department</DialogTitle>
              <DialogDescription>
                {editingDept ? 'Update' : 'Create a new'} department information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Computer Science & Engineering"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Department Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="CSE"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hod">Head of Department (HOD)</Label>
                <Select
                  value={formData.hodId}
                  onValueChange={(value) => setFormData({ ...formData, hodId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select HOD (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No HOD</SelectItem>
                    {teachers.map(teacher => (
                      <SelectItem key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDept ? 'Update' : 'Create'} Department
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.length > 0 ? departments.map((dept) => (
          <Card key={dept._id} data-testid={`department-card-${dept._id}`} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{dept.code}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(dept)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(dept._id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    <span className="text-muted-foreground">HOD: </span>
                    <span className="font-semibold">{dept.hodId?.name || 'Not Assigned'}</span>
                  </p>
                </div>
                <p className="text-sm">
                  <span className="text-muted-foreground">Status: </span>
                  <span className="font-semibold">{dept.isActive ? 'Active' : 'Inactive'}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full text-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No departments found</p>
            <p className="text-sm text-muted-foreground mb-4">Create your first department to get started</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the department. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeptToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
