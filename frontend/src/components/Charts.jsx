import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function DepartmentDistributionChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Department-wise Student Distribution</CardTitle>
        <CardDescription>Number of students in each department</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="code" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="studentCount" fill="#8884d8" name="Students" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function AttendanceRangeChart({ data }) {
  const chartData = Object.entries(data).map(([range, count]) => ({
    range,
    count
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Distribution</CardTitle>
        <CardDescription>Students grouped by attendance percentage</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ range, count }) => `${range}: ${count}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function TopPerformersChart({ data }) {
  // Take top 10
  const topData = data.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Students</CardTitle>
        <CardDescription>Students with highest average marks</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis type="category" dataKey="name" width={100} />
            <Tooltip />
            <Bar dataKey="averageMarks" fill="#00C49F" name="Avg Marks" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function LoginActivityChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login Activity</CardTitle>
        <CardDescription>Daily login attempts by role</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="student.success" stroke="#8884d8" name="Student Logins" />
            <Line type="monotone" dataKey="teacher.success" stroke="#82ca9d" name="Teacher Logins" />
            <Line type="monotone" dataKey="admin.success" stroke="#ffc658" name="Admin Logins" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function BehaviorTrendsChart({ data }) {
  const chartData = [
    { type: 'Positive', count: data.positive, color: '#00C49F' },
    { type: 'Neutral', count: data.neutral, color: '#FFBB28' },
    { type: 'Negative', count: data.negative, color: '#FF8042' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Behavior Trends</CardTitle>
        <CardDescription>Distribution of student remarks</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function BacklogStatsChart({ data }) {
  const chartData = [
    { name: 'With Backlogs', value: data.withBacklogs },
    { name: 'Without Backlogs', value: data.withoutBacklogs }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backlog Statistics</CardTitle>
        <CardDescription>Students with and without backlogs</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default {
  DepartmentDistributionChart,
  AttendanceRangeChart,
  TopPerformersChart,
  LoginActivityChart,
  BehaviorTrendsChart,
  BacklogStatsChart
};
