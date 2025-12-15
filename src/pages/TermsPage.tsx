import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Lock, FileText, AlertCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

export default function TermsPage() {
  const [dataProcessingConsent, setDataProcessingConsent] = useState(false)
  const [medicalDataConsent, setMedicalDataConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleAcceptTerms = async () => {
    if (!dataProcessingConsent || !medicalDataConsent) {
      toast({
        title: "Consentement requis",
        description: "Vous devez accepter tous les consentements pour continuer",
        variant: "destructive"
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour accepter les conditions",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Log consents
      const { error: consentError } = await supabase.from('user_consents').insert([
        {
          user_id: user.id,
          consent_type: 'data_processing',
          consent_given: true,
          consent_text: 'Consentement pour le traitement des données personnelles'
        },
        {
          user_id: user.id,
          consent_type: 'medical_data',
          consent_given: true,
          consent_text: 'Consentement pour le traitement des données médicales'
        }
      ])

      if (consentError) throw consentError

      toast({
        title: "Consentements enregistrés",
        description: "Vos consentements ont été enregistrés avec succès"
      })

      navigate('/dashboard')
    } catch (error: any) {
      console.error('Error saving consents:', error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer vos consentements",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Conditions Générales d'Utilisation</h1>
          <p className="text-muted-foreground">Veuillez lire et accepter nos conditions</p>
        </div>

        {/* Security Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Sécurité & Conformité
            </CardTitle>
            <CardDescription>
              Notre engagement pour la protection de vos données
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Chiffrement SSL/TLS</h3>
                  <p className="text-sm text-muted-foreground">Toutes les communications sont chiffrées via HTTPS</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Authentification JWT</h3>
                  <p className="text-sm text-muted-foreground">Tokens sécurisés avec refresh automatique</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Conformité RGPD</h3>
                  <p className="text-sm text-muted-foreground">Protection des données personnelles</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Audit Trail</h3>
                  <p className="text-sm text-muted-foreground">Journalisation de toutes les actions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms Content */}
        <Card>
          <CardHeader>
            <CardTitle>1. Collecte et traitement des données</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Conformément au RGPD, nous collectons uniquement les données nécessaires au fonctionnement du service :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Données d'identification (nom, prénom, email, téléphone)</li>
              <li>Données de santé (ordonnances, historique médical) - chiffrées</li>
              <li>Données de localisation - uniquement pour la livraison</li>
              <li>Données de paiement - via prestataires certifiés PCI-DSS</li>
            </ul>
            <p className="font-semibold text-foreground">
              Vos données médicales sont chiffrées au repos et en transit.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Sécurité des données</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <ul className="list-disc pl-6 space-y-2">
              <li>Chiffrement AES-256 pour les données sensibles</li>
              <li>Rate limiting sur tous les endpoints sensibles</li>
              <li>Validation stricte de tous les fichiers uploadés (type, taille, scan antivirus)</li>
              <li>Headers de sécurité : HSTS, CSP, X-Frame-Options, X-XSS-Protection</li>
              <li>Backups automatiques quotidiens avec tests de restauration mensuels</li>
              <li>Mots de passe hashés avec bcrypt (coût 12)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Vos droits RGPD</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Vous disposez des droits suivants :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification de vos données</li>
              <li>Droit à l'effacement ("droit à l'oubli")</li>
              <li>Droit à la portabilité de vos données</li>
              <li>Droit d'opposition au traitement</li>
              <li>Droit de retirer votre consentement à tout moment</li>
            </ul>
            <p className="font-semibold text-foreground">
              Contact DPO : dpo@pharmago.sn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Conservation des données</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <ul className="list-disc pl-6 space-y-2">
              <li>Données de compte : durée de vie du compte + 3 ans</li>
              <li>Données médicales : 20 ans (obligation légale)</li>
              <li>Données de transaction : 10 ans (obligation comptable)</li>
              <li>Logs d'audit : 1 an minimum</li>
            </ul>
          </CardContent>
        </Card>

        {/* Consent Checkboxes */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-primary">Consentements obligatoires</CardTitle>
            <CardDescription>
              Vous devez accepter ces conditions pour utiliser le service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="data-processing"
                checked={dataProcessingConsent}
                onCheckedChange={(checked) => setDataProcessingConsent(checked as boolean)}
              />
              <label
                htmlFor="data-processing"
                className="text-sm leading-relaxed cursor-pointer"
              >
                J'accepte le traitement de mes données personnelles conformément au RGPD et je comprends que je peux retirer mon consentement à tout moment
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="medical-data"
                checked={medicalDataConsent}
                onCheckedChange={(checked) => setMedicalDataConsent(checked as boolean)}
              />
              <label
                htmlFor="medical-data"
                className="text-sm leading-relaxed cursor-pointer"
              >
                J'accepte le traitement de mes données de santé (ordonnances, prescriptions) de manière chiffrée et sécurisée pour les besoins de la livraison de médicaments
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex-1"
          >
            Retour au menu
          </Button>
          <Button
            onClick={handleAcceptTerms}
            disabled={!dataProcessingConsent || !medicalDataConsent || loading}
            className="flex-1"
          >
            {loading ? "Enregistrement..." : "Accepter et continuer"}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  )
}
