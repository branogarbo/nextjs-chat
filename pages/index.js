import Chat from '../components/Chat'

export default function ChatRoom() {
  return (
    <div className="container">

      <h2>Chat Room</h2>
      <Chat interactive={true} />
      
    </div>
  )
}