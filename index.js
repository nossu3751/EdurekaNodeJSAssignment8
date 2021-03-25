import express from 'express';
import http from 'http';
import socketio from 'socket.io';

let app = express();

app.set('port', 8005);
app.use(express.static(__dirname + '/public'));



//http server created using express app
let server = http.createServer(app).listen(app.get('port'), ()=>{
    console.log("Express server listening on port " + app.get('port'));
});

let io = socketio(server)

io.sockets.on('connection',(socket)=>{
    //emit events with labels
    socket.on('nick',(nick)=>{
        console.log(nick);
        socket.nickname = nick;
    });

    socket.on('chat',(chat)=>{
        let nickname = socket.nickname?socket.nickname:"Anonymous";
        let payload = {
            message:chat.message,
            nick:nickname,
            time:new Date().toTimeString()
        }

        socket.emit('chat', payload);
        socket.broadcast.emit('chat', payload)
    })
})
