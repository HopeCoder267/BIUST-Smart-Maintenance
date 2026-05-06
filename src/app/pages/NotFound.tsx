/**
 * BIUST Smart Maintenance System - 404 Not Found Page
 * 
 * Displayed when user navigates to a non-existent route
 */

import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white border-border shadow-xl">
        <CardContent className="p-12 text-center">
          {/* 404 Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
            <span className="text-4xl font-bold text-primary">404</span>
          </div>
          
          {/* Heading */}
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Page Not Found
          </h1>
          
          {/* Description */}
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="gap-2 border-border text-foreground hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="gap-2 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </Button>
          </div>
          
          {/* Help Text */}
          <p className="text-sm text-muted-foreground mt-8">
            Need help? Contact support at{' '}
            <a href="mailto:support@biust.ac.bw" className="text-primary hover:underline font-medium">
              support@biust.ac.bw
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
