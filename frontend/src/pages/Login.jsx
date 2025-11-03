import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Login({ setUser }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  
  // Signup fields
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [adminId, setAdminId] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password,
        role
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const signupData = {
        name,
        email,
        password,
        role
      };

      if (role === 'student') {
        signupData.rollNumber = rollNumber;
        signupData.departmentId = '6544c1a2e8f3b2a1c4d5e6f7'; // Mock department ID
        signupData.sectionId = '6544c1a2e8f3b2a1c4d5e6f8'; // Mock section ID
      } else if (role === 'teacher') {
        signupData.teacherId = teacherId;
        signupData.departmentId = '6544c1a2e8f3b2a1c4d5e6f7';
      } else if (role === 'admin') {
        signupData.adminId = adminId;
      }

      await axios.post(`${API}/auth/register`, signupData);
      toast.success('Registration successful! Please wait for admin approval.');
      setIsSignup(false);
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setRollNumber('');
      setTeacherId('');
      setAdminId('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#1E3A8A] mb-2" data-testid="login-title">AITS CSMS</h1>
            <p className="text-gray-600">Centralized Student Management System</p>
          </div>

          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                {isSignup ? 'Register As' : 'Login As'}
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger data-testid="role-select">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student" data-testid="role-student">Student</SelectItem>
                  <SelectItem value="teacher" data-testid="role-teacher">Teacher</SelectItem>
                  <SelectItem value="admin" data-testid="role-admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isSignup && (
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="mt-1"
                />
              </div>
            )}

            {isSignup && role === 'student' && (
              <div>
                <Label htmlFor="rollNumber" className="text-sm font-medium text-gray-700">Roll Number</Label>
                <Input
                  id="rollNumber"
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="Enter roll number"
                  required
                  className="mt-1"
                />
              </div>
            )}

            {isSignup && role === 'teacher' && (
              <div>
                <Label htmlFor="teacherId" className="text-sm font-medium text-gray-700">Teacher ID</Label>
                <Input
                  id="teacherId"
                  type="text"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  placeholder="Enter teacher ID"
                  required
                  className="mt-1"
                />
              </div>
            )}

            {isSignup && role === 'admin' && (
              <div>
                <Label htmlFor="adminId" className="text-sm font-medium text-gray-700">Admin ID</Label>
                <Input
                  id="adminId"
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter admin ID"
                  required
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                data-testid="email-input"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                data-testid="password-input"
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1E3A8A] hover:bg-[#2563EB] text-white py-6 rounded-lg font-semibold"
              data-testid="login-button"
            >
              {loading ? (isSignup ? 'Registering...' : 'Logging in...') : (isSignup ? 'Register' : 'Login')}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="text-[#2563EB] hover:underline text-sm"
              >
                {isSignup ? 'Already have an account? Login' : "Don't have an account? Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
