
import { useState } from "react";
import { Bell, Check, Info, AlertTriangle, X } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        title: "Commande confirmée",
        message: "Votre commande #12345 a été confirmée par la pharmacie.",
        time: "Il y a 2 min",
        type: "success",
        read: false,
    },
    {
        id: 2,
        title: "Rappel de médicament",
        message: "Il est l'heure de prendre votre Doliprane 1000mg.",
        time: "Il y a 15 min",
        type: "info",
        read: false,
    },
    {
        id: 3,
        title: "Nouveau message",
        message: "Le Dr. Kouassi vous a envoyé un message sécurisé.",
        time: "Il y a 1h",
        type: "info",
        read: true,
    },
    {
        id: 4,
        title: "Stock faible",
        message: "Votre boîte de Vitamine C est presque vide.",
        time: "Il y a 3h",
        type: "warning",
        read: true,
    },
];

export function NotificationsPopover() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id: number) => {
        setNotifications(
            notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
    };

    const deleteNotification = (id: number) => {
        setNotifications(notifications.filter((n) => n.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "success":
                return <Check className="h-4 w-4 text-green-500" />;
            case "warning":
                return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            default:
                return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full h-10 w-10 hover:bg-primary/10 transition-colors"
                >
                    <Bell className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 rounded-xl shadow-xl border-slate-100">
                <div className="flex items-center justify-between p-4 border-b bg-slate-50/50 rounded-t-xl">
                    <h4 className="font-bold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto px-2 py-1 text-primary hover:text-primary/80 hover:bg-primary/10"
                            onClick={markAllAsRead}
                        >
                            Tout marquer comme lu
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">Aucune notification</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`relative p-4 transition-colors hover:bg-slate-50 ${!notification.read ? "bg-blue-50/30" : ""
                                        }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notification.read ? "bg-blue-500" : "bg-transparent"
                                            }`} />

                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className={`text-sm font-medium leading-none ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground">{notification.time}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </p>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.id);
                                            }}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
