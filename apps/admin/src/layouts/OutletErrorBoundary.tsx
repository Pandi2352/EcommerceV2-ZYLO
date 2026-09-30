import React, { Component } from 'react';
import { useLocation, useNavigate, type Location } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '@shared/ui/Button';
import { ROUTES } from '../routes/routePaths';

interface Props {
  children: React.ReactNode;
  location: Location;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryKey: number;
  showDetails: boolean;
  copied: boolean;
}

class OutletErrorBoundaryInner extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryKey: 0,
      showDetails: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[OutletErrorBoundary] Error caught in admin section:', error, errorInfo);
    this.setState({ errorInfo });
  }

  componentDidUpdate(prevProps: Props) {
    // When the user clicks a different navigation menu, auto-reset the error state
    if (prevProps.location.pathname !== this.props.location.pathname) {
      if (this.state.hasError) {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          showDetails: false,
          copied: false,
        });
      }
    }
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryKey: prev.retryKey + 1,
      showDetails: false,
      copied: false,
    }));
  };

  handleCopy = () => {
    const { error, errorInfo } = this.state;
    const text = `Error: ${error?.name}: ${error?.message}\n\nComponent Stack:\n${errorInfo?.componentStack || 'N/A'}`;
    navigator.clipboard.writeText(text).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'An unexpected error occurred while loading this section.';

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-lg border border-slate-200/90 shadow-sm p-6 sm:p-8 text-center animate-fadeIn">
            {/* Ambient Danger Icon */}
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200/70 px-2.5 py-0.5 rounded-full mb-2">
              Section Load Error
            </span>

            <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              Unable to Display This Page
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
              An error occurred while loading this section. The navigation sidebar and your administrative session remain active and unaffected.
            </p>

            {/* Error Message Box */}
            <div className="my-5 p-3.5 bg-slate-50 border border-slate-200 rounded-md text-left">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Reported Error
              </p>
              <p className="text-xs font-mono text-rose-700 mt-1 break-words">
                {errorMessage}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={this.handleRetry}
                leftIcon={<RefreshCw className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Retry Section
              </Button>

              <OutletDashboardButton />
            </div>

            {/* Technical Details Toggle */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-left">
              <button
                type="button"
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="flex items-center justify-between w-full text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <span>Technical diagnostics</span>
                {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {this.state.showDetails && (
                <div className="mt-2.5 relative">
                  <pre className="text-[10px] font-mono bg-slate-900 text-slate-300 p-3 rounded-md overflow-x-auto max-h-48 custom-scrollbar">
                    {this.state.error?.stack || this.state.errorInfo?.componentStack || 'No stack trace available'}
                  </pre>
                  <button
                    type="button"
                    onClick={this.handleCopy}
                    className="absolute top-2 right-2 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-[10px] flex items-center gap-1 cursor-pointer"
                    title="Copy diagnostics"
                  >
                    {this.state.copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <React.Fragment key={this.state.retryKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

const OutletDashboardButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Button
      variant="outline"
      onClick={() => navigate(ROUTES.DASHBOARD)}
      leftIcon={<Home className="w-4 h-4" />}
      className="w-full sm:w-auto text-slate-700"
    >
      Go to Dashboard
    </Button>
  );
};

export const OutletErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <OutletErrorBoundaryInner location={location}>
      {children}
    </OutletErrorBoundaryInner>
  );
};

export default OutletErrorBoundary;
