import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Results({ user }) {
  const [results, setResults] = useState([]);
  const [backlogCount, setBacklogCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/student/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(response.data.results || []);
      setBacklogCount(response.data.backlogCount || 0);
    } catch (error) {
      toast.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = () => {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, r) => sum + r.marks, 0);
    return (total / results.length).toFixed(2);
  };

  const groupBySemester = () => {
    return results.reduce((acc, result) => {
      if (!acc[result.semester]) acc[result.semester] = [];
      acc[result.semester].push(result);
      return acc;
    }, {});
  };

  const semesterResults = groupBySemester();

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900" data-testid="results-title">Results</h1>
        <div className="text-lg">
          <span className="text-gray-600">Backlogs: </span>
          <span className="font-bold text-[#EF4444]" data-testid="backlog-count">{backlogCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Overall Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-[#1E3A8A]">{calculateAverage()}</div>
            <p className="text-sm text-gray-600 mt-2">Out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-[#1E3A8A]">{results.length}</div>
            <p className="text-sm text-gray-600 mt-2">Examinations completed</p>
          </CardContent>
        </Card>
      </div>

      {Object.keys(semesterResults).map(semester => (
        <Card key={semester}>
          <CardHeader>
            <CardTitle>Semester {semester} Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Exam Type</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {semesterResults[semester].map((result, idx) => (
                  <TableRow key={idx} data-testid={`result-row-${idx}`}>
                    <TableCell className="font-medium">{result.subject}</TableCell>
                    <TableCell>{result.examType}</TableCell>
                    <TableCell>{result.marks}/100</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${
                        result.marks >= 85 ? 'bg-green-100 text-green-800' :
                        result.marks >= 60 ? 'bg-blue-100 text-blue-800' :
                        result.marks >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.grade}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {results.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">No results available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
