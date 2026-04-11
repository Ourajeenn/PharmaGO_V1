
import { useState } from "react";
import { Bell, Check, Info, AlertTriangle, X, Loader2 } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationsPopover() {
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications();

    const [isOpen, setIsOpen] = useState(false);

    const getIcon = (type: string) => {
        switch (type) {
            case "success":
                return <Check className="h-4 w-4 text-green-500" />;
            case "warning":
                return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case "error":
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            default:
                return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'À l\'instant';
        if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
        return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;
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
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
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
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                            <Loader2 className="h-8 w-8 mb-2 opacity-50 animate-spin" />
                            <p className="text-sm">Chargement...</p>
                        </div>
                    ) : notifications.length === 0 ? (
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
                                                <span className="text-[10px] text-muted-foreground">
                                                    {formatTime(notification.created_at)}
                                                </span>
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
