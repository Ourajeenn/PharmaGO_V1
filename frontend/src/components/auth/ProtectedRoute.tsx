import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

/**
 * ProtectedRoute - Wraps routes that require authentication
 * @param children - The component to render if authorized
 * @param allowedRoles - Optional array of roles that can access this route
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, profile, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Vérification de l'authentification...</p>
                </div>
            </div>
        );
    }

    // Not authenticated - redirect to auth page
    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Role-based access control
    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center space-y-4 p-8">
                    <div className="text-6xl">🚫</div>
                    <h1 className="text-2xl font-bold text-destructive">Accès Refusé</h1>
                    <p className="text-muted-foreground">
                        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Rôle requis: {allowedRoles.join(', ')} | Votre rôle: {profile.role}
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
