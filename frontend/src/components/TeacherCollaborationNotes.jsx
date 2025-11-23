import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import axios from 'axios';
import { MessageSquare, Share2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const TeacherCollaborationNotes = ({ studentId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general_observation',
    priority: 'medium',
    requiresFollowUp: false,
    followUpDate: ''
  });

  useEffect(() => {
    fetchNotes();
  }, [studentId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/teacher-notes/student/${studentId}`,
        config
      );
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post(
        `${process.env.REACT_APP_API_URL}/teacher-notes/create`,
        {
          studentId,
          ...newNote
        },
        config
      );

      setNewNote({
        title: '',
        content: '',
        category: 'general_observation',
        priority: 'medium',
        requiresFollowUp: false,
        followUpDate: ''
      });
      setIsAddingNote(false);
      fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleAddResponse = async (noteId, comment) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post(
        `${process.env.REACT_APP_API_URL}/teacher-notes/response/${noteId}`,
        { comment },
        config
      );

      fetchNotes();
    } catch (error) {
      console.error('Error adding response:', error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    };
    return colors[priority] || 'secondary';
  };

  const getRiskLevelVariant = (riskLevel) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    };
    return variants[riskLevel] || 'secondary';
  };

  const getCategoryLabel = (category) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const NoteCard = ({ note }) => {
    const [showResponseForm, setShowResponseForm] = useState(false);
    const [responseText, setResponseText] = useState('');

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{note.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                By {note.createdByName} • {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant={getPriorityColor(note.priority)}>
                {note.priority}
              </Badge>
              <Badge variant="outline">
                {getCategoryLabel(note.category)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">{note.content}</p>

          {note.requiresFollowUp && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <Clock className="h-4 w-4" />
              <span>
                Follow-up required
                {note.followUpDate && ` by ${new Date(note.followUpDate).toLocaleDateString()}`}
              </span>
            </div>
          )}

          {note.status === 'resolved' && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Resolved</span>
            </div>
          )}

          {note.tags && note.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {note.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Responses */}
          {note.responses && note.responses.length > 0 && (
            <div className="border-t pt-4 space-y-3">
              <h4 className="text-sm font-semibold">Responses:</h4>
              {note.responses.map((response, index) => (
                <div key={index} className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium">{response.teacherName}</p>
                  <p className="text-sm text-muted-foreground mt-1">{response.comment}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(response.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add Response */}
          {showResponseForm ? (
            <div className="border-t pt-4 space-y-3">
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Add your response..."
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    handleAddResponse(note._id, responseText);
                    setResponseText('');
                    setShowResponseForm(false);
                  }}
                >
                  Submit Response
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowResponseForm(false);
                    setResponseText('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowResponseForm(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Response
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Teacher Collaboration Notes</h2>
        <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
          <DialogTrigger asChild>
            <Button>Add Note</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Teacher Note</DialogTitle>
              <DialogDescription>
                Share observations and collaborate with other teachers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Brief summary..."
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Detailed observation..."
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newNote.category}
                    onValueChange={(value) => setNewNote({ ...newNote, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic_observation">Academic Observation</SelectItem>
                      <SelectItem value="behavior_concern">Behavior Concern</SelectItem>
                      <SelectItem value="strength_identified">Strength Identified</SelectItem>
                      <SelectItem value="intervention_needed">Intervention Needed</SelectItem>
                      <SelectItem value="improvement_noted">Improvement Noted</SelectItem>
                      <SelectItem value="parent_contact">Parent Contact</SelectItem>
                      <SelectItem value="counseling_recommendation">Counseling Recommendation</SelectItem>
                      <SelectItem value="general_observation">General Observation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newNote.priority}
                    onValueChange={(value) => setNewNote({ ...newNote, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newNote.requiresFollowUp}
                    onChange={(e) => setNewNote({ ...newNote, requiresFollowUp: e.target.checked })}
                  />
                  <span className="text-sm">Requires Follow-up</span>
                </label>
                {newNote.requiresFollowUp && (
                  <Input
                    type="date"
                    value={newNote.followUpDate}
                    onChange={(e) => setNewNote({ ...newNote, followUpDate: e.target.value })}
                  />
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddNote}>Add Note</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {notes.length > 0 ? (
          notes.map((note) => <NoteCard key={note._id} note={note} />)
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No notes yet. Add a note to start collaborating.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeacherCollaborationNotes;
