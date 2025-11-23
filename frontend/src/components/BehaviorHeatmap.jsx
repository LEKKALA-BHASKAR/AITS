import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';

const BehaviorHeatmap = ({ studentId, days = 30 }) => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeatmapData();
  }, [studentId, days]);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/monitoring/behavior-heatmap/${studentId}?days=${days}`,
        config
      );
      setHeatmapData(response.data.heatmapData);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorClass = (score, count) => {
    if (count === 0) return 'bg-gray-100';
    const avgScore = score / count;
    if (avgScore >= 5) return 'bg-green-500';
    if (avgScore >= 0) return 'bg-yellow-500';
    if (avgScore >= -5) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getIntensity = (count) => {
    if (count === 0) return 'opacity-20';
    if (count <= 2) return 'opacity-40';
    if (count <= 5) return 'opacity-60';
    if (count <= 10) return 'opacity-80';
    return 'opacity-100';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!heatmapData) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No behavior data available
        </CardContent>
      </Card>
    );
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Day-wise Behavior Pattern</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {daysOfWeek.map((day) => {
              const data = heatmapData.dayWise[day] || { count: 0, totalScore: 0, issues: 0 };
              const avgScore = data.count > 0 ? (data.totalScore / data.count).toFixed(1) : 0;
              
              return (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">{day}</div>
                  <div className="flex-1">
                    <div 
                      className={`h-8 rounded ${getColorClass(data.totalScore, data.count)} ${getIntensity(data.count)} flex items-center justify-between px-3 text-white`}
                    >
                      <span className="text-sm">{data.count} logs</span>
                      <span className="text-sm font-semibold">Score: {avgScore}</span>
                    </div>
                  </div>
                  <div className="w-20 text-sm text-muted-foreground">
                    {data.issues} issues
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="font-medium">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Excellent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Poor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Critical</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(heatmapData.subjectWise).length > 0 ? (
              Object.entries(heatmapData.subjectWise).map(([subject, data]) => {
                const avgScore = data.count > 0 ? (data.totalScore / data.count).toFixed(1) : 0;
                
                return (
                  <div key={subject} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium truncate">{subject}</div>
                    <div className="flex-1">
                      <div 
                        className={`h-8 rounded ${getColorClass(data.totalScore, data.count)} ${getIntensity(data.count)} flex items-center justify-between px-3 text-white`}
                      >
                        <span className="text-sm">{data.count} logs</span>
                        <span className="text-sm font-semibold">Score: {avgScore}</span>
                      </div>
                    </div>
                    <div className="w-20 text-sm text-muted-foreground">
                      {data.issues} issues
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No subject-wise data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teacher-wise Observations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(heatmapData.teacherWise).length > 0 ? (
              Object.entries(heatmapData.teacherWise).map(([teacher, data]) => {
                const avgScore = data.count > 0 ? (data.totalScore / data.count).toFixed(1) : 0;
                
                return (
                  <div key={teacher} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium truncate">{teacher}</div>
                    <div className="flex-1">
                      <div 
                        className={`h-8 rounded ${getColorClass(data.totalScore, data.count)} ${getIntensity(data.count)} flex items-center justify-between px-3 text-white`}
                      >
                        <span className="text-sm">{data.count} logs</span>
                        <span className="text-sm font-semibold">Score: {avgScore}</span>
                      </div>
                    </div>
                    <div className="w-20 text-sm text-muted-foreground">
                      {data.issues} issues
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No teacher-wise data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{heatmapData.totalLogs}</div>
              <div className="text-sm text-muted-foreground">Total Logs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Object.keys(heatmapData.dayWise).length}</div>
              <div className="text-sm text-muted-foreground">Active Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Object.keys(heatmapData.subjectWise).length}</div>
              <div className="text-sm text-muted-foreground">Subjects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Object.keys(heatmapData.teacherWise).length}</div>
              <div className="text-sm text-muted-foreground">Teachers</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BehaviorHeatmap;
