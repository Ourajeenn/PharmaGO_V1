import { Skeleton } from './skeleton';

interface PageSkeletonProps {
    variant?: 'card' | 'list' | 'dashboard';
}

export const PageSkeleton = ({ variant = 'dashboard' }: PageSkeletonProps) => {
    if (variant === 'card') {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-xl border p-6 space-y-4">
                            <Skeleton className="h-40 w-full rounded-lg" />
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (variant === 'list') {
        return (
            <div className="container mx-auto p-6 space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-full rounded-lg" />
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                        <Skeleton className="h-8 w-20 rounded-lg" />
                    </div>
                ))}
            </div>
        );
    }

    // Default: dashboard
    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-56" />
                <Skeleton className="h-9 w-32 rounded-lg" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="rounded-xl border p-4 space-y-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>

            {/* Content area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border p-6 space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
                <div className="rounded-xl border p-6 space-y-4">
                    <Skeleton className="h-6 w-40" />
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-3 w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PageSkeleton;
