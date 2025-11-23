import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import {
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  TrendingUp,
  MessageSquare,
  Activity,
  Upload,
  Edit,
  AlertTriangle
} from 'lucide-react';

const StudentTimeline = ({ studentId }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTimeline();
  }, [studentId, filter]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      let url = `${process.env.REACT_APP_API_URL}/timeline/student/${studentId}?limit=100`;
      
      if (filter !== 'all') {
        url += `&severity=${filter}`;
      }

      const response = await axios.get(url, config);
      setTimeline(response.data.timeline || []);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType) => {
    const icons = {
      attendance_marked: <CheckCircle className="h-5 w-5 text-green-500" />,
      attendance_updated: <Edit className="h-5 w-5 text-blue-500" />,
      marks_added: <Award className="h-5 w-5 text-purple-500" />,
      marks_updated: <Edit className="h-5 w-5 text-blue-500" />,
      remark_added: <MessageSquare className="h-5 w-5 text-orange-500" />,
      behavior_logged: <Activity className="h-5 w-5 text-yellow-500" />,
      certificate_uploaded: <Upload className="h-5 w-5 text-blue-500" />,
      certificate_approved: <CheckCircle className="h-5 w-5 text-green-500" />,
      certificate_rejected: <XCircle className="h-5 w-5 text-red-500" />,
      warning_issued: <AlertTriangle className="h-5 w-5 text-red-500" />,
      achievement_earned: <Award className="h-5 w-5 text-yellow-500" />,
      risk_level_changed: <AlertCircle className="h-5 w-5 text-red-500" />,
      monitoring_score_updated: <TrendingUp className="h-5 w-5 text-blue-500" />
    };

    return icons[eventType] || <Activity className="h-5 w-5 text-gray-500" />;
  };

  const getImpactBadge = (impact) => {
    const variants = {
      positive: 'success',
      negative: 'destructive',
      neutral: 'secondary',
      critical: 'destructive'
    };

    return <Badge variant={variants[impact] || 'secondary'}>{impact}</Badge>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Student Timeline</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-3 py-1 rounded ${filter === 'critical' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
          >
            Critical
          </button>
          <button
            onClick={() => setFilter('alert')}
            className={`px-3 py-1 rounded ${filter === 'alert' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}
          >
            Alerts
          </button>
        </div>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {timeline.length > 0 ? (
            timeline.map((event, index) => (
              <Card key={event._id || index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon(event.eventType)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        </div>
                        {getImpactBadge(event.impact)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(event.timestamp)}</span>
                        </div>
                        {event.triggeredBy && (
                          <span>By: {event.triggeredBy.userName}</span>
                        )}
                      </div>

                      {event.context && (
                        <div className="text-sm">
                          {event.context.subject && (
                            <Badge variant="outline" className="mr-2">
                              {event.context.subject}
                            </Badge>
                          )}
                          {event.context.section && (
                            <Badge variant="outline">
                              {event.context.section}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No timeline events found
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default StudentTimeline;
