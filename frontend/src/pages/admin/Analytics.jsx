import { useState, useEffect } from 'react';
import { TrendingUp, Users, AlertTriangle, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import axios from 'axios';
import {
  DepartmentDistributionChart,
  AttendanceRangeChart,
  TopPerformersChart,
  LoginActivityChart,
  BehaviorTrendsChart,
  BacklogStatsChart
} from '@/components/Charts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

export function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    departments: [],
    attendance: { students: [], ranges: {} },
    topPerformers: [],
    backlogs: { total: 0, withBacklogs: 0, withoutBacklogs: 0 },
    loginActivity: [],
    behavior: { positive: 0, negative: 0, neutral: 0 },
    atRisk: { total: 0, students: [] }
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all analytics data in parallel
      const [
        deptResponse,
        attendanceResponse,
        performersResponse,
        backlogsResponse,
        loginResponse,
        behaviorResponse,
        riskResponse
      ] = await Promise.all([
        axios.get(`${API_URL}/analytics/departments/students`, { headers }),
        axios.get(`${API_URL}/analytics/attendance/overview`, { headers }),
        axios.get(`${API_URL}/analytics/performance/top`, { headers }),
        axios.get(`${API_URL}/analytics/backlogs/stats`, { headers }),
        axios.get(`${API_URL}/analytics/login/activity?days=7`, { headers }),
        axios.get(`${API_URL}/analytics/behavior/trends`, { headers }),
        axios.get(`${API_URL}/analytics/risk/overview`, { headers })
      ]);

      setAnalytics({
        departments: deptResponse.data,
        attendance: attendanceResponse.data,
        topPerformers: performersResponse.data,
        backlogs: backlogsResponse.data,
        loginActivity: loginResponse.data,
        behavior: behaviorResponse.data,
        atRisk: riskResponse.data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Comprehensive insights into student performance and system activity
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.departments.length}</div>
            <p className="text-xs text-muted-foreground">
              Active departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.atRisk.total}</div>
            <p className="text-xs text-muted-foreground">
              Require intervention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Backlogs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.backlogs.withBacklogs}</div>
            <p className="text-xs text-muted-foreground">
              Out of {analytics.backlogs.total} students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Remarks</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.behavior.positive}</div>
            <p className="text-xs text-muted-foreground">
              Total positive feedback
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <DepartmentDistributionChart data={analytics.departments} />
            <BacklogStatsChart data={analytics.backlogs} />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1">
            <TopPerformersChart data={analytics.topPerformers} />
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1">
            <AttendanceRangeChart data={analytics.attendance.ranges} />
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <LoginActivityChart data={analytics.loginActivity} />
            <BehaviorTrendsChart data={analytics.behavior} />
          </div>
        </TabsContent>
      </Tabs>

      {/* At-Risk Students Detail */}
      {analytics.atRisk.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>At-Risk Students Details</CardTitle>
            <CardDescription>
              Students requiring immediate attention and intervention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.atRisk.students.slice(0, 5).map((student) => (
                <div key={student.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.rollNumber} • {student.department} - {student.section}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {student.riskFactors.map((factor, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Attendance: {student.attendancePercentage}%</p>
                    <p className="text-sm text-muted-foreground">Avg Marks: {student.averageMarks}</p>
                    <p className="text-sm text-muted-foreground">Backlogs: {student.backlogCount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Analytics;
