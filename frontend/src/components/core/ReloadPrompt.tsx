import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from 'react'

export const ReloadPrompt = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    })

    const { toast } = useToast()

    const close = () => {
        setOfflineReady(false)
        setNeedRefresh(false)
    }

    useEffect(() => {
        if (offlineReady) {
            toast({
                title: "Mode hors-ligne prêt",
                description: "L'application peut maintenant fonctionner sans connexion internet.",
                duration: 5000,
            })
            setOfflineReady(false)
        }
    }, [offlineReady, toast, setOfflineReady])

    useEffect(() => {
        if (needRefresh) {
            toast({
                title: "Mise à jour disponible",
                description: "Une nouvelle version est disponible. Veuillez rafraîchir.",
                action: (
                    <ToastAction altText="Rafraîchir" onClick={() => updateServiceWorker(true)}>
                        Rafraîchir
                    </ToastAction>
                ),
                duration: Infinity,
            })
        }
    }, [needRefresh, toast, updateServiceWorker])

    return null
}
