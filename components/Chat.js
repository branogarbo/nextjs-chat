import io from 'socket.io-client'
import { useEffect, useState, useRef } from 'react'
import style from '../styles/Chat.module.css'

let socket;

let Message = ({ name, message, incoming }) => (
   <div className={incoming ? style.incoming : style.outgoing}>
      <div className={style.nameMsg}>{name}</div><br />
      <div className={style.message}>{message}</div>
   </div>
);

export default function Chat({ interactive }) {
   let nameInp = useRef('');
   let msgInp = useRef('');
   let infoMsg = useRef('Messages will appear here');

   let [ msgPool, setMsgPool ] = useState([]);
   
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
         
         msg.incoming = false;
         processMsg(msg);
      }
   }

   let processMsg = msg => {
      infoMsg.current.innerHTML = "";
      setMsgPool(prevMsgPool => [...prevMsgPool, msg]); // learn about updater function for states
   }

   let scrollToBottom = () => (
      infoMsg.current.scrollIntoView({
         behavior: 'smooth'
      })
   );

   let forgetIntrvl = null;

   let typingTiming = name => {
      infoMsg.current.innerHTML = `${name} is typing...`;

      clearTimeout(forgetIntrvl);

      forgetIntrvl = setTimeout(()=>{
         infoMsg.current.innerHTML = "";
      }, 1000);
   }

   let checkKey = event => {
      if (event.key == "Enter") return sendMsg();

      nameInp.current.value && socket.emit('typing', nameInp.current.value.trim());
   }

   useEffect(()=>{
      socket = io();

      socket.on('connection', socket=>{
         console.log('connected to server');
      });

      socket.on('msg', msg=>{
         msg.incoming = true;

         processMsg(msg);
         scrollToBottom();
      });

      socket.on('typing', name=>{
         typingTiming(name);
         scrollToBottom();
      });

      return () => socket.disconnect();
   }, []);

   useEffect(()=>{
      scrollToBottom();
   }, [msgPool]);

   return (
      <div className={style.container}>
         <div className={style.chatWindow}>
            <div>{messages}</div>
            <i ref={infoMsg} className={style.infoMsg}>Messages will appear here</i>
         </div>
         
         {interactive && (
         <div className={style.formEls}>   
            <input type="text" placeholder="name" ref={nameInp} onBlur={disableNameInp} onKeyDown={event => event.key == "Enter" && msgInp.current.focus()} />
            <input type="text" placeholder="message" ref={msgInp} onKeyDown={checkKey} />
            <input type="submit" onClick={sendMsg} />
         </div>
         )}
      </div>
   )
}