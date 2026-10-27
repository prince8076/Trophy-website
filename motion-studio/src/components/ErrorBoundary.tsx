import { Component, type ReactNode } from 'react';
import ErrorPage from './ErrorPage';

// Catches any React crash anywhere in the app and shows the same
// 500 error page, instead of a blank screen or a browser error.
// Try again reloads the page; if the crash is in the initial load,
// the static public/500.html (same design, no JavaScript) is the
// fallback the host can serve.
export default class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    console.error('Shreeji site error:', error);
  }

  render(): ReactNode {
    if (this.state.hasError) return <ErrorPage code="500" />;
    return this.props.children;
  }
}
