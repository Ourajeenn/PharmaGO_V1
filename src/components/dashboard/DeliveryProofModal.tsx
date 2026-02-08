import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Camera, Signature, CheckCircle, Upload, Loader2, MapPin,
    User, Package, Phone, Clock, Shield, X, RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'

interface DeliveryProofProps {
    orderId: string
    customerName: string
    customerPhone: string
    customerAddress: string
    items: Array<{ name: string; quantity: number }>
    onComplete: (proofData: ProofData) => void
    onCancel: () => void
}

interface ProofData {
    orderId: string
    signature: string | null
    photo: string | null
    confirmationCode: string
    timestamp: string
    location: { lat: number; lng: number } | null
}

export const DeliveryProofModal = ({
    orderId,
    customerName,
    customerPhone,
    customerAddress,
    items,
    onComplete,
    onCancel
}: DeliveryProofProps) => {
    const [step, setStep] = useState<'info' | 'signature' | 'photo' | 'code' | 'complete'>('info')
    const [signatureData, setSignatureData] = useState<string | null>(null)
    const [photoData, setPhotoData] = useState<string | null>(null)
    const [confirmationCode, setConfirmationCode] = useState('')
    const [isDrawing, setIsDrawing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Get geolocation on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.warn('Geolocation error:', err)
            )
        }
    }, [])

    // Setup canvas when signature step is active
    useEffect(() => {
        if (step === 'signature' && canvasRef.current) {
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.fillStyle = '#FFFFFF'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.strokeStyle = '#1a1a2e'
                ctx.lineWidth = 2
                ctx.lineCap = 'round'
            }
        }
    }, [step])

    // Canvas drawing handlers
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        setIsDrawing(true)
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const rect = canvas.getBoundingClientRect()

        let x, y
        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left
            y = e.touches[0].clientY - rect.top
        } else {
            x = e.clientX - rect.left
            y = e.clientY - rect.top
        }

        ctx?.beginPath()
        ctx?.moveTo(x, y)
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !canvasRef.current) return
        const ctx = canvasRef.current.getContext('2d')
        const rect = canvasRef.current.getBoundingClientRect()

        let x, y
        if ('touches' in e) {
            e.preventDefault()
            x = e.touches[0].clientX - rect.left
            y = e.touches[0].clientY - rect.top
        } else {
            x = e.clientX - rect.left
            y = e.clientY - rect.top
        }

        ctx?.lineTo(x, y)
        ctx?.stroke()
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    const clearSignature = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        ctx?.fillRect(0, 0, canvas.width, canvas.height)
        setSignatureData(null)
    }

    const saveSignature = () => {
        if (!canvasRef.current) return
        const dataUrl = canvasRef.current.toDataURL('image/png')
        setSignatureData(dataUrl)
        setStep('photo')
    }

    // Photo capture handlers
    const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPhotoData(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const skipPhoto = () => {
        setStep('code')
    }

    // Confirmation code validation
    const validateCode = () => {
        // In production: validate against order's confirmation code
        if (confirmationCode.length < 4) {
            toast.error('Code invalide - minimum 4 caractères')
            return
        }
        setStep('complete')
    }

    // Complete delivery
    const completeDelivery = async () => {
        setLoading(true)
        try {
            const proofData: ProofData = {
                orderId,
                signature: signatureData,
                photo: photoData,
                confirmationCode,
                timestamp: new Date().toISOString(),
                location
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            onComplete(proofData)
            toast.success('Livraison confirmée avec succès!')
        } catch (error) {
            toast.error('Erreur lors de la confirmation')
        } finally {
            setLoading(false)
        }
    }

    const getStepNumber = () => {
        const steps = ['info', 'signature', 'photo', 'code', 'complete']
        return steps.indexOf(step) + 1
    }

    return (
        <Dialog open onOpenChange={() => onCancel()}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        Preuve de Livraison
                    </DialogTitle>
                </DialogHeader>

                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <div
                            key={n}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${getStepNumber() === n
                                    ? 'bg-primary text-white scale-110'
                                    : getStepNumber() > n
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            {getStepNumber() > n ? '✓' : n}
                        </div>
                    ))}
                </div>

                {/* Step 1: Order Info */}
                {step === 'info' && (
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="pt-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-primary" />
                                    <span className="font-mono text-sm">#{orderId.slice(-8).toUpperCase()}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">{customerName}</p>
                                        <p className="text-sm text-muted-foreground">{customerPhone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <p className="text-sm">{customerAddress}</p>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                    <p className="text-sm font-medium mb-1">Articles:</p>
                                    {items.map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span>{item.name}</span>
                                            <span>x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Button className="w-full" onClick={() => setStep('signature')}>
                            Commencer la confirmation
                        </Button>
                    </div>
                )}

                {/* Step 2: Signature */}
                {step === 'signature' && (
                    <div className="space-y-4">
                        <div className="text-center">
                            <Signature className="h-10 w-10 mx-auto text-primary mb-2" />
                            <h3 className="font-semibold">Signature du Client</h3>
                            <p className="text-sm text-muted-foreground">
                                Demandez au client de signer ci-dessous
                            </p>
                        </div>

                        <div className="border-2 border-dashed border-primary/30 rounded-lg p-2">
                            <canvas
                                ref={canvasRef}
                                width={350}
                                height={150}
                                className="w-full cursor-crosshair rounded bg-white touch-none"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={clearSignature} className="flex-1">
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Effacer
                            </Button>
                            <Button onClick={saveSignature} className="flex-1">
                                Valider
                                <CheckCircle className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Photo */}
                {step === 'photo' && (
                    <div className="space-y-4">
                        <div className="text-center">
                            <Camera className="h-10 w-10 mx-auto text-primary mb-2" />
                            <h3 className="font-semibold">Photo de Livraison</h3>
                            <p className="text-sm text-muted-foreground">
                                Prenez une photo des articles livrés (optionnel)
                            </p>
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            ref={fileInputRef}
                            onChange={handlePhotoCapture}
                            className="hidden"
                        />

                        {photoData ? (
                            <div className="relative">
                                <img
                                    src={photoData}
                                    alt="Preuve"
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={() => setPhotoData(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div
                                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Cliquez pour prendre une photo
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={skipPhoto} className="flex-1">
                                Passer
                            </Button>
                            <Button onClick={() => setStep('code')} className="flex-1" disabled={!photoData}>
                                Continuer
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 4: Confirmation Code */}
                {step === 'code' && (
                    <div className="space-y-4">
                        <div className="text-center">
                            <Shield className="h-10 w-10 mx-auto text-primary mb-2" />
                            <h3 className="font-semibold">Code de Confirmation</h3>
                            <p className="text-sm text-muted-foreground">
                                Entrez le code fourni par le client
                            </p>
                        </div>

                        <Input
                            type="text"
                            placeholder="Code à 4 chiffres"
                            value={confirmationCode}
                            onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                            className="text-center text-2xl font-mono tracking-widest"
                            maxLength={6}
                        />

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep('photo')} className="flex-1">
                                Retour
                            </Button>
                            <Button onClick={validateCode} className="flex-1">
                                Valider
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 5: Complete */}
                {step === 'complete' && (
                    <div className="space-y-4">
                        <div className="text-center py-4">
                            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-green-700">Prêt à confirmer!</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Toutes les preuves ont été collectées
                            </p>
                        </div>

                        {/* Summary */}
                        <Card>
                            <CardContent className="pt-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Signature</span>
                                    <Badge variant={signatureData ? "default" : "secondary"}>
                                        {signatureData ? '✓ Capturée' : 'Non fournie'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Photo</span>
                                    <Badge variant={photoData ? "default" : "secondary"}>
                                        {photoData ? '✓ Capturée' : 'Non fournie'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Code</span>
                                    <Badge>{confirmationCode}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Position GPS</span>
                                    <Badge variant={location ? "default" : "secondary"}>
                                        {location ? '✓ Enregistrée' : 'Non disponible'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={completeDelivery}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Confirmation...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Confirmer la livraison
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default DeliveryProofModal
