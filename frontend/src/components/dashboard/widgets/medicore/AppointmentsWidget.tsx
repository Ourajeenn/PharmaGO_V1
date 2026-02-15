import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AppointmentsWidget = () => {
    const [date, setDate] = useState<Date | undefined>(new Date());

    const appointments = [
        {
            id: 1,
            doctor: "Dr. Albert Smith",
            role: "Cardiologue",
            time: "11:30",
            date: "18 Aout"
        },
        {
            id: 2,
            doctor: "Dr. Sarah Connor",
            role: "Neurologue",
            time: "09:00",
            date: "22 Aout"
        }
    ];

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Rendez-vous <span className="text-gray-400 font-normal">({appointments.length})</span></h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"><MoreHorizontal className="h-4 w-4" /></Button>
            </div>

            {/* Calendar Container */}
            <div className="mb-6 bg-gray-50/80 rounded-3xl p-4 border border-gray-100 shadow-inner">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="w-full"
                    classNames={{
                        month: "space-y-4 w-full",
                        caption: "flex justify-center pt-1 relative items-center mb-2 font-bold text-gray-800",
                        caption_label: "text-sm font-bold uppercase tracking-wider",
                        nav: "space-x-1 flex items-center bg-white rounded-full p-1 shadow-sm absolute right-0",
                        nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 rounded-full transition-all",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex w-full justify-between mb-2",
                        head_cell: "text-gray-400 rounded-md w-8 font-normal text-[0.8rem] uppercase",
                        row: "flex w-full mt-2 justify-between",
                        cell: "h-8 w-8 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20",
                        day: "h-8 w-8 p-0 font-medium text-gray-600 aria-selected:opacity-100 hover:bg-white hover:shadow-sm hover:text-blue-500 rounded-full transition-all",
                        day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white hover:shadow-md focus:bg-blue-600 focus:text-white !font-bold",
                        day_today: "bg-blue-50 text-blue-600 font-bold",
                        day_outside: "text-gray-300 opacity-50",
                        day_disabled: "text-gray-300 opacity-50",
                        day_hidden: "invisible",
                    }}
                />
            </div>

            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">Prochains Médecins</h4>
            <div className="space-y-3 flex-1 overflow-y-auto pr-1 no-scrollbar">
                {appointments.map((apt) => (
                    <div key={apt.id} className="bg-white p-4 rounded-2xl flex items-center justify-between group hover:bg-gray-50 border border-gray-100 transition-all cursor-pointer shadow-sm hover:shadow-md hover:border-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${apt.doctor.replace(' ', '')}`} />
                                    <AvatarFallback>{apt.doctor[0]}</AvatarFallback>
                                </Avatar>
                                <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-900">{apt.doctor}</p>
                                <p className="text-xs text-gray-500 font-medium">{apt.role}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-900">{apt.time}</p>
                            <p className="text-[10px] text-gray-400">{apt.date}</p>
                        </div>
                    </div>
                ))}
            </div>

            <Button className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-6 font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                Prendre un rendez-vous
            </Button>
        </div>
    );
};
