import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Building2, Truck, Stethoscope, Shield, Globe } from 'lucide-react';

interface ProfileOption {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
}

const ProfileSelection = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const profiles: ProfileOption[] = [
    {
      id: 'patient',
      title: 'Patient',
      subtitle: 'Tableau de Bord Patient',
      description: 'Gérez vos commandes et prescriptions',
      icon: <User className="h-8 w-8" />,
      route: '/auth/patient',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'pharmacy',
      title: 'Pharmacie',
      subtitle: 'Pharmacie du Centre',
      description: 'Gestion des commandes et du stock',
      icon: <Building2 className="h-8 w-8" />,
      route: '/auth/pharmacy',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'driver',
      title: 'Livreur',
      subtitle: 'Interface Livreur',
      description: 'Gestion des livraisons et tournées',
      icon: <Truck className="h-8 w-8" />,
      route: '/auth/driver',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'doctor',
      title: 'Médecin',
      subtitle: 'Tableau Médecin',
      description: 'Gestion des patients et prescriptions',
      icon: <Stethoscope className="h-8 w-8" />,
      route: '/auth/doctor',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'insurer',
      title: 'Assurance Maladie',
      subtitle: 'Interface Assurance',
      description: 'Gestion des remboursements et CMU',
      icon: <Shield className="h-8 w-8" />,
      route: '/auth/insurer',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'visitor',
      title: 'Visiteur',
      subtitle: 'Mode Visiteur',
      description: 'Parcourir le catalogue sans compte',
      icon: <Globe className="h-8 w-8" />,
      route: '/',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header avec bouton retour */}
      <div className="container mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-12">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PharmaGo
            </h1>
            <p className="text-sm text-muted-foreground">Express Delivery</p>
          </div>
          
          <div className="w-32"></div> {/* Spacer pour centrer le titre */}
        </div>

        {/* Titre et description */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Choisissez votre profil
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sélectionnez le type de compte qui correspond à votre activité
          </p>
        </div>

        {/* Grille des profils */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto pb-16">
          {profiles.map((profile, index) => (
            <Card
              key={profile.id}
              className={`group relative overflow-hidden border-2 transition-all duration-500 hover:shadow-2xl hover:scale-105 cursor-pointer ${
                hoveredCard === profile.id ? 'border-primary' : 'border-border'
              } animate-fade-in`}
              style={{ 
                animationDelay: `${index * 150}ms`,
                animationFillMode: 'both'
              }}
              onMouseEnter={() => setHoveredCard(profile.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate(profile.route)}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${profile.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              <CardHeader className="relative z-10 text-center pb-4">
                <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${profile.color} flex items-center justify-center text-white mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12`}>
                  {profile.icon}
                </div>
                
                <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {profile.title}
                </CardTitle>
                
                <CardDescription className="text-lg font-semibold text-primary/80 mt-2">
                  {profile.subtitle}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10 text-center pb-8">
                <p className="text-muted-foreground text-base leading-relaxed mb-6">
                  {profile.description}
                </p>
                
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 font-semibold"
                >
                  Commencer
                </Button>
              </CardContent>
              
              {/* Effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-all duration-1000" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSelection;