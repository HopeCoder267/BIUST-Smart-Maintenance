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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivateAuthStore } from '../../store/privateAuthStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '../../components/ui/card';
import { toast } from 'sonner';
import Logo from '../../components/ui/Logo';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase';

export default function PrivateLogin() {
  const navigate = useNavigate();
  const { loginPrivate, initializeAuth, user, isAuthenticated } = usePrivateAuthStore();

  // Initialize Firebase Auth listener when component mounts
  useEffect(() => {
    console.log('PrivateLogin - Initializing Firebase Auth...');
    initializeAuth();
  }, [initializeAuth]);

  // Local state for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle form submission
   * - Use Firebase Authentication to sign in user
   * - Fetch user details from Firestore for RBAC
   * - Update auth store with user info
   * - Navigate to correct dashboard based on role
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (!firebaseUser) {
        throw new Error('Firebase authentication failed');
      }

      // Show success toast
      toast.success('Authentication successful!', {
        description: `Welcome back, ${email}`,
      });

      // The privateAuthStore's loginPrivate method will be called automatically by the auth state listener
      // since we already signed in with Firebase Auth
      // Use a more reliable approach to wait for auth state to update
      const checkAuthState = () => {
        console.log('Auth state after login:', { user, isAuthenticated });
        
        if (user && user.role && isAuthenticated) {
          const roleRoutes: Record<string, string> = {
            operator: '/dashboard/operator',
            technician: '/dashboard/technician',
            assistant: '/dashboard/assistant',
            coordinator: '/dashboard/coordinator',
          };

          navigate(roleRoutes[user.role] || '/dashboard/operator');
        } else {
          console.error('User role not found or not authenticated');
          toast.error('Login failed', {
            description: 'User role not found in system. Please contact administrator.',
          });
        }
      };

      // Check immediately and then set up interval to poll for auth state
      checkAuthState();
      const authCheckInterval = setInterval(() => {
        if (user && isAuthenticated) {
          clearInterval(authCheckInterval);
          checkAuthState();
        }
      }, 100);

      // Fallback timeout to prevent infinite polling
      setTimeout(() => {
        clearInterval(authCheckInterval);
        checkAuthState(); // Final attempt
      }, 2000);

    } catch (error: any) {
      // Show error toast if login fails
      let errorMessage = 'Please try again';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found. Check your email or contact support.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error('Login failed', {
        description: errorMessage,
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
                        autoComplete="username"
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