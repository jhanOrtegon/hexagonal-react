import React from 'react';

import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/presentation/shared/components/ui/alert';
import { Button } from '@/presentation/shared/components/ui/button';

interface ErrorBoundaryProps {
  readonly children: React.ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
  readonly errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * Captura errores de React y muestra UI amigable
 * En producción, debería loguear errores a un servicio externo
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // TODO: En producción, enviar a servicio de logging (Sentry, LogRocket, etc.)
    // logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  private readonly handleReset: () => void = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-2xl space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                An unexpected error occurred. We&apos;ve been notified and are working on a fix.
              </AlertDescription>
            </Alert>

            {this.state.error !== null && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <h3 className="mb-2 font-semibold text-red-900">Error Details:</h3>
                <pre className="mb-4 overflow-auto rounded bg-white p-3 text-sm text-red-800">
                  {this.state.error.toString()}
                </pre>

                {import.meta.env.DEV && this.state.errorInfo !== null && (
                  <>
                    <h3 className="mb-2 font-semibold text-red-900">Component Stack:</h3>
                    <pre className="overflow-auto rounded bg-white p-3 text-xs text-red-700">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <Button onClick={this.handleReset} variant="outline">
                Try Again
              </Button>
              <Button
                onClick={(): void => {
                  window.location.reload();
                }}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
