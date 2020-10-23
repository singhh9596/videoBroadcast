const peerConnections = {}
const config = {
    iceServers: [
        {
            urls: ["stun:stun.1.google.com:19302"]
        }
    ]
}


const socket = io.connect(window.location.origin)
const video = document.querySelector("video")

// media constrains
const constraints = {
    video: {
        facingMode: "user"
    },
    audio: true
}

socket.on("watcher", id => {
    const peerConnection = new RTCPeerConnection(config)
    peerConnections[id] = peerConnection;

    let stream = video.srcObject;
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream))

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit("candidate", id, event.candidate)
        }
    };
    peerConnection.createOffer().then(sdp => peerConnection.setLocalDescription(sdp)).then(() => {
        socket.emit("offer", id, peerConnection.localDescription)
    })
})

socket.on("answer", (id, description) => {
    peerConnections[id].setRemoteDescription(description)
})

socket.on("candidate", (id, candidate) => {
    peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate))
})

socket.on("disconnectPeer", id => {
    PeerConnections[id].close();
    delete peerConnections[id]
})

window.onunload = window.onbeforeunload = () => {
    socket.close();
}

socket.on("offer", (id, description) => {
    peerConnection = new RTCPeerConnection(config)
    peerConnection.setRemoteDescription(description).then(() => peerConnection.createAnswer()).then(sdp => peerConnection.setLocalDescription(sdp)).then(() => {
        socket.emit("answer", id, peerConnection.localDescription)
    })
    peerConnection.ontrack = event => {
        video.srcObject = event.streams[0]
    }
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit("candidate", id, event.candidate)
        }
    }
})

socket.on("candidate", (id, candidate) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e))
})

socket.on("connect", () => {
    socket.emit("watcher")
})

socket.on("broadcaster", () => {
    socket.emit("watcher")
})

socket.on("disconnectPeer", () => {
    peerConnection.close()
})

window.onunload = window.onbeforeunload = () => {
    socket.close()
}