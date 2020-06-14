const express = require('express');
const next = require('next');
const socket = require('socket.io');

let dev = process.env.NODE_ENV !== "production";
let app = next({ dev });
let handler = app.getRequestHandler();

app.prepare().then(()=>{
   let server = express();
   let port = 3000;
   let listener = server.listen(port, console.log(`express listening on port ${port}`));
   let io = socket(listener);
   
   io.on('connection', socket=>{
      console.log('someone connected');
   
      socket.on('msg', msg=>{
         socket.broadcast.emit('msg', msg);
      });
   
      socket.on('typing', name=>{
         socket.broadcast.emit('typing', name);
      });
      
      socket.on('disconnect', socket=>{
         console.log('someone disconnected');
      });
   });

   server.get('*', (req,res)=>{
      return handler(req, res);
   });
});