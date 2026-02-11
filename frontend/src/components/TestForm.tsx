import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const TestForm = () => {
    const [value, setValue] = useState('');
    const [nativeValue, setNativeValue] = useState('');

    return (
        <div className="container mx-auto p-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Test de Formulaire Simple</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Input natif (HTML pur):
                        </label>
                        <input
                            type="text"
                            value={nativeValue}
                            onChange={(e) => setNativeValue(e.target.value)}
                            placeholder="Tapez ici..."
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            Valeur: {nativeValue || '(vide)'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Composant Input UI:
                        </label>
                        <Input
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="Tapez ici..."
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                            Valeur: {value || '(vide)'}
                        </p>
                    </div>

                    <Button onClick={() => alert(`Natif: "${nativeValue}"\\nUI: "${value}"`)}>
                        Afficher les valeurs
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Instructions de test</CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Essayez de taper dans le champ "Input natif"</li>
                        <li>Essayez de taper dans le champ "Composant Input UI"</li>
                        <li>Si l'un fonctionne et pas l'autre, cela indique où est le problème</li>
                        <li>Ouvrez la console (F12) et vérifiez s'il y a des erreurs</li>
                    </ol>
                </CardContent>
            </Card>
        </div>
    );
};
