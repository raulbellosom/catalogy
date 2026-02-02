import { Component } from "react";
import { ServerErrorPage } from "@/shared/ui/organisms";

/**
 * Error Boundary to catch React errors
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ServerErrorPage
          message={
            this.props.fallbackMessage ||
            "La aplicación encontró un error inesperado."
          }
        />
      );
    }

    return this.props.children;
  }
}
