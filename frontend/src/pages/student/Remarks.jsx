import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Remarks({ user }) {
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRemarks();
  }, []);

  const fetchRemarks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/student/remarks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRemarks(response.data);
    } catch (error) {
      toast.error('Failed to fetch remarks');
    } finally {
      setLoading(false);
    }
  };

  const getRemarkStyle = (type) => {
    switch (type) {
      case 'positive': return 'border-l-4 border-l-[#10B981] bg-green-50';
      case 'negative': return 'border-l-4 border-l-[#EF4444] bg-red-50';
      default: return 'border-l-4 border-l-gray-400 bg-gray-50';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'positive': return <ThumbsUp className="h-5 w-5 text-[#10B981]" />;
      case 'negative': return <ThumbsDown className="h-5 w-5 text-[#EF4444]" />;
      default: return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900" data-testid="remarks-title">Teacher Remarks</h1>

      <div className="space-y-4">
        {remarks.length > 0 ? remarks.map((remark, idx) => (
          <Card key={idx} className={getRemarkStyle(remark.type)} data-testid={`remark-card-${idx}`}>
            <CardHeader className="flex flex-row items-center gap-3">
              {getIcon(remark.type)}
              <div className="flex-1">
                <CardTitle className="text-base">From: {remark.teacherId?.name || 'Teacher'}</CardTitle>
                <p className="text-sm text-gray-500">{new Date(remark.date).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                remark.type === 'positive' ? 'bg-green-200 text-green-800' :
                remark.type === 'negative' ? 'bg-red-200 text-red-800' :
                'bg-gray-200 text-gray-800'
              }`}>
                {remark.type.toUpperCase()}
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{remark.remark}</p>
            </CardContent>
          </Card>
        )) : (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No remarks yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
