import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  UserPlus 
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    teacherId: '',
    departmentId: '',
    designation: '',
    qualification: '',
    experience: '',
    phone: '',
    subjects: ''
  });

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, []);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/admin/teachers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(response.data);
    } catch (error) {
      toast.error('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/department`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        experience: parseInt(formData.experience) || 0,
        subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s)
      };

      if (editingTeacher) {
        // Update teacher
        await axios.put(`${API}/admin/teachers/${editingTeacher._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Teacher updated successfully!');
      } else {
        // Create teacher
        await axios.post(`${API}/admin/teachers`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Teacher created successfully!');
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${editingTeacher ? 'update' : 'create'} teacher`);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      password: '',
      teacherId: teacher.teacherId,
      departmentId: teacher.departmentId?._id || '',
      designation: teacher.designation || '',
      qualification: teacher.qualification || '',
      experience: teacher.experience?.toString() || '',
      phone: teacher.phone || '',
      subjects: teacher.subjects?.join(', ') || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (teacherId) => {
    setTeacherToDelete(teacherId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!teacherToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/admin/teachers/${teacherToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Teacher deleted successfully!');
      setIsDeleteDialogOpen(false);
      setTeacherToDelete(null);
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete teacher');
    }
  };

  const handleView = (teacher) => {
    setSelectedTeacher(teacher);
    setIsViewDialogOpen(true);
  };

  const resetForm = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      teacherId: '',
      departmentId: '',
      designation: '',
      qualification: '',
      experience: '',
      phone: '',
      subjects: ''
    });
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="manage-teachers-title">Manage Teachers</h1>
          <p className="text-muted-foreground">Create and manage teacher accounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTeacher ? 'Edit' : 'Add'} Teacher</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacherId">Teacher ID *</Label>
                  <Input
                    id="teacherId"
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    required
                    disabled={!!editingTeacher}
                  />
                </div>
                {!editingTeacher && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingTeacher}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept._id} value={dept._id}>
                          {dept.name} ({dept.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Professor, Assistant Professor, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="M.Tech, Ph.D., etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 1234567890"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="subjects">Subjects (comma separated)</Label>
                  <Input
                    id="subjects"
                    value={formData.subjects}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    placeholder="Data Structures, Algorithms, DBMS"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTeacher ? 'Update' : 'Create'} Teacher
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Teachers ({teachers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {teachers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher, idx) => (
                  <TableRow key={idx} data-testid={`teacher-row-${idx}`}>
                    <TableCell className="font-medium">{teacher.teacherId}</TableCell>
                    <TableCell>{teacher.name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>{teacher.departmentId?.name || 'N/A'}</TableCell>
                    <TableCell>{teacher.designation || 'N/A'}</TableCell>
                    <TableCell>{teacher.experience} years</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects?.slice(0, 2).map((sub, i) => (
                          <Badge key={i} variant="secondary">
                            {sub}
                          </Badge>
                        ))}
                        {teacher.subjects?.length > 2 && (
                          <Badge variant="outline">
                            +{teacher.subjects.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(teacher)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(teacher)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(teacher._id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No teachers found</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Teacher
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Teacher Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Teacher Details</DialogTitle>
          </DialogHeader>
          {selectedTeacher && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-semibold">{selectedTeacher.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Teacher ID</Label>
                  <p className="font-semibold">{selectedTeacher.teacherId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-semibold">{selectedTeacher.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-semibold">{selectedTeacher.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Department</Label>
                  <p className="font-semibold">{selectedTeacher.departmentId?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Designation</Label>
                  <p className="font-semibold">{selectedTeacher.designation || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Qualification</Label>
                  <p className="font-semibold">{selectedTeacher.qualification || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Experience</Label>
                  <p className="font-semibold">{selectedTeacher.experience} years</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Subjects</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTeacher.subjects?.map((sub, i) => (
                      <Badge key={i} variant="secondary">
                        {sub}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the teacher. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTeacherToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
