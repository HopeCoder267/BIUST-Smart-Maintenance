import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Global Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-red-100 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">Something went wrong</CardTitle>
              <CardDescription className="text-slate-500">
                An unexpected error has occurred and the application was unable to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {this.state.error && (
                <div className="p-3 bg-slate-100 rounded text-xs font-mono text-slate-700 overflow-auto max-h-32 border border-slate-200">
                  {this.state.error.toString()}
                </div>
              )}
              
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={this.handleReload}
                  className="w-full gap-2 bg-slate-900 text-white hover:bg-slate-800"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Try Again
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={this.handleReset}
                  className="w-full gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Home className="w-4 h-4" />
                  Return to Home
                </Button>
              </div>
              
              <p className="text-center text-xs text-slate-400">
                If the problem persists, please contact IT support at BSMsupport@biust.ac.bw
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
