import Chat from '../components/Chat'

export default function ChatRoom({ msgLog }) {
  return (
    <div className="container">

      <h2>Chat Room</h2>
      <Chat initMsgs={msgLog} interactive={true} />
      
    </div>
  )
}

export async function getServerSideProps() {
  let msgLog = await fetch('http://localhost:3000/msgLog');

  console.log(msgLog);
  let { log } = await msgLog.json();

  console.log(log);
  
  return {
     props: { msgLog: log }
  }
}