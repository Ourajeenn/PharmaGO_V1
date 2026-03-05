import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { profiles } from '@/config/profiles';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

const ProfileSelection = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const activeProfile = profiles.find(p => p.id === hoveredCard);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-6 lg:p-12 selection:bg-primary selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-10000" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-7000" />
        <AnimatePresence>
          {activeProfile && (
            <motion.div
              key={activeProfile.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className={`absolute inset-0 ${activeProfile.color} blur-[150px]`}
            />
          )}
        </AnimatePresence>
      </div>

      {/* HUD Navigation */}
      <div className="absolute top-0 left-0 w-full p-6 lg:p-8 flex justify-between items-center z-50">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/10 transition-all rounded-full px-5 py-6 font-bold border border-white/5 hover:border-white/20 backdrop-blur-md group"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm uppercase tracking-widest hidden sm:inline-block">Retour Accueil</span>
        </Button>
      </div>

      <div className="max-w-7xl w-full space-y-10 lg:space-y-16 relative z-10 mt-16 sm:mt-10">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center space-y-6"
        >
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-white leading-tight">
            Choisissez votre <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent italic">espace</span>
          </h2>
          <p className="text-lg md:text-xl font-medium tracking-wide text-slate-400 max-w-2xl mx-auto h-12 md:h-8 transition-all duration-300">
            {activeProfile ? activeProfile.description : "Accédez à votre portail dédié sur PharmaGo"}
          </p>
        </motion.div>

        {/* Grille des profils */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {profiles.map((profile) => {
            const isHovered = hoveredCard === profile.id;
            const isDimmed = hoveredCard && hoveredCard !== profile.id;

            return (
              <motion.div
                key={profile.id}
                variants={itemVariants}
                className={`relative group cursor-pointer transition-all duration-500 ease-out ${isHovered ? 'scale-[1.03] z-20' : isDimmed ? 'opacity-40 scale-[0.98] z-10' : 'opacity-100 z-10'}`}
                onMouseEnter={() => setHoveredCard(profile.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => navigate(profile.route)}
              >
                {/* Glow behind card */}
                <div className={`absolute -inset-1 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-60 transition duration-500 ${profile.color}`} />

                <div className="relative h-full bg-slate-900/80 backdrop-blur-xl rounded-[2.2rem] p-8 border border-white/10 hover:border-white/20 overflow-hidden flex flex-col justify-between shadow-2xl">
                  {/* Decorative Gradient Blob */}
                  <div className={`absolute -top-16 -right-16 w-48 h-48 ${profile.color} opacity-0 group-hover:opacity-20 rounded-full blur-3xl transition-all duration-700 ease-out`} />

                  <div className="space-y-8 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className={`w-16 h-16 rounded-2xl ${profile.color} flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                        <profile.icon className="h-8 w-8" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors shadow-inner">
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                        {profile.title}
                      </h3>
                      <p className="text-sm font-semibold tracking-wide text-primary/80 uppercase">
                        {profile.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="mt-12 relative z-10">
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full w-0 group-hover:w-full transition-all duration-700 ease-out ${profile.color}`} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSelection;