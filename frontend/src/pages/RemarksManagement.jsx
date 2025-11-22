import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import {
  MessageSquare,
  Plus,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Filter
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

/**
 * Enhanced Remarks Management Component
 * Allows teachers and admins to add, view, and manage student remarks with categories and severity
 */
export default function RemarksManagement() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [remarks, setRemarks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filter, setFilter] = useState({ type: 'all', category: 'all' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'neutral',
    category: 'behavior',
    severity: 'medium',
    requiresFollowUp: false,
    followUpDate: '',
    actionTaken: '',
    tags: ''
  });

  useEffect(() => {
    if (studentId) {
      fetchRemarks();
      fetchSummary();
    }
  }, [studentId, filter]);

  const fetchRemarks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter.type && filter.type !== 'all') params.append('type', filter.type);
      if (filter.category && filter.category !== 'all') params.append('category', filter.category);

      const response = await axios.get(
        `${API_URL}/remarks/student/${studentId}?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setStudent(response.data.student);
      setRemarks(response.data.remarks);
    } catch (err) {
      console.error('Error fetching remarks:', err);
      toast.error('Failed to load remarks');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/remarks/student/${studentId}/summary`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSummary(response.data.summary);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const handleAddRemark = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      };

      await axios.post(
        `${API_URL}/remarks/student/${studentId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Remark added successfully');
      setShowAddDialog(false);
      resetForm();
      fetchRemarks();
      fetchSummary();
    } catch (err) {
      console.error('Error adding remark:', err);
      toast.error(err.response?.data?.error || 'Failed to add remark');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'neutral',
      category: 'behavior',
      severity: 'medium',
      requiresFollowUp: false,
      followUpDate: '',
      actionTaken: '',
      tags: ''
    });
  };

  const getTypeColor = (type) => {
    const colors = {
      positive: 'bg-green-100 text-green-800 border-green-300',
      negative: 'bg-red-100 text-red-800 border-red-300',
      neutral: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[type] || colors.neutral;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-600 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-blue-500 text-white'
    };
    return colors[severity] || colors.low;
  };

  if (loading && !student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Behavior & Remarks</h1>
          {student && (
            <p className="text-gray-600 mt-1">
              {student.name} ({student.rollNumber})
            </p>
          )}
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Remark
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-700">{summary.positive}</div>
                  <div className="text-sm text-green-600">Positive</div>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-red-700">{summary.negative}</div>
                  <div className="text-sm text-red-600">Negative</div>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-700">{summary.total}</div>
                  <div className="text-sm text-blue-600">Total Remarks</div>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${
            summary.riskScore > 30 ? 'from-red-50 to-red-100 border-red-200' : 
            summary.riskScore > 15 ? 'from-yellow-50 to-yellow-100 border-yellow-200' :
            'from-green-50 to-green-100 border-green-200'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-3xl font-bold ${
                    summary.riskScore > 30 ? 'text-red-700' : 
                    summary.riskScore > 15 ? 'text-yellow-700' : 'text-green-700'
                  }`}>{summary.riskScore}</div>
                  <div className="text-sm text-gray-600">Risk Score</div>
                </div>
                {summary.riskScore > 30 ? 
                  <AlertCircle className="w-8 h-8 text-red-600" /> :
                  <CheckCircle className="w-8 h-8 text-green-600" />
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label>Filter by Type</Label>
              <Select value={filter.type} onValueChange={(value) => setFilter({ ...filter, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label>Filter by Category</Label>
              <Select value={filter.category} onValueChange={(value) => setFilter({ ...filter, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="behavior">Behavior</SelectItem>
                  <SelectItem value="discipline">Discipline</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="achievement">Achievement</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="incident">Incident</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remarks List */}
      <div className="space-y-4">
        {remarks.length > 0 ? (
          remarks.map((remark) => (
            <Card key={remark._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(remark.type)}>
                        {remark.type}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {remark.category}
                      </Badge>
                      {remark.type === 'negative' && (
                        <Badge className={getSeverityColor(remark.severity)}>
                          {remark.severity}
                        </Badge>
                      )}
                      {remark.requiresFollowUp && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                          Follow-up Required
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{remark.title}</h3>
                    <p className="text-gray-700 mb-3">{remark.description}</p>
                    
                    {remark.actionTaken && (
                      <div className="mb-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                        <p className="text-sm font-medium text-blue-900">Action Taken:</p>
                        <p className="text-sm text-blue-700">{remark.actionTaken}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {remark.createdByName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(remark.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {remark.tags && remark.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {remark.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No remarks found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Remark Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Remark</DialogTitle>
            <DialogDescription>
              Add a detailed remark about the student's behavior or performance
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Title *</Label>
              <Input
                placeholder="Brief summary of the remark"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                placeholder="Detailed description of the remark"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="behavior">Behavior</SelectItem>
                    <SelectItem value="discipline">Discipline</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="counseling">Counseling</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="incident">Incident</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="participation">Participation</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.type === 'negative' && (
              <div>
                <Label>Severity</Label>
                <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Action Taken (optional)</Label>
              <Textarea
                placeholder="What action was taken, if any"
                value={formData.actionTaken}
                onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                placeholder="e.g., assignment, late, improvement"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRemark} disabled={!formData.title || !formData.description}>
              Add Remark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
