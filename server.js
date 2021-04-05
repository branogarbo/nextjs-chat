const express = require('express');
const next = require('next');
const socket = require('socket.io');
const { v4: uuidv4 } = require('uuid');

let dev = process.env.NODE_ENV !== "production";
let app = next({ dev });
let handler = app.getRequestHandler();

let server = express();
let port = 3000;
let listener = server.listen(port, console.log(`express listening on port ${port}`));
let io = socket(listener);

let rooms = { ids: [] };
// {
//    ids: [<roomID1>, <roomID2>, ...],
//    <roomID1>: {
//       sockets: [<socketID1>, <socketID2>, ...]
//    },
//    <roomID2>: {
//       sockets: [<socketID3>, <socketID4>, ...]
//    },
//    ...
// }

io.on('connection', socket => {
   console.log('someone connected');

   socket.on('msg', msg => {
      socket.to(socket.roomID).broadcast.emit('msg', msg);
   });

   socket.on('typing', name => {
      socket.to(socket.roomID).broadcast.emit('typing', name);
   });

   socket.on('joinRoom', roomID => {
      if (!rooms[roomID]) return;

      socket.join(roomID);
      
      socket.roomID = roomID;
      rooms[roomID].sockets.push(socket.id);

      console.log(rooms);
   })
   
   socket.on('disconnect', () => {
      console.log('someone disconnected');

      let { roomID } = socket;

      if (!rooms[roomID]) return;

      rooms[roomID].sockets  = rooms[roomID].sockets.filter(sock => sock != socket.id);
      
      if (!rooms[roomID].sockets.length) {
         delete rooms[roomID];

         rooms.ids = rooms.ids.filter(id => id != roomID);
      }
   });
});

app.prepare().then(()=>{
   server.get('/', (req,res) => {
      res.redirect('/rooms/new');
   })

   server.get('/rooms/:roomID', (req,res) => {
      let { roomID } = req.params;

      if (!rooms.ids.includes(roomID)) {
         let newRoomID = uuidv4();

         rooms.ids.push(newRoomID);
         rooms[newRoomID] = {
            sockets: []
         }

         res.redirect('/rooms/'+newRoomID);
      }
      else {
         app.render(req, res, '/', req.query);
      }
   })

   server.get('*', (req,res)=>{
      return handler(req, res);
   });
});