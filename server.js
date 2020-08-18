const express = require('express');
const next = require('next');
const socket = require('socket.io');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser')

let dev = process.env.NODE_ENV !== "production";
let app = next({ dev });
let handler = app.getRequestHandler();

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

app.prepare().then(()=>{
   let dburl = process.env.DB_URL;
   let client = new MongoClient(dburl, { useNewUrlParser: true, useUnifiedTopology: true });

   server.use(bodyParser.json());

   server.get('/msgLog', (req,res)=>{
      client.db('nextjs').collection('chat-room-msg-log').find({}).toArray((err, msgs)=>{
         res.json({ log: msgs });
      });
   });

   server.post('/msgLog', (req,res)=>{
      let msg = req.body;

      console.log(msg);

      client.db('nextjs').collection('chat-room-msg-log').insertOne(msg, ()=>{
         res.end();
      });
   });

   server.get('*', (req,res)=>{
      return handler(req, res);
   });
});