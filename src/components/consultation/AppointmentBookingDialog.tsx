import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, User, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppointmentBookingDialogProps {
    isOpen: boolean;
    onClose: () => void;
    specialty?: string;
}

const AppointmentBookingDialog = ({ isOpen, onClose, specialty = "Généraliste" }: AppointmentBookingDialogProps) => {
    const navigate = useNavigate();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    // Simulated time slots
    const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
    ];

    // Mock doctor based on specialty
    const getDoctor = (spec: string) => {
        switch (spec) {
            case "Pédiatre": return { name: "Dr. Traoré Aminata", title: "Pédiatre Certifié" };
            case "Gynécologue": return { name: "Dr. Bamba Salimata", title: "Gynécologue Obstétricien" };
            case "Dermatologue": return { name: "Dr. Diop Oumar", title: "Dermatologue" };
            default: return { name: "Dr. Kouassi Jean", title: "Médecin Généraliste" };
        }
    };

    const doctor = getDoctor(specialty);

    const handleConfirm = () => {
        if (date && selectedSlot) {
            // Navigate to doctor profile with appointment details
            // In a real app, we would pass these details via state or context
            navigate("/doctor/dr-kouassi"); // Keeping this hardcoded for now or could be dynamic
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Prendre rendez-vous - {specialty}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            Choisir une date
                        </h3>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                            locale={fr}
                            disabled={(date) => date < new Date() || date.getDay() === 0}
                        />
                    </div>

                    <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Disponibilités
                        </h3>
                        <ScrollArea className="h-[280px] pr-4">
                            <div className="grid grid-cols-2 gap-2">
                                {timeSlots.map((slot) => (
                                    <Button
                                        key={slot}
                                        variant={selectedSlot === slot ? "default" : "outline"}
                                        className="w-full"
                                        onClick={() => setSelectedSlot(slot)}
                                    >
                                        {slot}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <div className="bg-muted p-4 rounded-lg mt-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">{doctor.name}</p>
                            <p className="text-sm text-muted-foreground">{doctor.title}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Cocody, Abidjan</span>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleConfirm} disabled={!date || !selectedSlot}>
                        Confirmer le rendez-vous
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AppointmentBookingDialog;
