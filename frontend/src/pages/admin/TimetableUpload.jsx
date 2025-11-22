import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, AlertCircle, CheckCircle, Info } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TimetableUpload() {
  const [timetableText, setTimetableText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const sampleFormat = `CSE-A:
MON: 9-10 DS, 10-11 CO, 11-12 OS, 1-2 DAA, 2-3 FLAT
TUE: 9-10 OS, 10-11 AI, 11-12 DS, 1-2 DAA, 2-3 CO
WED: 9-10 FLAT, 10-11 DS, 11-12 DAA, 1-2 OS, 2-3 AI
THU: 9-10 CO, 10-11 FLAT, 11-12 AI, 1-2 DS, 2-3 OS
FRI: 9-10 DAA, 10-11 OS, 11-12 CO, 1-2 FLAT, 2-3 DS

CSE-B:
MON: 9-10 CN, 10-11 OS, 11-12 DBMS, 1-2 JAVA, 2-3 DAA
TUE: 9-10 ML, 10-11 FLAT, 11-12 CN, 1-2 DS, 2-3 OS
WED: 9-10 DBMS, 10-11 CN, 11-12 JAVA, 1-2 ML, 2-3 FLAT
THU: 9-10 OS, 10-11 DAA, 11-12 ML, 1-2 CN, 2-3 DBMS
FRI: 9-10 JAVA, 10-11 DS, 11-12 OS, 1-2 DBMS, 2-3 CN`;

  const handleUpload = async () => {
    if (!timetableText.trim()) {
      toast.error('Please enter timetable text');
      return;
    }

    setLoading(true);
    setUploadResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/timetable/upload`,
        { timetableText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUploadResult(response.data);
      toast.success('Timetable uploaded successfully!');
      
      // Clear form on success if no errors
      if (!response.data.errors || response.data.errors.length === 0) {
        setTimetableText('');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Failed to upload timetable';
      toast.error(errorMsg);
      
      if (error.response?.data?.errors) {
        setUploadResult({ errors: error.response.data.errors });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setTimetableText(sampleFormat);
    toast.info('Sample timetable loaded');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Upload Timetable</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Timetable Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Timetable Text
              </label>
              <textarea
                className="w-full h-96 p-3 border rounded-lg font-mono text-sm"
                placeholder="Enter timetable in the specified format..."
                value={timetableText}
                onChange={(e) => setTimetableText(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleUpload} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Uploading...' : 'Upload Timetable'}
              </Button>
              <Button 
                variant="outline" 
                onClick={loadSample}
                disabled={loading}
              >
                Load Sample
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Format Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Format Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Format Rules:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Start with section name followed by colon (e.g., CSE-A:)</li>
                  <li>Each day starts with 3-letter code (MON, TUE, WED, THU, FRI, SAT, SUN)</li>
                  <li>Time format: 9-10, 10-11, 1-2 (12-hour format)</li>
                  <li>Separate slots with commas</li>
                  <li>Leave blank line between sections</li>
                  <li>Morning classes: 9-12, Afternoon classes: 1-5</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Example:</h4>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
{`CSE-A:
MON: 9-10 DS, 10-11 CO, 11-12 OS
TUE: 9-10 AI, 10-11 DBMS

CSE-B:
MON: 9-10 CN, 10-11 JAVA`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Auto-assigns teachers based on subject</li>
                  <li>Validates for time clashes</li>
                  <li>Checks for missing days</li>
                  <li>Links subjects to sections automatically</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Results */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Success message */}
            {uploadResult.message && (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">{uploadResult.message}</p>
                  {uploadResult.timetables && (
                    <p className="text-sm text-green-700 mt-1">
                      {uploadResult.timetables.length} section(s) uploaded successfully
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Warnings */}
            {uploadResult.warnings && uploadResult.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-5 h-5" />
                  Warnings ({uploadResult.warnings.length})
                </h4>
                <div className="space-y-2">
                  {uploadResult.warnings.map((warning, idx) => (
                    <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                      <p className="font-medium text-yellow-900">{warning.section}</p>
                      <p className="text-yellow-700">{warning.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  Errors ({uploadResult.errors.length})
                </h4>
                <div className="space-y-2">
                  {uploadResult.errors.map((error, idx) => (
                    <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                      <p className="font-medium text-red-900">{error.section}</p>
                      <p className="text-red-700">{error.error || error.message}</p>
                      {error.clashes && (
                        <div className="mt-2 text-xs">
                          <p className="font-medium">Time clashes:</p>
                          <ul className="list-disc list-inside">
                            {error.clashes.map((clash, i) => (
                              <li key={i}>
                                {clash.day}: {clash.slot1.time} {clash.slot1.subject} overlaps with {clash.slot2.time} {clash.slot2.subject}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded Sections */}
            {uploadResult.timetables && uploadResult.timetables.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Uploaded Sections</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {uploadResult.timetables.map((timetable, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-medium text-blue-900">{timetable.section}</p>
                      <p className="text-sm text-blue-700">
                        {Object.keys(timetable.schedule).filter(day => timetable.schedule[day]?.length > 0).length} days scheduled
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
