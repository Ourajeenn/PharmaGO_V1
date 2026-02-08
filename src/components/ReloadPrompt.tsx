import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'
import { Toast } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'
import { logger } from '@/utils/logger'

export function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            logger.log('SW Registered:', r)
        },
        onRegisterError(error) {
            logger.log('SW registration error', error)
        },
    })

    const { toast } = useToast()

    useEffect(() => {
        if (offlineReady) {
            toast({
                title: "Application prête pour hors-ligne",
                description: "PharmaGo fonctionne maintenant sans connexion internet.",
                duration: 5000,
            })
            setOfflineReady(false)
        }
    }, [offlineReady, setOfflineReady, toast])

    useEffect(() => {
        if (needRefresh) {
            toast({
                title: "Mise à jour disponible",
                description: "Une nouvelle version est disponible. Cliquez pour mettre à jour.",
                action: (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateServiceWorker(true)}
                    >
                        Mettre à jour
                    </Button>
                ),
                duration: Infinity,
            })
        }
    }, [needRefresh, updateServiceWorker, toast])

    return null
}
