import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button.js';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in DeutschWelt component tree:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-card border border-gray-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-germanRed flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-navy">
              Etwas ist schiefgelaufen
            </h2>
            <p className="text-xs text-dark-muted leading-relaxed">
              An unexpected error occurred while rendering this page. You can reload the application or return to the homepage.
            </p>
            {this.state.error?.message && (
              <div className="p-3 bg-gray-50 rounded-xl text-[11px] font-mono text-gray-600 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <div className="pt-2 flex items-center justify-center gap-3">
              <Button variant="secondary" size="sm" onClick={this.handleReload} className="font-bold">
                <RotateCcw className="w-4 h-4 mr-1.5" /> Seite neu laden
              </Button>
              <Button variant="outline" size="sm" onClick={this.handleGoHome} className="font-bold">
                <Home className="w-4 h-4 mr-1.5" /> Zur Startseite
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
