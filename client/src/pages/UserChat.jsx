import { useEffect, useState, useRef } from "react";
import { socket } from "../socket"; // adding socket import from socket.js in src
import {
  createChat,
  getUserChat,
  sendUserMessage
} from "../services/chatService";


// this type of chating is known as polling , where we send server request again and again to check is there new message or not. 
//  but it creates problem when we have multiple clients so they all will send request to the server , hence it will overburden ther server
//so instead of this  polling method  we prefer websocket.


const UserChat = () => {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);

  const bottomRef = useRef(null);



 /* ===============================
     CONNECT SOCKET  -
    When this React component opens → connect to socket server. When component closes → disconnect.
  =============================== */
  useEffect(() => {
  socket.connect(); // because in socket.js autoconnect was false, hence manually connecting , This triggers backend server.js:-   io.on("connection", (socket) => {})
socket.emit("registerRole", "USER");

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id); // this is built in This is a built-in frontend event.It fires when connection to server is successful.
  });

  return () => {
    socket.disconnect(); // cleanup function
  };
}, []);





  /* 
     INIT CHAT , instead of using use effect after the initChat function and calling there the initChat function
     i am directly writing the  init function inside useEffect block , now it will run only once when the page load and no red lines will be shown as lint error
*/
  useEffect(() => {
    const initChat = async () => {
      try {
        const res = await createChat();
        const id = res.data.chat.id;

        setChatId(id);

        const msgRes = await getUserChat(id);
        setMessages(msgRes.data.messages);
        
      } catch (err) {
        console.log("Init chat error", err);
      }
    };

    initChat();
  }, []);


  /* ===============================
     JOIN chat ROOM + LISTEN - 
     first line joins the chat room as per chat id  and second line gives us the messages from that id.

     it is inside useEffect hence run once when the chat id changes .
     
  =============================== */
  useEffect(() => {
    if (!chatId) return;

    // Join socket room  , this sends event to backend ,  it is inside server.js
    socket.emit("joinChat", chatId);

    // Listen for new messages in the chat room , we are here due to above step , this receives event from backend , it is inside chat controller
    socket.on("receiveMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);

      // 🔥 OPTIONAL CHANGE: If the user receives a message from the ADMIN 
      // while they have the chat open, mark it as seen.
      if (newMessage.senderType === "ADMIN") {
        socket.emit("messagesSeen", chatId);
      }
    });

    return () => {
      socket.off("receiveMessage");  // this is a cleanup function.
    };
  }, [chatId]);


  // /* ===============================
  //    AUTO REFRESH USER SIDE -   ye method use kr rhe the pehle , this is polling method    
  // =============================== */
  // useEffect(() => {
  //   if (!chatId) return;

  //   const interval = setInterval(() => {
  //     getUserChat(chatId).then((res) =>
  //       setMessages(res.data.messages)
  //     );
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, [chatId]);



  /* ===============================
     AUTO SCROLL
  =============================== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ===============================
     SEND USER MESSAGE , socket use krne se pehle hum send message k saath getAllmessge bhi krte the call coz ,
      user sends message , save in DB , but frontend doesn't know new message arrived , so front end calls getUserChat to 
      fetch all messages agian ,then ui updates , but now using socket so dont need that.
      this is what happes now - User sends message → backend saves message → backend emits socket event 
      → frontend receives event instantly → frontend updates UI automatically.
  =============================== */
  const sendMessage = async () => {
   if (!text.trim() && !image) return; // empty message(trim removes spaces so if message is only " "  then not send) or chat not selected

    try {

const formData = new FormData();
    formData.append("message", text);
    if (image) {
      formData.append("image", image);
    }

      await sendUserMessage(chatId, formData); // backend call  which is using socket there.
      setText(""); // after message is sent input field become empty.
       setImage(null);
    } catch (err) {
      console.log("Send error", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Support Chat</h1>

      <div className="border h-96 overflow-y-auto p-4 mb-4 bg-white">   {/* fix height h-96 , overflow auto for scroll when message overflow */}
     
       {/* now rendering messages  , messages is a state wehre messages were stored
       in secont line line assigning id  because react requires an id  , mb is margin bottom ,creating spaces between messages*/
       }
      {messages.map((m) => (
  <div key={m.id} className="mb-2">
    <b>{m.senderType}:</b>

{/* niche vaali both are conditions   in react.   that how react work
If condition is true → render component
If condition is false → render nothing

similarly if there is message  show that message in pahragraph ,  other wise nothing 
similar for image url */}
    {m.message && <p>{m.message}</p>}

    {m.imageUrl && (
      <img
        src={`http://localhost:3000${m.imageUrl}`}
        className="max-w-xs mt-1 rounded"
        alt="chat"
      />
    )}
  </div>
))}

        <div ref={bottomRef} />  {/* userd for autoscroll */}
      </div>

{/* IMAGE PREVIEW BEFORE SENDING */}
{image && (
  <div className="relative mb-2 w-fit">

    <img
      src={URL.createObjectURL(image)}
      className="max-w-xs rounded border"
      alt="preview"
    />

    {/* cross button during preview  to cancel  IMAGE  */}
    <button
      onClick={() => setImage(null)}
      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
    >
      ✕
    </button>

  </div>
)}


    {/* choose file , no file choosen */}
<input
  type="file"
  accept="image/*"
  onChange={(e) => setImage(e.target.files[0])}
  className="text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-300 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
/>

           {/* input + send   ,  and below down text is state and setText is used to change the state*/}
      <div className="flex gap-2">
        <input
          className="border flex-1 p-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()} // enter key sends the text
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default UserChat;
