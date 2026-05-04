/**
 * BIUST Smart Maintenance System - Private Login Page
 *
 * Mock JWT-based authentication for operations staff.
 * Supports roles: Operator, Technician, Campus Assistant, Coordinator.
 *
 * This component handles login for staff users:
 * - Calls mock API /login route with email + password
 * - Saves JWT token in localStorage
 * - Decodes token payload to extract role and user_id
 * - Updates auth store with user info
 * - Redirects user to the correct dashboard based on role
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '../../components/ui/card';
import { toast } from 'sonner';
import Logo from '../../components/ui/Logo';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import API from '../../services/mockData';

export default function PrivateLogin() {
  const navigate = useNavigate();
  const { loginPrivate } = useAuthStore();

  // Local state for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle form submission
   * - Prevent default form behavior
   * - Call mock API /login route
   * - Save token in localStorage
   * - Decode token to get role + user_id
   * - Update auth store
   * - Navigate to correct dashboard
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call mock API login route
      const response = await API.post('/login', { email, password });
      const { token } = response.data;

      if (!token) {
        throw new Error('No token returned from server');
      }

      // Login successful: update auth store with token + email
      loginPrivate(token, email);

      // Save token in localStorage for persistence
      localStorage.setItem('jwt_token', token);

      // Show success toast
      toast.success('Login successful!', {
        description: `Welcome back, ${email}`,
      });

      // Decode token payload safely to determine role for navigation
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token received from server');
      }

      const payload = JSON.parse(atob(parts[1]));
      const role = payload.role;
      const user_id = payload.user_id;

      if (!role) {
        throw new Error('No role found in token payload');
      }

      // Update auth store with role + user_id
      loginPrivate(token, email, role, user_id);

      // Navigate to appropriate dashboard
      const roleRoutes: Record<string, string> = {
        operator: '/dashboard/operator',
        technician: '/dashboard/technician',
        assistant: '/dashboard/assistant',
        coordinator: '/dashboard/coordinator',
      };

      navigate(roleRoutes[role] || '/dashboard/operator');
    } catch (error: any) {
      // Show error toast if login fails
      toast.error('Login failed', {
        description: error.response?.data?.message || error.message || 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Logo size={80} withBackground className="mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Staff Portal
            </h1>
            <p className="text-muted-foreground">
              BIUST Smart Maintenance System
            </p>
          </div>

          {/* Login Card */}
          <Card className="bg-white border-border shadow-xl">
            <CardHeader>
              <CardDescription className="text-muted-foreground">
                Enter your credentials to access the system
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="your.email@biust.ac.bw"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 bg-muted border-border text-foreground"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 bg-muted border-border text-foreground"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="w-full gap-2 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                    disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              For residents and students:
            </p>
            <Button
                variant="link"
                onClick={() => navigate('/')}
                className="text-primary hover:text-primary/80 font-semibold"
            >
              Resident Login
            </Button>
          </div>

          {/* Support Info */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p className="mt-1">
              For technical support: it.BSMsupport@biust.ac.bw
            </p>
          </div>
        </div>
      </div>
  );
}