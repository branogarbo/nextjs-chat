import io from 'socket.io-client'
import { useEffect, useState, useRef } from 'react'
import style from '../styles/Chat.module.css'

let socket;

let Message = ({ name, message }) => (
   <div className={style.message}>
      <b>{name}</b><br />
      <div>{message}</div>
   </div>
);

export default function Chat({ interactive }) {
   let nameInp = useRef('');
   let msgInp = useRef('');

   let [ msgPool, setMsgPool ] = useState([]);
   let [ infoBox, setInfoBox ] = useState('Messages will appear here');
   
   let messages = msgPool.map(msg => <Message {...msg} key={msgPool.indexOf(msg)} />);

   let disableNameInp = () => nameInp.current.value.trim() && (nameInp.current.disabled = true);

   let sendMsg = () => {
      let msg = {
         name: nameInp.current.value.trim(),
         message: msgInp.current.value.trim()
      };
      
      if (msg.name && msg.message) {
         msgInp.current.value = "";

         socket.emit('msg', msg);
      }
   }

   let forgetIntrvl = null;

   let typingTiming = name => {
      setInfoBox(`${name} is typing...`);

      clearTimeout(forgetIntrvl);

      forgetIntrvl = setTimeout(()=>{
         setInfoBox('');
      }, 1000);
   }

   let checkKey = event => {
      if (event.key == "Enter") return sendMsg();

      socket.emit('typing', nameInp.current.value.trim());
   }

   useEffect(()=>{
      socket = io('http://localhost:3000');

      socket.on('connection', socket=>{
         console.log('connected to server');
      });

      socket.on('msg', msg=>{
         setInfoBox('');
         setMsgPool(msgPool.push(msg)); // [...msgPool, msg] doesn't do the same thing for some reason
      });

      socket.on('typing', name=>{
         typingTiming(name);
      });

      return () => socket.disconnect();
   }, []);

   return (
      <div className="container">
         <div className={style.chatWindow}>
            {messages}
            <i>{infoBox}</i>
         </div>
         
         {interactive && (
         <div>   
            <input type="text" placeholder="name" ref={nameInp} onBlur={disableNameInp} onKeyDown={event => event.key == "Enter" && msgInp.current.focus()} />
            <input type="text" placeholder="message" ref={msgInp} onKeyDown={checkKey} />
            <input type="submit" onClick={sendMsg} />
         </div>
         )}
      </div>
   )
}