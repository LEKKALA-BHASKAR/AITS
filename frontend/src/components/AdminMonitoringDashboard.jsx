import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Target,
  Activity
} from 'lucide-react';

const AdminMonitoringDashboard = () => {
  const [criticalStudents, setCriticalStudents] = useState([]);
  const [highRiskStudents, setHighRiskStudents] = useState([]);
  const [improvedStudents, setImprovedStudents] = useState([]);
  const [decliningStudents, setDecliningStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const getRiskLevelVariant = (riskLevel) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    };
    return variants[riskLevel] || 'secondary';
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [critical, highRisk, improved, declining] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/monitoring/risk-level/critical?limit=10`, config),
        axios.get(`${process.env.REACT_APP_API_URL}/monitoring/risk-level/high?limit=20`, config),
        axios.get(`${process.env.REACT_APP_API_URL}/monitoring/most-improved?limit=10`, config),
        axios.get(`${process.env.REACT_APP_API_URL}/monitoring/declining?limit=10`, config)
      ]);

      setCriticalStudents(critical.data.students || []);
      setHighRiskStudents(highRisk.data.students || []);
      setImprovedStudents(improved.data.students || []);
      setDecliningStudents(declining.data.students || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StudentCard = ({ student, showTrend = false }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <img
            src={student.studentId?.imageURL || '/placeholder-avatar.png'}
            alt={student.studentId?.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{student.studentId?.name}</h3>
            <p className="text-sm text-muted-foreground">{student.studentId?.rollNumber}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{student.overallScore}/100</span>
              </div>
              <Badge variant={getRiskLevelVariant(student.riskLevel)}>{student.riskLevel}</Badge>
              {showTrend && student.trend && (
                <div className="flex items-center gap-1 text-sm">
                  {student.trend.direction === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : student.trend.direction === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : null}
                  <span className={student.trend.direction === 'up' ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(student.trend.change || 0).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Student Monitoring Dashboard</h1>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Critical Risk"
          value={criticalStudents.length}
          icon={AlertTriangle}
          color="text-red-500"
          description="Immediate intervention needed"
        />
        <StatCard
          title="High Risk"
          value={highRiskStudents.length}
          icon={Activity}
          color="text-orange-500"
          description="Close monitoring required"
        />
        <StatCard
          title="Most Improved"
          value={improvedStudents.length}
          icon={TrendingUp}
          color="text-green-500"
          description="Positive progress"
        />
        <StatCard
          title="Declining Performance"
          value={decliningStudents.length}
          icon={TrendingDown}
          color="text-red-500"
          description="Needs attention"
        />
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="critical" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="critical">Critical</TabsTrigger>
          <TabsTrigger value="high">High Risk</TabsTrigger>
          <TabsTrigger value="improved">Most Improved</TabsTrigger>
          <TabsTrigger value="declining">Declining</TabsTrigger>
        </TabsList>

        <TabsContent value="critical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical Risk Students</CardTitle>
              <CardDescription>
                Students requiring immediate intervention and support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {criticalStudents.length > 0 ? (
                  criticalStudents.map((student) => (
                    <StudentCard key={student._id} student={student} showTrend />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No critical risk students
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="high" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>High Risk Students</CardTitle>
              <CardDescription>
                Students requiring close monitoring and support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {highRiskStudents.length > 0 ? (
                  highRiskStudents.map((student) => (
                    <StudentCard key={student._id} student={student} showTrend />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No high risk students
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Improved Students</CardTitle>
              <CardDescription>
                Students showing positive progress and improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {improvedStudents.length > 0 ? (
                  improvedStudents.map((student) => (
                    <StudentCard key={student._id} student={student} showTrend />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No improved students data
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="declining" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Declining Performance</CardTitle>
              <CardDescription>
                Students showing declining trends requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {decliningStudents.length > 0 ? (
                  decliningStudents.map((student) => (
                    <StudentCard key={student._id} student={student} showTrend />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No declining students
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMonitoringDashboard;
