import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap } from 'lucide-react';
import { profiles } from '@/config/profiles';

const ProfileSelection = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen mesh-gradient relative overflow-hidden flex flex-col items-center justify-center p-6 lg:p-12 selection:bg-primary selection:text-white">
      {/* HUD Navigation */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-white/40 transition-all rounded-xl px-4 font-bold border border-transparent hover:border-white/40"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs uppercase tracking-widest">Retour</span>
        </Button>
        <div className="flex items-center gap-2 pointer-events-none">
          <div className="w-8 h-8 bg-white/40 border border-white/60 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-primary font-black text-sm">P</span>
          </div>
          <span className="text-sm font-black uppercase tracking-widest text-foreground/80">Protocol v2.4</span>
        </div>
      </div>

      <div className="max-w-7xl w-full space-y-16 relative z-10 animate-in fade-in duration-1000">
        {/* Title Section */}
        <div className="text-center space-y-4">
          <h2 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase text-foreground/90 leading-[0.9]">
            Choisissez Votre <span className="text-primary tracking-normal italic">Identité</span>
          </h2>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground/60 max-w-2xl mx-auto">
            Sécurisez votre accès à l'écosystème PharmaGo
          </p>
        </div>

        {/* Grille des profils - Premium Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {profiles.map((profile, index) => (
            <div
              key={profile.id}
              className={`glass-card group p-1 transition-all duration-500 cursor-pointer ${hoveredCard === profile.id ? 'scale-[1.03] glow-border' : 'opacity-80 scale-100 border-white/20'
                }`}
              onMouseEnter={() => setHoveredCard(profile.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate(profile.route)}
            >
              <div className="bg-white/30 backdrop-blur-2xl rounded-[2.2rem] p-8 h-full flex flex-col justify-between border border-white/40 shadow-xl overflow-hidden relative">
                {/* Decorative Pattern */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 ${profile.color} opacity-5 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`} />

                <div className="space-y-6">
                  <div className={`w-14 h-14 rounded-2xl ${profile.color} flex items-center justify-center text-white shadow-2xl transition-transform duration-500 group-hover:rotate-12`}>
                    <profile.icon className="h-7 w-7" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-3xl font-black tracking-tighter text-foreground uppercase">
                      {profile.title}
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-80">
                      {profile.subtitle}
                    </p>
                  </div>

                  <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed min-h-[3rem]">
                    {profile.description}
                  </p>
                </div>

                <div className="mt-10">
                  <Button
                    className="w-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 font-black uppercase tracking-[0.1em] h-14 rounded-2xl group-hover:shadow-2xl flex items-center justify-center gap-2"
                  >
                    Démarrer la Session <Zap className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Footer */}

      </div>
    </div>
  );
};

export default ProfileSelection;