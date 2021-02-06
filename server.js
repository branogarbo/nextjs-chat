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

let rooms = {};
// {
//    <roomID1>: {
//       sockets: [<socketID1>, <socketID2>, ...]
//    },
//    <roomID2>: {
//       sockets: [<socketID3>, <socketID4>, ...]
//    },
//    ...
// }


let roomIDs = [];

io.on('connection', socket => {
   console.log('someone connected');

   socket.on('msg', msg => {
      socket.broadcast.emit('msg', msg);
   });

   socket.on('typing', name => {
      socket.broadcast.emit('typing', name);
   });

   socket.on('joinRoom', roomID => {
      socket.join(roomID);
      rooms[roomID].sockets.push(socket.socketID);
   })
   
   socket.on('disconnect', socket => {
      console.log('someone disconnected');

      // value of roomID is still arbitrary atm
      socket.leave(roomID)
      if (!roomID.sockets.length) {
         delete rooms[roomID];

         // and then remove roomID from roomIDs
      }
   });
});

app.prepare().then(()=>{
   server.get('/', (req,res) => {
      res.send('DANG');
   })

   server.get('/rooms/:roomID', (req,res) => {
      let { roomID } = req.params;

      if (!roomIDs.includes(roomID)) {
         let newRoomID = uuidv4();

         roomIDs.push(newRoomID);
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