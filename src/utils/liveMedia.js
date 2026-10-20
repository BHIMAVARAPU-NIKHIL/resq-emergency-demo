import { useEffect, useState } from 'react';

const CHANNEL_NAME = 'resq-live-media';

export function useLiveMedia(role, enabled, localStream = null) {
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const isSupported = typeof BroadcastChannel !== 'undefined' && typeof RTCPeerConnection !== 'undefined';
  const hasRequiredStream = role !== 'responder' || Boolean(localStream);

  useEffect(() => {
    if (!enabled || !isSupported || !hasRequiredStream) return undefined;

    const channel = new BroadcastChannel(CHANNEL_NAME);
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    const pendingCandidates = [];
    let offerStarted = false;
    let closed = false;

    const send = (message) => {
      channel.postMessage({ ...message, role });
    };

    const flushCandidates = async () => {
      while (pendingCandidates.length > 0 && peer.remoteDescription) {
        await peer.addIceCandidate(pendingCandidates.shift());
      }
    };

    peer.onicecandidate = ({ candidate }) => {
      if (candidate) send({ type: 'candidate', candidate: candidate.toJSON() });
    };

    peer.ontrack = ({ streams }) => {
      if (streams[0]) {
        setRemoteStream(streams[0]);
        setConnectionStatus('connected');
      }
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'connected') {
        setConnectionStatus('connected');
      } else if (peer.connectionState === 'failed') {
        setConnectionStatus('failed');
      } else if (peer.connectionState === 'disconnected' || peer.connectionState === 'closed') {
        setConnectionStatus('waiting');
        setRemoteStream(null);
      }
    };

    if (role === 'responder') {
      localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));
    }

    channel.onmessage = async ({ data }) => {
      if (!data || data.role === role || closed) return;

      try {
        if (role === 'responder' && data.type === 'guardian-ready' && !offerStarted) {
          offerStarted = true;
          setConnectionStatus('connecting');
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          send({ type: 'offer', description: peer.localDescription.toJSON() });
        } else if (role === 'guardian' && data.type === 'offer') {
          setConnectionStatus('connecting');
          await peer.setRemoteDescription(data.description);
          await flushCandidates();
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          send({ type: 'answer', description: peer.localDescription.toJSON() });
        } else if (role === 'responder' && data.type === 'answer') {
          await peer.setRemoteDescription(data.description);
          await flushCandidates();
        } else if (data.type === 'candidate') {
          if (peer.remoteDescription) {
            await peer.addIceCandidate(data.candidate);
          } else {
            pendingCandidates.push(data.candidate);
          }
        } else if (data.type === 'stop') {
          setRemoteStream(null);
          setConnectionStatus('waiting');
        }
      } catch (error) {
        console.error('Live media connection failed:', error);
        setConnectionStatus('failed');
      }
    };

    const announceReady = () => send({ type: `${role}-ready` });
    announceReady();
    const announceTimer = setInterval(announceReady, 1500);

    return () => {
      closed = true;
      clearInterval(announceTimer);
      send({ type: 'stop' });
      channel.close();
      peer.close();
      setRemoteStream(null);
    };
  }, [enabled, hasRequiredStream, isSupported, localStream, role]);

  return {
    remoteStream: enabled && isSupported && hasRequiredStream ? remoteStream : null,
    connectionStatus: !enabled
      ? 'idle'
      : !isSupported
        ? 'unsupported'
        : !hasRequiredStream
          ? 'waiting'
          : connectionStatus
  };
}
