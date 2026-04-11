import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const PatientProfileWidget = () => {
    const { profile } = useAuth();

    // Calculate Age (Mock if missing)
    const getAge = () => {
        if (profile?.birth_date) {
            return new Date().getFullYear() - new Date(profile.birth_date).getFullYear();
        }
        return 28; // Default mock matching design
    };

    const getGender = () => {
        // Assuming 'gender' might exist in profile or we default
        return profile?.gender === 'female' ? 'Femme' : 'Homme';
    }

    return (
        <div className="bg-blue-600 rounded-[2rem] p-6 text-white relative overflow-hidden h-full flex flex-col shadow-xl shadow-blue-500/20 transition-transform hover:scale-[1.02] duration-300">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight text-white">{profile?.name || "James Henry"}</h2>
                        <div className="flex flex-col gap-0.5 text-blue-100/80 text-xs font-medium">
                            <span>Genre: {getGender()}</span>
                            <span>Age: {getAge()} ans</span>
                        </div>
                    </div>
                    <Avatar className="h-16 w-16 border-4 border-white/20 rounded-2xl shadow-sm">
                        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name || "User"} className="object-cover" />
                        <AvatarFallback className="rounded-2xl bg-blue-800 text-white font-bold text-xl">
                            {profile?.name?.charAt(0) || "P"}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="mt-auto">
                    <Badge className="bg-blue-500/50 hover:bg-blue-500/60 text-white border-0 backdrop-blur-md px-3 py-1.5 text-xs font-medium rounded-xl">
                        180 cm / 75 kg
                    </Badge>
                </div>
            </div>
        </div>
    );
};
