import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  CheckCircle, 
  AlertTriangle,
  QrCode,
  Copy,
  ArrowLeft
} from 'lucide-react'

interface TwoFactorAuthProps {
  userId: string
  onComplete?: () => void
  onBack?: () => void
}

export const TwoFactorAuth = ({ userId, onComplete, onBack }: TwoFactorAuthProps) => {
  const [step, setStep] = useState<'setup' | 'verify' | 'methods'>('methods')
  const [method, setMethod] = useState<'sms' | 'email' | 'totp'>('sms')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const { toast } = useToast()

  const sendSMSCode = async () => {
    setLoading(true)
    try {
      // Simulation d'envoi SMS
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: "Code envoyé",
        description: `Un code à 6 chiffres a été envoyé au ${phone}`,
      })
      setStep('verify')
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le code SMS",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const sendEmailCode = async () => {
    setLoading(true)
    try {
      // Simulation d'envoi email
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: "Code envoyé",
        description: `Un code à 6 chiffres a été envoyé à ${email}`,
      })
      setStep('verify')
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le code par email",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const setupTOTP = async () => {
    setLoading(true)
    try {
      // Génération QR code pour authentificateur
      const secret = 'JBSWY3DPEHPK3PXP' // En production, générer un secret unique
      const qrCodeUrl = `otpauth://totp/PharmaGo:${userId}?secret=${secret}&issuer=PharmaGo`
      setQrCode(qrCodeUrl)
      
      // Génération des codes de secours
      const codes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      )
      setBackupCodes(codes)
      setStep('verify')
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de configurer l'authentificateur",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async () => {
    setLoading(true)
    try {
      // Simulation de vérification
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (code.length === 6) {
        setIs2FAEnabled(true)
        toast({
          title: "2FA activé",
          description: "L'authentification à deux facteurs a été configurée avec succès",
        })
        onComplete?.()
      } else {
        throw new Error('Code invalide')
      }
    } catch (error) {
      toast({
        title: "Code invalide",
        description: "Veuillez vérifier le code et réessayer",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copié",
      description: "Code copié dans le presse-papiers",
    })
  }

  if (step === 'methods') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Authentification à deux facteurs
              </CardTitle>
              <CardDescription>
                Choisissez votre méthode de vérification préférée
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {is2FAEnabled && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                L'authentification à deux facteurs est activée
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <Card 
              className={`cursor-pointer transition-colors hover:bg-accent ${
                method === 'sms' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setMethod('sms')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">SMS</h3>
                    <p className="text-sm text-muted-foreground">
                      Recevoir un code par SMS
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    Recommandé
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors hover:bg-accent ${
                method === 'email' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setMethod('email')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-sm text-muted-foreground">
                      Recevoir un code par email
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors hover:bg-accent ${
                method === 'totp' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setMethod('totp')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Key className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">Application d'authentification</h3>
                    <p className="text-sm text-muted-foreground">
                      Google Authenticator, Authy, etc.
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    Plus sécurisé
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button 
            className="w-full" 
            onClick={() => setStep('setup')}
            disabled={!method}
          >
            Continuer avec {method === 'sms' ? 'SMS' : method === 'email' ? 'Email' : 'Authentificateur'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (step === 'setup') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Configuration 2FA
          </CardTitle>
          <CardDescription>
            {method === 'sms' && 'Entrez votre numéro de téléphone'}
            {method === 'email' && 'Entrez votre adresse email'}
            {method === 'totp' && 'Scannez le QR code avec votre application'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {method === 'sms' && (
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+225 XX XX XX XX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          )}

          {method === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {method === 'totp' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Scannez ce QR code avec votre application d'authentification
                </p>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Assurez-vous de sauvegarder ces codes de secours dans un endroit sûr
                </AlertDescription>
              </Alert>

              {backupCodes.length > 0 && (
                <div className="space-y-2">
                  <Label>Codes de secours</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded font-mono text-sm"
                      >
                        {code}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('methods')} className="flex-1">
              Retour
            </Button>
            <Button 
              className="flex-1" 
              onClick={method === 'sms' ? sendSMSCode : method === 'email' ? sendEmailCode : setupTOTP}
              disabled={loading || (method === 'sms' && !phone) || (method === 'email' && !email)}
            >
              {loading ? 'Configuration...' : 'Envoyer le code'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Vérification du code
        </CardTitle>
        <CardDescription>
          Entrez le code de vérification à 6 chiffres
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Code de vérification</Label>
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            className="justify-center"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {method === 'sms' && `Code envoyé au ${phone}`}
            {method === 'email' && `Code envoyé à ${email}`}
            {method === 'totp' && 'Utilisez votre application d\'authentification'}
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep('setup')} className="flex-1">
            Retour
          </Button>
          <Button 
            className="flex-1" 
            onClick={verifyCode}
            disabled={loading || code.length !== 6}
          >
            {loading ? 'Vérification...' : 'Vérifier'}
          </Button>
        </div>

        <div className="text-center">
          <Button variant="link" className="text-sm">
            Renvoyer le code
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}