import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-background p-8 flex items-center justify-center">
          <section className="max-w-md text-center space-y-5">
            <AlertTriangle size={46} className="mx-auto text-destructive" />
            <h1 className="text-2xl font-bold">حدث خطأ غير متوقع</h1>
            <p className="text-muted-foreground">
              يرجى تحديث الصفحة ثم المحاولة مرة أخرى.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="primary-button inline-flex items-center gap-2"
            >
              <RotateCcw size={16} />
              تحديث الصفحة
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
