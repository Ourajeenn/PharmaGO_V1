import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });
        // Log to monitoring service in production
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6">
                    <div className="max-w-lg w-full text-center space-y-8">
                        {/* Icon */}
                        <div className="relative mx-auto w-24 h-24">
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-100 to-orange-100 animate-pulse" />
                            <div className="relative w-full h-full rounded-3xl bg-white shadow-xl border border-red-100 flex items-center justify-center">
                                <AlertTriangle className="h-10 w-10 text-red-500" />
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-3">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                Oups ! Une erreur est survenue
                            </h1>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed">
                                Un problème inattendu s'est produit. Notre équipe a été notifiée.
                                Veuillez réessayer ou retourner à l'accueil.
                            </p>
                        </div>

                        {/* Error details (dev only) */}
                        {import.meta.env.DEV && this.state.error && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-left overflow-auto max-h-40">
                                <p className="text-xs font-mono text-red-700 font-bold mb-1">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <pre className="text-[10px] text-red-500 mt-2 whitespace-pre-wrap">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={this.handleReset}
                                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Réessayer
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
                            >
                                <Home className="h-4 w-4" />
                                Accueil
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
