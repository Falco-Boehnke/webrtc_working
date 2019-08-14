# webrtc_working

## Major issues
- Authoritative Server kann nicht von der Kommandozeile mit "node AuthoritativeSignalingServer.js" gestartet werden, da in der node umgebung keine Webrtc
Funktionen vorhanden sind und dadurch der Server abstürzt (z.b. im Versuch einen Client mit eigener RTCPeerConnection zu erstellen)
