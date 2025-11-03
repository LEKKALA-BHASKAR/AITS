import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, FileCheck } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Achievements({ user }) {
  const [achievements, setAchievements] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900" data-testid="achievements-title">Achievements & Certificates</h1>

      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Award className="h-6 w-6 text-[#FACC15]" />
          Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.length > 0 ? achievements.map((achievement, idx) => (
            <Card key={idx} data-testid={`achievement-card-${idx}`} className="hover:shadow-lg transition-shadow border-l-4 border-l-[#FACC15]">
              <CardHeader className="flex flex-row items-center gap-3">
                <Award className="h-6 w-6 text-[#FACC15]" />
                <CardTitle className="text-lg">{achievement.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{achievement.description}</p>
                <p className="text-sm text-gray-500 mt-2">{new Date(achievement.date).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          )) : (
            <p className="text-gray-600 col-span-full">No achievements yet. Keep working hard!</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-[#10B981]" />
          Certificates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.length > 0 ? certificates.map((cert, idx) => (
            <Card key={idx} data-testid={`certificate-card-${idx}`} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <FileCheck className="h-5 w-5 text-[#10B981] mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{cert.title}</h3>
                    <p className="text-sm text-gray-500">Uploaded: {new Date(cert.uploadDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <p className="text-gray-600 col-span-full">No certificates uploaded</p>
          )}
        </div>
      </div>
    </div>
  );
}
