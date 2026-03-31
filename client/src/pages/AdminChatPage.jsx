import { useEffect, useState, useRef } from "react";
import { socket } from "../socket"; // // adding socket import from socket.js in src
import {
  getAdminChats,
  getUserChat,
  sendAdminMessage
} from "../services/chatService";

const AdminChatPage = () => {
  const [chats, setChats] = useState([]); // Array of all chats (left sidebar)
  const [selectedChat, setSelectedChat] = useState(null);// currently opened chat
  const [messages, setMessages] = useState([]); // Messages of opened chat
  const [text, setText] = useState(""); // Input box text
const [image, setImage] = useState(null); 
  const bottomRef = useRef(null); // autoscroll feature, when new message comes autoscroll to the bottom


   /* ===============================
     CONNECT SOCKET -   check its explaination in useChat
  =============================== */
  useEffect(() => {
    socket.connect();


    socket.on("connect", () => {
      console.log("Admin socket connected:", socket.id);
      socket.emit("registerRole", "ADMIN");
    });

    return () => {
      socket.disconnect();
    };
  }, []);



  /* 
     LOAD ALL CHATS when page opens ____________________________________________________
  */
  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await getAdminChats();  // backend api call , imported on the top
        setChats(res.data.chats);  // setChat is above  state function , and data is comin from axios to show all data
      } catch (err) {  // backend also handle the error but we need to handle it in front end also, so user can see error in 
    // screen , or we can decide that error will come as popup or need to redirect user to a new page.
        console.log("Error loading chats", err);
      }
    };

    loadChats(); // dekh agar isko baahr caal krta use effect k saath to red line warning aati ,but now its fine coz function is defined insde use effect and called once , in page load
  }, []);


  // if new user send text first time , show him in chat by reloading the  chat sidebar.
useEffect(() => {

 const refreshChats = async () => {
    const res = await getAdminChats();
    setChats(res.data.chats);
  };

   // When new message arrives (even if unread)
  socket.on("newChatMessage", refreshChats);

  // When messages are marked as seen
  socket.on("updateUnreadCount", refreshChats);

  return () => {
    socket.off("newChatMessage", refreshChats);
    socket.off("updateUnreadCount", refreshChats);
  };

}, []);

  /* 
     OPEN CHAT__________________________________________________________________________________________________
  when admin clicks any user chat , store that chat in state, then fetch its previous messages. */
 const openChat = async (chat) => {

  // Leave previous room , if clicking on user B then stop receiving real-time updates for UserA
 if (selectedChat) {
      socket.emit("leaveChat", selectedChat.id);
    }

    // sometimes it takes time for database to update and tell front end that message is seen , hence manually making count 0 in front end forcefully
    
    setChats(prevChats => 
      prevChats.map(c => 
        c.id === chat.id ? { ...c, unreadCount: 0 } : c
      )
    );


  // Join new room FIRST
  socket.emit("joinChat", chat.id);


  // Load old messages
  const res = await getUserChat(chat.id);
  setMessages(res.data.messages);

  
  // Set selected chat
  setSelectedChat(chat);

  // Mark old unread as seen
  socket.emit("messagesSeen", chat.id);

 
};
/* ===============================
   3️. Start listening for new messages, socket listner
=============================== */
useEffect(() => {
   if (!selectedChat?.id) return; // if admin has not selected any chat

    socket.off("receiveMessage"); // every time admin switches chat → new listener adds.Then message arrives → runs multiple times → duplicates. So we remove old listener first.

 // Listen for new messages in the chat room where we went in above step , this recives event from backend , it is inside chat controller
    socket.on("receiveMessage", (newMessage) => {

// adding new message in  already existing messages
   setMessages((prev) => [...prev, newMessage]);

    // if a new message came from user that i have already opened and i am currently on it , then dont show the counter notification for that user and mark it as seen 
    if (  newMessage.chatId == selectedChat.id &&  newMessage.senderType === "USER") {
      socket.emit("messagesSeen", selectedChat.id);
    }
  });

    return () => socket.off("receiveMessage");// clearner function
  }, [selectedChat?.id]); // 🔥 CHANGE: Added selectedChat.id as dependency

//   /*  this was the earlier method of polling .
//      AUTO REFRESH EVERY 3s-  When a chat is selected by admin → start a timer → every 3s fetch messages
// When chat changes → stop old timer → start new one
//   */
//   useEffect(() => {
//     if (!selectedChat) return; // if no chat selected , do nothing

//     const interval = setInterval(() => { //start timer ,   setInterval and clear interval  is builtin js function
//       fetchMessages(selectedChat.id);
//     }, 3000);

//     return () => clearInterval(interval); // clean up function , tells that stop timer if  chat changes or admin leaves the page
//   }, [selectedChat]); // this tell that run this feature whenever selected chat changes


 




  /* 
     AUTO SCROLL TO BOTTOM , when ever  [messages]  state changes 
     bottomRef is imported on the top. it simply means that when new message came scroll to bottom position
     scrollIntoView is telling to scroll the page ,  bottom is mentioned
     smooth animation - Instead of jumping instantly, it scrolls nicely.
     
  */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" }); // bottom ref is declared on top
  }, [messages]);

  /* 
     SEND ADMIN MESSAGE____________________________________________________________________
*/
 const sendMessage = async () => {

    if (!selectedChat || (!text.trim() && !image)) return;


  try {

    const formData = new FormData();

    formData.append("message", text);

    if (image) {
      formData.append("image", image);
    }

    await sendAdminMessage(selectedChat.id, formData);

    setText("");
    setImage(null);

  } catch (err) {
    console.error("Send error:", err);
 
    // optional UI feedback
    alert("Failed to send message");
  }
};


 // --------------------------------ui layout----------------------------
  return (
    <div className="flex h-[80vh]">

      {/* LEFT CHAT LIST */}
      <div className="w-1/5 border-r bg-white">
        <h2 className="p-3 font-bold">Chats</h2>
      
      {/* For every chat in chats array render a <div>. , react needs unique key for  lists chats is coming from use state ,  dot map loop through array which is used in start 
          selectedChat is a useState and  saying that Is the currently selected chat equal to this chat in loop then make it grey , : otherwise if false then add nothing
          next line is the text , that appears in each row.  saying- if user exists show full name ,if not exit show "user" keyword , after this also paste the user id.
*/}
        {chats.map((c) => (
          <div
            key={c.id}
            onClick={() => openChat(c)}
            className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
              selectedChat?.id === c.id ? "bg-gray-200" : ""
            }`}
          >


{/*  for new messsage count*/}
         <div className="flex justify-between items-center">
  <span className="font-medium">
    {c.user?.full_name || "User"}
  </span>

  {c.unreadCount > 0 && selectedChat?.id !== c.id &&(
    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
      {c.unreadCount}
    </span>
  )}
</div>


          </div>
        ))}

        
      </div>

      {/* RIGHT PANEL  , also below down we are placeing bottomRef , isko udr place krte jidr aap autoscroll k baad phunchnaa chaahte,  iske next vale to diffrent div hai  for send text and send button*/}
      <div className="flex-1 p-4 flex flex-col">
        {!selectedChat ? (
          <p>Select a chat</p>
        ) : (
          <>
            <div className="flex-1 border p-4 overflow-y-auto bg-white">
             
             {/*render image messages */}
             {messages.map((m) => (
  <div key={m.id} className="mb-2">
    <b>{m.senderType}:</b>

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

              <div ref={bottomRef} />
            </div>



{/* IMAGE PREVIEW BEFORE SENDING */}
{image && (
  <div className="relative mb-2 w-fit">

    <img
      src={URL.createObjectURL(image)}
      className="max-w-xs rounded border"
      alt="preview"
    />

      {/* cross button during preview  to cancel  IMAGE  , set image is use state */}
    <button
      onClick={() => setImage(null)}
      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
    >
      ✕
    </button>

  </div>
)}

   <div className="flex gap-2 mt-2">

  {/* choose file , no file choosen  , setImage is a  use state
  When the user selects a file, React receives an event object e.
  e.target.files is an array of selected files.  Since only one file is selected, we take the first one: e.target.files[0]
  Then we store it in React state:  So now this state variable contains the image file:
  
  Example:

image = {
  name: "cat.png",
  size: 200KB,
  type: "image/png"
}
  */
  }
  <input
  type="file"
  accept="image/*"
  onChange={(e) => setImage(e.target.files[0])}
    className="text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-300 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
/>


              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="border flex-1 p-2"
                placeholder="Reply..."
                 onKeyDown={(e) => e.key === "Enter" && sendMessage()} // enter key sends the text
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminChatPage;
