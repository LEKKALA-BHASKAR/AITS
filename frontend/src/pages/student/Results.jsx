import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { GraduationCap, TrendingUp, Award, AlertCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Results({ user }) {
  const [results, setResults] = useState([]);
  const [cgpa, setCgpa] = useState(0);
  const [backlogs, setBacklogs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Try new results API first
      try {
        const response = await axios.get(`${API}/results/my-results`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResults(response.data.results || []);
        setCgpa(response.data.cgpa || 0);
        setBacklogs(response.data.backlogs || 0);
      } catch (newApiError) {
        // Fallback to old API
        const response = await axios.get(`${API}/student/results`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Transform old format to new format
        const oldResults = response.data.results || [];
        const groupedBySemester = oldResults.reduce((acc, result) => {
          const sem = result.semester || 1;
          if (!acc[sem]) {
            acc[sem] = {
              semester: sem,
              subjects: [],
              sgpa: 0
            };
          }
          acc[sem].subjects.push({
            subjectName: result.subject,
            internalMarks: Math.floor((result.marks || 0) * 0.3),
            externalMarks: Math.floor((result.marks || 0) * 0.7),
            totalMarks: result.marks || 0,
            grade: result.grade || 'C',
            credits: 3
          });
          return acc;
        }, {});
        
        setResults(Object.values(groupedBySemester));
        setBacklogs(response.data.backlogCount || 0);
      }
    } catch (error) {
      toast.error('Failed to fetch results');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      'O': 'bg-purple-100 text-purple-800',
      'A+': 'bg-green-100 text-green-800',
      'A': 'bg-blue-100 text-blue-800',
      'B+': 'bg-cyan-100 text-cyan-800',
      'B': 'bg-yellow-100 text-yellow-800',
      'C': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800'
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-8 h-8" />
          Academic Results
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              CGPA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">{cgpa}</div>
            <p className="text-sm text-gray-600 mt-1">Out of 10.0</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Total Semesters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{results.length}</div>
            <p className="text-sm text-gray-600 mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Backlogs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${backlogs > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {backlogs}
            </div>
            <p className="text-sm text-gray-600 mt-1">Subjects</p>
          </CardContent>
        </Card>
      </div>

      {/* Semester-wise Results */}
      {results.length > 0 ? (
        <Tabs defaultValue={`sem${results[0]?.semester || 1}`} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            {results.map((result) => (
              <TabsTrigger key={result.semester} value={`sem${result.semester}`}>
                Sem {result.semester}
              </TabsTrigger>
            ))}
          </TabsList>

          {results.map((semesterResult) => (
            <TabsContent key={semesterResult.semester} value={`sem${semesterResult.semester}`}>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Semester {semesterResult.semester} Results</CardTitle>
                    {semesterResult.sgpa && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">SGPA</p>
                        <p className="text-2xl font-bold text-blue-600">{semesterResult.sgpa}</p>
                      </div>
                    )}
                  </div>
                  {semesterResult.academicYear && (
                    <p className="text-sm text-gray-600">Academic Year: {semesterResult.academicYear}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">Subject</TableHead>
                          <TableHead className="text-center font-semibold">Internal (30)</TableHead>
                          <TableHead className="text-center font-semibold">External (70)</TableHead>
                          <TableHead className="text-center font-semibold">Total (100)</TableHead>
                          <TableHead className="text-center font-semibold">Grade</TableHead>
                          <TableHead className="text-center font-semibold">Credits</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {semesterResult.subjects?.map((subject, idx) => (
                          <TableRow key={idx} className={subject.grade === 'F' ? 'bg-red-50' : ''}>
                            <TableCell className="font-medium">{subject.subjectName}</TableCell>
                            <TableCell className="text-center">{subject.internalMarks}</TableCell>
                            <TableCell className="text-center">{subject.externalMarks}</TableCell>
                            <TableCell className="text-center font-semibold">{subject.totalMarks}</TableCell>
                            <TableCell className="text-center">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(subject.grade)}`}>
                                {subject.grade}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">{subject.credits || 3}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Semester Summary */}
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Credits</p>
                      <p className="text-xl font-bold text-blue-600">
                        {semesterResult.totalCredits || (semesterResult.subjects?.length * 3)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Earned Credits</p>
                      <p className="text-xl font-bold text-green-600">
                        {semesterResult.earnedCredits || 
                          semesterResult.subjects?.filter(s => s.grade !== 'F').length * 3}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Passed Subjects</p>
                      <p className="text-xl font-bold text-purple-600">
                        {semesterResult.subjects?.filter(s => s.grade !== 'F').length || 0}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-gray-600">Failed Subjects</p>
                      <p className="text-xl font-bold text-orange-600">
                        {semesterResult.subjects?.filter(s => s.grade === 'F').length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <GraduationCap className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No results available yet</p>
            <p className="text-gray-500 text-sm mt-2">Results will appear here once published by your instructors</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
