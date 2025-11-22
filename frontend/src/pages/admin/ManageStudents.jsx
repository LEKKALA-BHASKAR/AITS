import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Input
} from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Download,
  Plus,
  MoreHorizontal,
  UserCheck,
  UserX,
  Calendar,
  Award,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Filter
} from 'lucide-react';
import { Label } from '@/components/ui/label';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [filters, setFilters] = useState({
    departmentId: 'all',
    atRisk: 'all',
    isApproved: 'all'
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    password: '',
    departmentId: '',
    sectionId: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
    fetchSections();
  }, []);

  // Fetch all data
  const fetchStudents = async (queryParams = '') => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/admin/students${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data);
    } catch (error) {
      toast.error('Failed to fetch departments');
    }
  };

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/sections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSections(res.data);
    } catch (error) {
      toast.error('Failed to fetch sections');
    }
  };

  // Search and filter handlers
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('name', searchTerm);
    if (filters.departmentId && filters.departmentId !== 'all') params.append('departmentId', filters.departmentId);
    if (filters.atRisk !== 'all') params.append('atRisk', filters.atRisk);
    if (filters.isApproved !== 'all') params.append('isApproved', filters.isApproved);
    
    fetchStudents(params.toString() ? `?${params.toString()}` : '');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({ departmentId: 'all', atRisk: 'all', isApproved: 'all' });
    fetchStudents();
  };

  // Student operations
  const createStudent = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.rollNumber || !formData.password || !formData.departmentId || !formData.sectionId) {
        toast.error('Please fill all required fields');
        return;
      }

      const token = localStorage.getItem('token');
      await axios.post(`${API}/admin/students`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Student created successfully');
      setIsDialogOpen(false);
      setFormData({ 
        name: '', 
        email: '', 
        rollNumber: '', 
        password: '', 
        departmentId: '', 
        sectionId: '', 
        phone: '', 
        address: '' 
      });
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create student');
    }
  };

  const updateStudent = async (id, updates) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/admin/students/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Student updated successfully');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to update student');
    }
  };

  const deactivateStudent = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this student?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/admin/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Student deactivated successfully');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to deactivate student');
    }
  };

  // Attendance and results
  const addAttendance = async (student) => {
    const subject = prompt('Enter subject:');
    const status = prompt('Enter status (present/absent/late):');
    if (!subject || !status) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/admin/students/${student._id}/attendance`,
        { subject, date: new Date().toISOString().split('T')[0], status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Attendance added successfully');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to add attendance');
    }
  };

  const addResult = async (student) => {
    const subject = prompt('Enter subject:');
    const marks = prompt('Enter marks:');
    const grade = prompt('Enter grade:');
    const examType = prompt('Enter exam type (midterm/final):');
    const semester = prompt('Enter semester:');
    
    if (!subject || !marks) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/admin/students/${student._id}/results`,
        { 
          subject, 
          marks: parseInt(marks), 
          grade, 
          examType, 
          semester: parseInt(semester) 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Result added successfully');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to add result');
    }
  };

  // Export functionality
  const exportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/admin/students/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `students-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  // Calculate attendance percentage
  const calculateAttendance = (attendance = []) => {
    if (!attendance.length) return 0;
    const presentCount = attendance.filter(a => a.status === 'present').length;
    return ((presentCount / attendance.length) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Student Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all student records and information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} className="flex items-center gap-2 hover:shadow-md transition-shadow">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all">
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className="border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="dark:text-gray-300">Search by Name</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 dark:bg-gray-800 dark:border-gray-700"
                />
                <Button onClick={handleSearch} size="icon" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="dark:text-gray-300">Department</Label>
              <Select 
                value={filters.departmentId} 
                onValueChange={(value) => setFilters({...filters, departmentId: value})}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk-status" className="dark:text-gray-300">Risk Status</Label>
              <Select 
                value={filters.atRisk} 
                onValueChange={(value) => setFilters({...filters, atRisk: value})}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">At Risk</SelectItem>
                  <SelectItem value="false">Good</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approval" className="dark:text-gray-300">Approval Status</Label>
              <Select 
                value={filters.isApproved} 
                onValueChange={(value) => setFilters({...filters, isApproved: value})}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Approved</SelectItem>
                  <SelectItem value="false">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleResetFilters} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Reset Filters
            </Button>
            <Button onClick={handleSearch} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-900 dark:text-gray-100">Students ({students.length})</CardTitle>
          <Badge variant="secondary" className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
            Total: {students.length}
          </Badge>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <div className="rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                    <TableHead className="dark:text-gray-300">Student Info</TableHead>
                    <TableHead className="dark:text-gray-300">Academic</TableHead>
                    <TableHead className="dark:text-gray-300">Attendance</TableHead>
                    <TableHead className="dark:text-gray-300">Status</TableHead>
                    <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const attendancePercentage = calculateAttendance(student.attendance);
                    return (
                      <TableRow key={student._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{student.name}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{student.email}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">Roll: {student.rollNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-900 dark:text-gray-100">{student.departmentId?.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">Section: {student.sectionId?.name || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`font-semibold ${
                            attendancePercentage >= 75 ? 'text-green-600 dark:text-green-400' : 
                            attendancePercentage >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {attendancePercentage}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            {student.attendance?.length || 0} records
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge 
                              variant={student.atRisk ? "destructive" : "default"}
                              className="w-fit text-xs"
                            >
                              {student.atRisk ? (
                                <AlertTriangle className="h-3 w-3 mr-1" />
                              ) : null}
                              {student.atRisk ? 'At Risk' : 'Good Standing'}
                            </Badge>
                            <Badge 
                              variant={student.isApproved ? "default" : "secondary"}
                              className="w-fit text-xs"
                            >
                              {student.isApproved ? 'Approved' : 'Pending'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => { setSelectedStudent(student); setIsViewDialogOpen(true); }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStudent(student._id, { isApproved: !student.isApproved })}>
                                {student.isApproved ? (
                                  <UserX className="h-4 w-4 mr-2" />
                                ) : (
                                  <UserCheck className="h-4 w-4 mr-2" />
                                )}
                                {student.isApproved ? 'Unapprove' : 'Approve'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => addAttendance(student)}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Add Attendance
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => addResult(student)}>
                                <Award className="h-4 w-4 mr-2" />
                                Add Result
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStudent(student._id, { atRisk: !student.atRisk })}>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Toggle Risk
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600 dark:text-red-400"
                                onClick={() => deactivateStudent(student._id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <UserX className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No students found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search or filters</p>
              <Button onClick={handleResetFilters} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">Reset Filters</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Student Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {[
              { id: 'name', label: 'Full Name', type: 'text', required: true },
              { id: 'email', label: 'Email', type: 'email', required: true },
              { id: 'rollNumber', label: 'Roll Number', type: 'text', required: true },
              { id: 'password', label: 'Password', type: 'password', required: true },
              { id: 'phone', label: 'Phone', type: 'tel' },
              { id: 'address', label: 'Address', type: 'text' },
            ].map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id={field.id}
                  type={field.type}
                  value={formData[field.id] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              </div>
            ))}
            
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.departmentId} 
                onValueChange={(value) => setFormData({...formData, departmentId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sectionId">Section <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.sectionId} 
                onValueChange={(value) => setFormData({...formData, sectionId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section._id} value={section._id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createStudent}>
              Create Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Student Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedStudent.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedStudent.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Roll Number:</span>
                      <span className="font-medium">{selectedStudent.rollNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{selectedStudent.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Academic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">{selectedStudent.departmentId?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Section:</span>
                      <span className="font-medium">{selectedStudent.sectionId?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Attendance:</span>
                      <span className={`font-medium ${
                        calculateAttendance(selectedStudent.attendance) >= 75 ? 'text-green-600' : 
                        calculateAttendance(selectedStudent.attendance) >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {calculateAttendance(selectedStudent.attendance)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Status & Performance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Account Status:</span>
                      <Badge variant={selectedStudent.isApproved ? "default" : "secondary"}>
                        {selectedStudent.isApproved ? 'Approved' : 'Pending Approval'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Risk Status:</span>
                      <Badge variant={selectedStudent.atRisk ? "destructive" : "default"}>
                        {selectedStudent.atRisk ? 'At Risk' : 'Good Standing'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Active Status:</span>
                      <Badge variant={selectedStudent.isActive ? "default" : "secondary"}>
                        {selectedStudent.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Quick Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addAttendance(selectedStudent)}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Attendance
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addResult(selectedStudent)}
                    >
                      <Award className="h-4 w-4 mr-1" />
                      Results
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateStudent(selectedStudent._id, { atRisk: !selectedStudent.atRisk })}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Toggle Risk
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}