import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, FileCheck, Upload, ExternalLink, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Achievements({ user }) {
  const [achievements, setAchievements] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'other',
    tags: ''
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/student/achievements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAchievements(response.data.achievements || []);
      setCertificates(response.data.certificates || []);
    } catch (error) {
      toast.error('Failed to fetch achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('type', formData.type);
      uploadFormData.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(t => t)));
      
      if (file) {
        uploadFormData.append('certificate', file);
      }

      await axios.post(`${API}/student/achievements`, uploadFormData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Achievement uploaded successfully! Awaiting approval.');
      setDialogOpen(false);
      setFormData({ title: '', description: '', type: 'other', tags: '' });
      setFile(null);
      fetchAchievements();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload achievement');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const getTypeColor = (type) => {
    const colors = {
      olympiad: 'bg-purple-100 text-purple-800',
      hackathon: 'bg-blue-100 text-blue-800',
      publication: 'bg-green-100 text-green-800',
      patent: 'bg-orange-100 text-orange-800',
      course: 'bg-cyan-100 text-cyan-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-8 h-8 text-yellow-500" />
          Achievements & Certificates
        </h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Upload Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload New Achievement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., First Prize in Coding Competition"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="olympiad">Olympiad</SelectItem>
                    <SelectItem value="hackathon">Hackathon</SelectItem>
                    <SelectItem value="publication">Publication</SelectItem>
                    <SelectItem value="patent">Patent</SelectItem>
                    <SelectItem value="course">Course/Certification</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your achievement..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., coding, competition, AI"
                />
              </div>

              <div>
                <Label htmlFor="certificate">Certificate (Optional)</Label>
                <Input
                  id="certificate"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <p className="text-sm text-gray-500 mt-1">Upload certificate image or PDF</p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Achievement'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Achievements Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Award className="h-6 w-6 text-yellow-500" />
          My Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.length > 0 ? achievements.map((achievement, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{achievement.title}</CardTitle>
                  {achievement.status && getStatusBadge(achievement.status)}
                </div>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(achievement.type)}`}>
                    {achievement.type}
                  </span>
                  {achievement.tags?.map((tag, i) => (
                    <span key={i} className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">{achievement.description}</p>
                {achievement.certificateUrl && (
                  <a 
                    href={achievement.certificateUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <FileCheck className="w-4 h-4" />
                    View Certificate
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {achievement.verifiedBy && (
                  <p className="text-sm text-gray-500 mt-2">
                    Verified by: {achievement.verifiedBy.name}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(achievement.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          )) : (
            <Card className="col-span-full">
              <CardContent className="text-center py-12">
                <Award className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">No achievements yet</p>
                <p className="text-gray-500 text-sm mt-2">Upload your first achievement using the button above!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Legacy Certificates Section */}
      {certificates.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-green-500" />
            Certificates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <FileCheck className="h-5 w-5 text-green-500 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{cert.title}</h3>
                      {cert.url && (
                        <a 
                          href={cert.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Uploaded: {new Date(cert.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
