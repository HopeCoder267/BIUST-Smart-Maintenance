/**
 * BIUST Smart Maintenance System - Private Login Page
 * 
 * JWT-based authentication for operations staff.
 * Supports roles: Operator, Technician, Campus Assistant, Coordinator
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { Building2, Lock, Mail, ArrowRight } from 'lucide-react';

/**
 * Mock login validation
 * In production, this would call a backend API with JWT
 */
const mockPrivateLogin = (email: string, password: string) => {

  //should call a backend API.
  return null;
};

/**
 * PrivateLogin Component
 * 
 * Login interface for operations staff with email and password
 */
export default function PrivateLogin() {
  const navigate = useNavigate();
  const { loginPrivate } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate credentials using authStore logic
      const result = useAuthStore.getState().loginPrivate ? 
        // We use the store's validation logic indirectly by calling a local version for the UI
        (() => {
          // some mock logic just to sign in easy on demonstration
          const mockStaff: Record<string, any> = {
            'coordinator@biust.ac.bw': {
              user: { id: 'staff-1', name: 'Kagiso Rapula', role: 'coordinator', email: 'coordinator@biust.ac.bw' },
              password: 'monday123',
              token: 'mock-jwt-token-coord'
            },
            'operator@biust.ac.bw': {
              user: { id: 'staff-2', name: 'Bonolo Korong', role: 'operator', email: 'operator@biust.ac.bw' },
              password: 'monday123',
              token: 'mock-jwt-token-oper'
            },
            'technician@biust.ac.bw': {
              user: { id: 'staff-3', name: 'Kagiso Pheke', role: 'technician', email: 'technician@biust.ac.bw' },
              password: 'monday123',
              token: 'mock-jwt-token-tech'
            },
            'assistant@biust.ac.bw': {
              user: { id: 'staff-4', name: 'Karabo Rapelang', role: 'campus_assistant', email: 'assistant@biust.ac.bw' },
              password: 'monday123',
              token: 'mock-jwt-token-assist'
            }
          };

          const staff = mockStaff[email];
          if (staff && staff.password === password) {
            return { user: staff.user, token: staff.token };
          }
          return null;
        })() : null;
      
      if (!result) {
        throw new Error('Invalid email or password');
      }
      
      // Login successful
      loginPrivate(result.user, result.token);
      
      toast.success('Login successful!', {
        description: `Welcome back, ${result.user.name}`,
      });
      
      // Navigate to appropriate dashboard
      const roleRoutes: Record<string, string> = {
        operator: '/dashboard/operator',
        technician: '/dashboard/technician',
        campus_assistant: '/dashboard/assistant',
        coordinator: '/dashboard/coordinator',
      };
      
      navigate(roleRoutes[result.user.role] || '/dashboard/operator');
    } catch (error) {
      toast.error('Login failed', {
        description: error instanceof Error ? error.message : 'Please try again',
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg shadow-primary/20">
            <Building2 className="w-8 h-8 text-white" />
          </div>
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
            {/*<CardTitle className="text-foreground">Operations Login</CardTitle>*/}
            <CardDescription className="text-muted-foreground">
              {/*Enter your credentials to access the system*/}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
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
              
              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" title="password text-foreground">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
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
        
        <div className="mt-6 text-center text-xs text-muted-foreground">
          {/*<p>Secure JWT-based authentication with RBAC</p>*/}
          <p className="mt-1">
            {/*For technical support: it.support@biust.ac.bw*/}
          </p>
        </div>
      </div>
    </div>
  );
}
