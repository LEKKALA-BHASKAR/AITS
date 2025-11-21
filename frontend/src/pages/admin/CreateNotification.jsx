import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Send } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

export default function CreateNotification() {
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetAudience: 'all',
    departmentId: '',
    sectionId: '',
    priority: 'normal'
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [deptsRes, sectionsRes] = await Promise.all([
        axios.get(`${API_URL}/department`, { headers }),
        axios.get(`${API_URL}/section`, { headers })
      ]);

      setDepartments(deptsRes.data);
      setSections(sectionsRes.data);
    } catch (error) {
      console.error('Failed to fetch data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const token = localStorage.getItem('token');
      
      // Prepare data - only include departmentId/sectionId if relevant
      const data = {
        title: formData.title,
        message: formData.message,
        targetAudience: formData.targetAudience,
        priority: formData.priority
      };

      if (formData.targetAudience === 'department' && formData.departmentId) {
        data.departmentId = formData.departmentId;
      }

      if (formData.targetAudience === 'section' && formData.sectionId) {
        data.sectionId = formData.sectionId;
      }

      await axios.post(`${API_URL}/notifications`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Notification sent successfully!');
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        targetAudience: 'all',
        departmentId: '',
        sectionId: '',
        priority: 'normal'
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const getTargetDescription = () => {
    switch (formData.targetAudience) {
      case 'all':
        return 'All users (students, teachers, and admins)';
      case 'students':
        return 'All students';
      case 'teachers':
        return 'All teachers';
      case 'department':
        return 'All students and teachers in a specific department';
      case 'section':
        return 'All students in a specific section';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Notification</h1>
        <p className="text-muted-foreground">Send announcements to students, teachers, or the entire college</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            New Notification
          </CardTitle>
          <CardDescription>Fill in the details to send a notification</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Important: Exam Schedule Updated"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your notification message here..."
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.message.length} characters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Select
                  value={formData.targetAudience}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    targetAudience: value,
                    departmentId: '',
                    sectionId: ''
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="students">All Students</SelectItem>
                    <SelectItem value="teachers">All Teachers</SelectItem>
                    <SelectItem value="department">Specific Department</SelectItem>
                    <SelectItem value="section">Specific Section</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {getTargetDescription()}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.targetAudience === 'department' && (
              <div className="space-y-2">
                <Label htmlFor="department">Select Department</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a department" />
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
            )}

            {formData.targetAudience === 'section' && (
              <div className="space-y-2">
                <Label htmlFor="section">Select Section</Label>
                <Select
                  value={formData.sectionId}
                  onValueChange={(value) => setFormData({ ...formData, sectionId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(section => (
                      <SelectItem key={section._id} value={section._id}>
                        {section.name} - {section.departmentId?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={sending} className="flex-1">
                {sending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Notification
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({
                  title: '',
                  message: '',
                  targetAudience: 'all',
                  departmentId: '',
                  sectionId: '',
                  priority: 'normal'
                })}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
