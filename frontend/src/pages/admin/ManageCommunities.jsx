import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Plus, UserPlus, Settings, Trash2, 
  Edit, Search, Eye 
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ManageCommunities() {
  const [communities, setCommunities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addMembersDialogOpen, setAddMembersDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [communityToDelete, setCommunityToDelete] = useState(null);
  const [rollNumbers, setRollNumbers] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'private',
    department: '',
    section: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [communitiesRes, departmentsRes, sectionsRes] = await Promise.all([
        axios.get(`${API}/community/all`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/department`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/section`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setCommunities(communitiesRes.data || []);
      setDepartments(departmentsRes.data || []);
      setSections(sectionsRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingCommunity) {
        // Update existing community
        await axios.put(`${API}/community/${editingCommunity._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Community updated successfully!');
      } else {
        // Create new community
        await axios.post(`${API}/community`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Community created successfully!');
      }

      setDialogOpen(false);
      setEditingCommunity(null);
      setFormData({ name: '', description: '', type: 'private', department: '', section: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${editingCommunity ? 'update' : 'create'} community`);
    }
  };

  const handleEditCommunity = (community) => {
    setEditingCommunity(community);
    setFormData({
      name: community.name,
      description: community.description || '',
      type: community.type,
      department: community.department?._id || '',
      section: community.section?._id || ''
    });
    setDialogOpen(true);
  };

  const handleAddMembers = async () => {
    if (!selectedCommunity || !rollNumbers.trim()) {
      toast.error('Please enter roll numbers');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const rollNumbersList = rollNumbers.split(',').map(r => r.trim()).filter(r => r);
      
      await axios.post(
        `${API}/community/${selectedCommunity._id}/members/roll-numbers`,
        { rollNumbers: rollNumbersList },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Members added successfully!');
      setAddMembersDialogOpen(false);
      setRollNumbers('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add members');
    }
  };

  const handleDeleteCommunity = async (communityId) => {
    setCommunityToDelete(communityId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!communityToDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/community/${communityToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Community deleted successfully!');
      setIsDeleteDialogOpen(false);
      setCommunityToDelete(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete community');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      public: 'bg-green-100 text-green-800',
      private: 'bg-blue-100 text-blue-800',
      department: 'bg-purple-100 text-purple-800',
      section: 'bg-orange-100 text-orange-800',
      class: 'bg-cyan-100 text-cyan-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-8 h-8 text-blue-600" />
          Manage Communities
        </h1>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingCommunity(null);
            setFormData({ name: '', description: '', type: 'private', department: '', section: '' });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Community
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCommunity ? 'Edit' : 'Create New'} Community</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div>
                <Label htmlFor="name">Community Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., CSE Department Group"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the community"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="section">Section</SelectItem>
                    <SelectItem value="class">Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'department' && (
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept._id} value={dept._id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.type === 'section' && (
                <div>
                  <Label htmlFor="section">Section</Label>
                  <Select value={formData.section} onValueChange={(value) => setFormData({ ...formData, section: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((sec) => (
                        <SelectItem key={sec._id} value={sec._id}>
                          {sec.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => {
                  setDialogOpen(false);
                  setEditingCommunity(null);
                  setFormData({ name: '', description: '', type: 'private', department: '', section: '' });
                }}>
                  Cancel
                </Button>
                <Button type="submit">{editingCommunity ? 'Update' : 'Create'} Community</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Communities Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Communities</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Posts</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communities.map((community) => (
                <TableRow key={community._id}>
                  <TableCell className="font-medium">{community.name}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(community.type)}>
                      {community.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{community.members?.length || 0}</TableCell>
                  <TableCell>{community.posts?.length || 0}</TableCell>
                  <TableCell>{community.createdBy?.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCommunity(community)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCommunity(community);
                          setAddMembersDialogOpen(true);
                        }}
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Add Members
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCommunity(community._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {communities.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No communities yet</p>
              <p className="text-gray-500 text-sm mt-2">Create your first community using the button above</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Members Dialog */}
      <Dialog open={addMembersDialogOpen} onOpenChange={setAddMembersDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Members to {selectedCommunity?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rollNumbers">Student Roll Numbers</Label>
              <Textarea
                id="rollNumbers"
                value={rollNumbers}
                onChange={(e) => setRollNumbers(e.target.value)}
                placeholder="Enter roll numbers separated by commas&#10;e.g., 21B81A0501, 21B81A0502, 21B81A0503"
                rows={5}
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter student roll numbers separated by commas
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setAddMembersDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddMembers}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Members
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the community. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCommunityToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
