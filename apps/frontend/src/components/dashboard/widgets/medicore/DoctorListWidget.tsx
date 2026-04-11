
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const doctors = [
    { id: 1, name: "Albert Smith", role: "Cardiologist", seed: "Albert" },
    { id: 2, name: "Sarah Connor", role: "Neurologist", seed: "Sarah" },
    { id: 3, name: "Emily Blunt", role: "Pediatrician", seed: "Emily" },
];

export const DoctorListWidget = () => {
    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm h-full flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Vos Médecins</h3>
                <Button variant="ghost" size="sm" className="text-blue-600 font-bold hover:bg-blue-50 text-xs rounded-full px-3">Tout voir</Button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                {doctors.map((doc) => (
                    <div key={doc.id} className="min-w-[140px] bg-gray-50/80 p-4 rounded-[1.5rem] flex flex-col items-center text-center gap-3 hover:bg-blue-50 transition-all duration-300 cursor-pointer group border border-transparent hover:border-blue-100 hover:shadow-lg hover:shadow-blue-100/50 hover:-translate-y-1">
                        <div className="flex w-full justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4 text-blue-400" />
                        </div>
                        <Avatar className="h-16 w-16 rounded-2xl bg-white shadow-sm ring-4 ring-white group-hover:ring-blue-100 transition-all">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.seed}`} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">{doc.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="pb-2">
                            <p className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{doc.name}</p>
                            <p className="text-[10px] text-gray-500 mt-1 font-medium bg-white px-2 py-1 rounded-full shadow-sm">{doc.role}</p>
                        </div>
                    </div>
                ))}

                <div className="min-w-[60px] flex items-center justify-center">
                    <Button variant="outline" className="h-12 w-12 rounded-full border-dashed border-2 bg-gray-50 hover:bg-white text-gray-300 hover:text-blue-500 hover:border-blue-400 transition-all font-bold text-2xl shadow-sm hover:shadow-md hover:scale-110 pb-1">+</Button>
                </div>
            </div>
        </div>
    );
};
