/**
 * useWebRTC.ts — WebRTC P2P hook with Supabase Realtime signaling
 *
 * Usage:
 *   const { localStream, remoteStream, callState, initCall, joinCall, endCall } = useWebRTC(roomId);
 *
 * Flow:
 *   Caller  → initCall() → publishes offer → waits for answer + ICE
 *   Callee  → joinCall() → publishes answer → exchanges ICE
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended' | 'error';

interface SignalMessage {
    type: 'offer' | 'answer' | 'ice-candidate' | 'end';
    sender: string;
    payload: any;
}

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useWebRTC(roomId: string | undefined) {
    const [callState, setCallState] = useState<CallState>('idle');
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const peerRef = useRef<RTCPeerConnection | null>(null);
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
    const localIdRef = useRef<string>(`user-${Math.random().toString(36).slice(2, 9)}`);

    // ── Helpers ────────────────────────────────────────────────────────────────
    const publish = useCallback((msg: Omit<SignalMessage, 'sender'>) => {
        channelRef.current?.send({
            type: 'broadcast',
            event: 'signal',
            payload: { ...msg, sender: localIdRef.current },
        });
    }, []);

    const createPeer = useCallback((): RTCPeerConnection => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (ev) => {
            if (ev.candidate) {
                publish({ type: 'ice-candidate', payload: ev.candidate.toJSON() });
            }
        };

        pc.ontrack = (ev) => {
            const [stream] = ev.streams;
            setRemoteStream(stream ?? new MediaStream([ev.track]));
        };

        pc.onconnectionstatechange = () => {
            const state = pc.connectionState;
            if (state === 'connected') setCallState('connected');
            else if (state === 'failed' || state === 'closed') setCallState('ended');
        };

        return pc;
    }, [publish]);

    // ── Subscribe to signaling channel ────────────────────────────────────────
    const subscribeToChannel = useCallback(() => {
        if (!roomId) return;

        const ch = supabase
            .channel(`webrtc-${roomId}`)
            .on('broadcast', { event: 'signal' }, async (msg) => {
                const signal: SignalMessage = msg.payload as SignalMessage;
                if (signal.sender === localIdRef.current) return; // ignore own messages

                const pc = peerRef.current;
                if (!pc) return;

                if (signal.type === 'offer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    publish({ type: 'answer', payload: answer });
                    setCallState('connected');
                } else if (signal.type === 'answer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
                    setCallState('connected');
                } else if (signal.type === 'ice-candidate') {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(signal.payload));
                    } catch {
                        // ignore stale candidates
                    }
                } else if (signal.type === 'end') {
                    endCall();
                }
            })
            .subscribe();

        channelRef.current = ch;
    }, [roomId, publish]);

    useEffect(() => {
        subscribeToChannel();
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [subscribeToChannel]);

    // ── Get local media ────────────────────────────────────────────────────────
    const getLocalMedia = useCallback(async (): Promise<MediaStream> => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        return stream;
    }, []);

    // ── initCall : caller side ─────────────────────────────────────────────────
    const initCall = useCallback(async () => {
        if (!roomId) return;
        setCallState('calling');

        const stream = await getLocalMedia();
        const pc = createPeer();
        peerRef.current = pc;

        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        publish({ type: 'offer', payload: offer });
    }, [roomId, getLocalMedia, createPeer, publish]);

    // ── joinCall : callee side ─────────────────────────────────────────────────
    const joinCall = useCallback(async () => {
        if (!roomId) return;
        setCallState('ringing');

        const stream = await getLocalMedia();
        const pc = createPeer();
        peerRef.current = pc;

        stream.getTracks().forEach((t) => pc.addTrack(t, stream));
        // offer will arrive via channel → answer is sent inside subscribeToChannel
    }, [roomId, getLocalMedia, createPeer]);

    // ── endCall ────────────────────────────────────────────────────────────────
    const endCall = useCallback(() => {
        publish({ type: 'end', payload: null });

        localStream?.getTracks().forEach((t) => t.stop());
        remoteStream?.getTracks().forEach((t) => t.stop());

        peerRef.current?.close();
        peerRef.current = null;

        setLocalStream(null);
        setRemoteStream(null);
        setCallState('ended');
    }, [localStream, remoteStream, publish]);

    // ── toggleMute / toggleVideo ───────────────────────────────────────────────
    const toggleMute = useCallback(() => {
        localStream?.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
    }, [localStream]);

    const toggleVideo = useCallback(() => {
        localStream?.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
    }, [localStream]);

    const shareScreen = useCallback(async () => {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const sender = peerRef.current?.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) await sender.replaceTrack(screen.getVideoTracks()[0]);
    }, []);

    return {
        callState,
        localStream,
        remoteStream,
        initCall,
        joinCall,
        endCall,
        toggleMute,
        toggleVideo,
        shareScreen,
    };
}

export default useWebRTC;
