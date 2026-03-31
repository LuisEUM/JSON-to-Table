"use client";

import React from "react";
import { logger } from "../services/logging-service";

interface TableErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface TableErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class TableErrorBoundary extends React.Component<
  TableErrorBoundaryProps,
  TableErrorBoundaryState
> {
  constructor(props: TableErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): TableErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
    logger.error("Table rendering error:", {
      error: error.message,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            role="alert"
            className="p-6 border border-destructive/50 rounded-md bg-destructive/5"
          >
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Error al renderizar la tabla
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.error?.message}
            </p>
            <button
              className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Reintentar
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
