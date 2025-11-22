import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { BarChart } from '../components/Charts';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Calendar,
  Award,
  MessageSquare,
  BookOpen,
  Target,
  Activity
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

/**
 * Student 360° Profile Page
 * Comprehensive view of student's academic, behavioral, and risk status
 */
export default function Student360Profile() {
  const { studentId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [studentId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/student360/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching 360° profile:', err);
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (riskLevel) => {
    const variants = {
      low: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      critical: 'bg-red-100 text-red-800 border-red-300'
    };

    const icons = {
      low: <CheckCircle className="w-4 h-4" />,
      medium: <AlertCircle className="w-4 h-4" />,
      high: <AlertCircle className="w-4 h-4" />,
      critical: <AlertCircle className="w-4 h-4" />
    };

    return (
      <Badge className={`${variants[riskLevel] || variants.low} flex items-center gap-1 px-3 py-1`}>
        {icons[riskLevel]}
        <span className="capitalize font-semibold">{riskLevel} Risk</span>
      </Badge>
    );
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  const { profile: student, academicOverview, attendanceOverview, behaviorOverview, riskAnalysis, achievements, recentActivity } = profile;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {student.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-gray-600">Roll No: {student.rollNumber}</p>
            <p className="text-sm text-gray-500">
              {student.department?.name} - {student.section?.name}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getRiskBadge(riskAnalysis.riskLevel)}
          <span className="text-sm text-gray-500">Risk Score: {riskAnalysis.totalRiskScore}</span>
        </div>
      </div>

      {/* Risk Analysis Alert */}
      {(riskAnalysis.riskLevel === 'high' || riskAnalysis.riskLevel === 'critical') && (
        <Card className="border-l-4 border-red-500 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Attention Required</h3>
                <p className="text-red-700 mt-1">{riskAnalysis.recommendation}</p>
                <div className="mt-3 space-y-1">
                  {riskAnalysis.riskFactors.map((factor, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className={`w-2 h-2 rounded-full ${
                        factor.severity === 'critical' ? 'bg-red-600' :
                        factor.severity === 'high' ? 'bg-orange-500' :
                        factor.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></span>
                      <span className="text-red-800">{factor.factor}</span>
                      <span className="text-red-600">({factor.score} pts)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Target className="w-5 h-5" />}
          title="Attendance"
          value={`${attendanceOverview.overallPercentage}%`}
          subtitle={`${attendanceOverview.attended}/${attendanceOverview.totalClasses} classes`}
          color={attendanceOverview.overallPercentage >= 75 ? 'green' : 'red'}
          trend={attendanceOverview.overallPercentage >= 75 ? 'up' : 'down'}
        />
        <MetricCard
          icon={<BookOpen className="w-5 h-5" />}
          title="Academic Average"
          value={`${academicOverview.averageMarks}%`}
          subtitle={`Grade: ${academicOverview.grade}`}
          color={academicOverview.averageMarks >= 60 ? 'green' : 'red'}
          trend={academicOverview.averageMarks >= 60 ? 'up' : 'down'}
        />
        <MetricCard
          icon={<MessageSquare className="w-5 h-5" />}
          title="Behavior Score"
          value={behaviorOverview.total}
          subtitle={`${behaviorOverview.positive} positive, ${behaviorOverview.negative} negative`}
          color={behaviorOverview.negative <= 3 ? 'green' : 'red'}
        />
        <MetricCard
          icon={<Activity className="w-5 h-5" />}
          title="Backlogs"
          value={academicOverview.backlogCount}
          subtitle={academicOverview.backlogCount > 0 ? 'Needs attention' : 'All clear'}
          color={academicOverview.backlogCount === 0 ? 'green' : 'red'}
        />
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow icon={<User />} label="Name" value={student.name} />
                <InfoRow icon={<Mail />} label="Email" value={student.email} />
                <InfoRow icon={<Phone />} label="Phone" value={student.phone || 'N/A'} />
                <InfoRow icon={<GraduationCap />} label="Department" value={student.department?.name} />
                <Separator />
                <InfoRow icon={<User />} label="Guardian" value={student.guardianName || 'N/A'} />
                <InfoRow icon={<Phone />} label="Guardian Phone" value={student.guardianPhone || 'N/A'} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Latest Remarks</h4>
                  {recentActivity.recentRemarks.length > 0 ? (
                    recentActivity.recentRemarks.slice(0, 3).map((remark, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                        <span className={`w-2 h-2 rounded-full mt-1.5 ${
                          remark.type === 'positive' ? 'bg-green-500' :
                          remark.type === 'negative' ? 'bg-red-500' : 'bg-blue-500'
                        }`}></span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{remark.title}</p>
                          <p className="text-xs text-gray-500">{new Date(remark.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No recent remarks</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>
                Overall: {attendanceOverview.attended}/{attendanceOverview.totalClasses} classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Overall Attendance</span>
                    <span className={`text-sm font-bold ${getPercentageColor(attendanceOverview.overallPercentage)}`}>
                      {attendanceOverview.overallPercentage}%
                    </span>
                  </div>
                  <Progress value={attendanceOverview.overallPercentage} className="h-3" />
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">Subject-wise Attendance</h4>
                  {Object.entries(attendanceOverview.bySubject || {}).map(([subject, data]) => (
                    <div key={subject} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{subject}</span>
                        <span className={getPercentageColor(parseFloat(data.percentage))}>
                          {data.percentage}% ({data.present}/{data.total})
                        </span>
                      </div>
                      <Progress value={parseFloat(data.percentage)} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
              <CardDescription>
                Average: {academicOverview.averageMarks}% | Grade: {academicOverview.grade}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(academicOverview.bySemester || {}).map(([sem, data]) => (
                  <div key={sem} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Semester {sem}</span>
                      <span className="text-lg font-bold text-blue-600">{data.average}%</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{data.marks.length} exams</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Behavior Summary</CardTitle>
              <CardDescription>
                Total remarks: {behaviorOverview.total}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{behaviorOverview.positive}</div>
                  <div className="text-sm text-gray-600">Positive</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{behaviorOverview.neutral}</div>
                  <div className="text-sm text-gray-600">Neutral</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">{behaviorOverview.negative}</div>
                  <div className="text-sm text-gray-600">Negative</div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">By Category</h4>
                {Object.entries(behaviorOverview.byCategory || {}).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="capitalize text-sm">{category}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievements & Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              {achievements && achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.map((achievement, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Award className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        {achievement.date && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No achievements recorded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components
function MetricCard({ icon, title, value, subtitle, color, trend }) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    blue: 'bg-blue-50 border-blue-200',
    yellow: 'bg-yellow-50 border-yellow-200'
  };

  const iconColors = {
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    yellow: 'text-yellow-600'
  };

  return (
    <Card className={colorClasses[color] || colorClasses.blue}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className={iconColors[color]}>{icon}</div>
          {trend && (
            trend === 'up' ? 
              <TrendingUp className="w-4 h-4 text-green-600" /> :
              <TrendingDown className="w-4 h-4 text-red-600" />
          )}
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-gray-400">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}
