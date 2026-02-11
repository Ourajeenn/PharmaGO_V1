import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    Phone,
    PhoneOff,
    Monitor,
    MessageSquare,
    FileText,
    Clock,
    User,
    Shield,
    Maximize2,
    Settings,
    Camera,
    Volume2,
    VolumeX
} from 'lucide-react';
import { toast } from 'sonner';

interface Patient {
    id: string;
    name: string;
    avatar?: string;
    condition?: string;
}

interface VideoConsultationProps {
    patient?: Patient;
    appointmentId?: string;
    onEnd?: () => void;
}

export function VideoConsultation({ patient, appointmentId, onEnd }: VideoConsultationProps) {
    const [isCallActive, setIsCallActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [notes, setNotes] = useState('');
    const [isNotesOpen, setIsNotesOpen] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isCallActive) {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isCallActive]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startCall = async () => {
        try {
            // Request camera and microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            setIsCallActive(true);
            toast.success('Appel vidéo démarré');
        } catch (error) {
            console.error('Error accessing media devices:', error);
            toast.error('Impossible d\'accéder à la caméra/microphone');
        }
    };

    const endCall = () => {
        // Stop all tracks
        if (localVideoRef.current?.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }

        setIsCallActive(false);
        setCallDuration(0);
        toast.info('Appel terminé');
        onEnd?.();
    };

    const toggleMute = () => {
        if (localVideoRef.current?.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getAudioTracks().forEach(track => {
                track.enabled = isMuted;
            });
        }
        setIsMuted(!isMuted);
    };

    const toggleVideo = () => {
        if (localVideoRef.current?.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getVideoTracks().forEach(track => {
                track.enabled = !isVideoOn;
            });
        }
        setIsVideoOn(!isVideoOn);
    };

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true
                });
                // Handle screen share stream
                setIsScreenSharing(true);
                toast.success('Partage d\'écran activé');
            } catch (error) {
                toast.error('Partage d\'écran annulé');
            }
        } else {
            setIsScreenSharing(false);
            toast.info('Partage d\'écran arrêté');
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-700 overflow-hidden">
            <CardHeader className="bg-slate-800/50 border-b border-slate-700 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar className="h-10 w-10 border-2 border-green-500">
                                <AvatarImage src={patient?.avatar} />
                                <AvatarFallback className="bg-primary text-white">
                                    {patient?.name?.split(' ').map(n => n[0]).join('') || 'PT'}
                                </AvatarFallback>
                            </Avatar>
                            {isCallActive && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
                            )}
                        </div>
                        <div>
                            <CardTitle className="text-white text-sm">{patient?.name || 'Patient'}</CardTitle>
                            <p className="text-xs text-slate-400">{patient?.condition || 'Consultation vidéo'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isCallActive && (
                            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50 animate-pulse">
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                                {formatDuration(callDuration)}
                            </Badge>
                        )}
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                            <Shield className="h-3 w-3 mr-1" />
                            Chiffré E2E
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 relative">
                {/* Video Area */}
                <div className="relative aspect-video bg-slate-800">
                    {/* Remote Video (Patient) */}
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />

                    {/* Placeholder when no call */}
                    {!isCallActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                            <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center mb-4">
                                <User className="h-12 w-12 text-slate-500" />
                            </div>
                            <p className="text-slate-400 text-sm">En attente de connexion...</p>
                            <Button
                                onClick={startCall}
                                className="mt-4 bg-green-600 hover:bg-green-700"
                            >
                                <Video className="h-4 w-4 mr-2" />
                                Démarrer l'appel
                            </Button>
                        </div>
                    )}

                    {/* Local Video (Doctor - Picture in Picture) */}
                    {isCallActive && (
                        <div className="absolute bottom-4 right-4 w-48 aspect-video rounded-lg overflow-hidden border-2 border-slate-600 shadow-xl">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            {!isVideoOn && (
                                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                                    <VideoOff className="h-8 w-8 text-slate-500" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="bg-slate-800 border-t border-slate-700 p-4">
                    <div className="flex items-center justify-center gap-3">
                        {/* Mute */}
                        <Button
                            variant="outline"
                            size="icon"
                            className={`rounded-full h-12 w-12 ${isMuted ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-700 border-slate-600 text-white'}`}
                            onClick={toggleMute}
                        >
                            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </Button>

                        {/* Video Toggle */}
                        <Button
                            variant="outline"
                            size="icon"
                            className={`rounded-full h-12 w-12 ${!isVideoOn ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-700 border-slate-600 text-white'}`}
                            onClick={toggleVideo}
                        >
                            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                        </Button>

                        {/* Screen Share */}
                        <Button
                            variant="outline"
                            size="icon"
                            className={`rounded-full h-12 w-12 ${isScreenSharing ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-700 border-slate-600 text-white'}`}
                            onClick={toggleScreenShare}
                        >
                            <Monitor className="h-5 w-5" />
                        </Button>

                        {/* Notes */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-12 w-12 bg-slate-700 border-slate-600 text-white"
                            onClick={() => setIsNotesOpen(true)}
                        >
                            <FileText className="h-5 w-5" />
                        </Button>

                        {/* End Call */}
                        {isCallActive && (
                            <Button
                                variant="destructive"
                                size="icon"
                                className="rounded-full h-14 w-14 bg-red-600 hover:bg-red-700"
                                onClick={endCall}
                            >
                                <PhoneOff className="h-6 w-6" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>

            {/* Notes Dialog */}
            <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Notes de consultation
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Textarea
                            placeholder="Notez vos observations..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[200px]"
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => setIsNotesOpen(false)}>
                                Annuler
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => {
                                    toast.success('Notes enregistrées');
                                    setIsNotesOpen(false);
                                }}
                            >
                                Enregistrer
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

// Appointment Video Card for listing
export function VideoAppointmentCard({
    patient,
    time,
    onJoin
}: {
    patient: Patient;
    time: string;
    onJoin: () => void;
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={patient.avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Video className="h-3 w-3 text-white" />
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-900">{patient.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="h-3 w-3" />
                        {time}
                    </div>
                </div>
            </div>
            <Button onClick={onJoin} className="bg-blue-600 hover:bg-blue-700">
                <Video className="h-4 w-4 mr-2" />
                Rejoindre
            </Button>
        </div>
    );
}
