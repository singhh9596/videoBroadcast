const express = require('express')
const app = express()
const port = 4000;
const socket = require("socket.io")

const http = require("http")
const server = http.createServer(app)

const io = require("socket.io")(server)
app.use(express.static(__dirname + "/public"))

let broadcaster

io.sockets.on('connection', socket =>{
    socket.on("broadcaster",() =>{
        broadcaster = socket.id;
        socket.broadcast.emit("broadcaster")
    })
    socket.on("watcher", ()=>{
        socket.to(broadcaster).emit("watcher", socket.id)
    })
    socket.on("disconnect", () =>{
        socket.io(broadcaster).emit("disconnectPeer", socket.id)
    })
    socket.on("offer", (id, message)=>{
        socket.to(id).emit("offer", socket.id, message)
    })
    socket.on("answer", (id, message)=>{
        socket.to(id).emit("answer", socket.id, message)
    })
    socket.on("candidate", (id, message)=>{
        socket.to(id).emit("candidate", socket.id, message)
    })
})


io.sockets.on("error", e =>console.log(e))
server.listen(port, () =>console.log(`server running on port ${port}`))