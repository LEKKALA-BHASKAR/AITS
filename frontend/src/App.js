import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '@/App.css';
import LandingPage from '@/pages/LandingPage';
import Login from '@/pages/Login';
import StudentDashboard from '@/pages/student/Dashboard';
import TeacherDashboard from '@/pages/teacher/Dashboard';
import AdminDashboard from '@/pages/admin/Dashboard';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="aits-theme">
      <div className="App">
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={!user ? <LandingPage /> : <Navigate to={`/${user.role}`} />} />
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to={`/${user.role}`} />} />
            <Route path="/student/*" element={user?.role === 'student' ? <StudentDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
            <Route path="/teacher/*" element={user?.role === 'teacher' ? <TeacherDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
            <Route path="/admin/*" element={user?.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
