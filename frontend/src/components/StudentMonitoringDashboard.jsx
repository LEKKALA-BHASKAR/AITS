import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const MonitoringScoreCard = ({ score, studentName, rollNumber, trend }) => {
  const getColorClass = (score) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getRiskLevel = (score) => {
    if (score >= 75) return { label: 'Low Risk', color: 'outline' };
    if (score >= 60) return { label: 'Medium Risk', color: 'secondary' };
    if (score >= 40) return { label: 'High Risk', color: 'destructive' };
    return { label: 'Critical Risk', color: 'destructive' };
  };

  const risk = getRiskLevel(score);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{studentName}</CardTitle>
            <CardDescription>{rollNumber}</CardDescription>
          </div>
          <Badge variant={risk.color}>{risk.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{score}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          <Progress value={score} className={getColorClass(score)} />
          {trend && (
            <div className="flex items-center gap-2 text-sm">
              {trend.direction === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : trend.direction === 'down' ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : null}
              <span className={trend.direction === 'up' ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(trend.change).toFixed(1)} points
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const EarlyWarningAlert = ({ warning }) => {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      default:
        return 'border-yellow-500 bg-yellow-50';
    }
  };

  return (
    <div className={`border-l-4 p-4 rounded ${getSeverityColor(warning.severity)}`}>
      <div className="flex items-start gap-3">
        {getSeverityIcon(warning.severity)}
        <div className="flex-1">
          <p className="font-medium">{warning.message}</p>
          <p className="text-sm text-muted-foreground mt-1">{warning.type}</p>
        </div>
      </div>
    </div>
  );
};

const StudentMonitoringDashboard = ({ studentId }) => {
  const [monitoringScore, setMonitoringScore] = useState(null);
  const [earlyWarnings, setEarlyWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchMonitoringData();
  }, [studentId]);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch monitoring score
      const scoreRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/monitoring/score/${studentId}`,
        config
      );
      setMonitoringScore(scoreRes.data.monitoringScore);

      // Fetch early warnings
      const warningsRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/monitoring/early-warnings/${studentId}?days=30`,
        config
      );
      setEarlyWarnings(warningsRes.data.warnings || []);

    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post(
        `${process.env.REACT_APP_API_URL}/monitoring/score/calculate/${studentId}`,
        {},
        config
      );

      fetchMonitoringData();
    } catch (error) {
      console.error('Error calculating score:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Student Monitoring</h2>
        <button
          onClick={calculateScore}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Recalculate Score
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="warnings">Early Warnings</TabsTrigger>
          <TabsTrigger value="components">Score Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {monitoringScore && (
            <>
              <MonitoringScoreCard
                score={monitoringScore.overallScore}
                studentName={monitoringScore.studentId?.name}
                rollNumber={monitoringScore.studentId?.rollNumber}
                trend={monitoringScore.trend}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Risk Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={monitoringScore.riskLevel}>
                      {monitoringScore.riskLevel.toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {monitoringScore.trend.improvement ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                      <span>{monitoringScore.trend.direction.toUpperCase()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Active Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="text-2xl font-bold">
                      {monitoringScore.alerts?.length || 0}
                    </span>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="warnings" className="space-y-4">
          {earlyWarnings.length > 0 ? (
            earlyWarnings.map((warning, index) => (
              <EarlyWarningAlert key={index} warning={warning} />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No early warnings detected
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          {monitoringScore && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(monitoringScore.components).map(([key, value]) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{value.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">/100</span>
                      </div>
                      <Progress value={value} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentMonitoringDashboard;
