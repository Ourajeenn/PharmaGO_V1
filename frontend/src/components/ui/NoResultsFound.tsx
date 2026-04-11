import { Search, PackageX, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface NoResultsFoundProps {
    searchQuery?: string;
    title?: string;
    description?: string;
    onRetry?: () => void;
    onGoBack?: () => void;
    showSuggestions?: boolean;
}

/**
 * NoResultsFound - Displays when a search or query returns no results
 */
export function NoResultsFound({
    searchQuery,
    title = "Aucun résultat trouvé",
    description,
    onRetry,
    onGoBack,
    showSuggestions = true
}: NoResultsFoundProps) {
    const defaultDescription = searchQuery
        ? `Aucun résultat pour "${searchQuery}"`
        : "L'information recherchée n'est pas disponible pour le moment.";

    return (
        <Card className="w-full max-w-lg mx-auto border-dashed border-2 border-slate-200 bg-slate-50/50">
            <CardContent className="py-12 px-8 text-center">
                {/* Icon */}
                <div className="relative mx-auto w-20 h-20 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full animate-pulse" />
                    <div className="relative flex items-center justify-center w-full h-full">
                        <PackageX className="h-10 w-10 text-slate-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                        <Search className="h-4 w-4 text-slate-500" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-slate-500 mb-6">
                    {description || defaultDescription}
                </p>

                {/* Suggestions */}
                {showSuggestions && (
                    <div className="bg-white rounded-lg p-4 mb-6 border border-slate-100 text-left">
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                            Suggestions :
                        </p>
                        <ul className="text-sm text-slate-600 space-y-1">
                            <li className="flex items-center gap-2">
                                <span className="text-primary">•</span>
                                Vérifiez l'orthographe de votre recherche
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-primary">•</span>
                                Utilisez des termes plus généraux
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-primary">•</span>
                                Essayez une autre catégorie
                            </li>
                        </ul>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {onGoBack && (
                        <Button variant="outline" onClick={onGoBack} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Retour
                        </Button>
                    )}
                    {onRetry && (
                        <Button onClick={onRetry} className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Réessayer
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * DataUnavailable - Displays when data is temporarily unavailable
 */
export function DataUnavailable({
    title = "Données indisponibles",
    description = "Cette information n'est pas disponible pour le moment. Veuillez réessayer plus tard.",
    onRetry
}: {
    title?: string;
    description?: string;
    onRetry?: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-full p-6 mb-6">
                <PackageX className="h-12 w-12 text-amber-600" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {title}
            </h2>

            <p className="text-slate-500 max-w-md mb-6">
                {description}
            </p>

            {onRetry && (
                <Button onClick={onRetry} variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Actualiser
                </Button>
            )}
        </div>
    );
}
