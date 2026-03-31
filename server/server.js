const dotenv = require("dotenv");
dotenv.config();

const app = require("./app"); // in app.js we created the app and now will run  it here on server.js
const db = require("./models");   
/* model folder :- we are importing the model folder directly and able to use its files , this is because model folder includes a file "index.js"
    which has  this line const db = {} , it is using file reader function .  now in controller we can diretly do  modelname.methodname();
   also check multiple imported files in index.js  (config.josn ,sequelize , association, sync , file system etc.), hence by importing only the models we will get access to all feature that are imported there.
*/
// imports _________________________
const http = require("http");            //  it was inbuilt in express , but socket needs direct connection manually
const { Server } = require("socket.io");  // Server is a class provided by socket.io.  |   httpServer = your normal HTTP server  |  io = socket server instance   ,
//  let me explain-  Server → is a class   new Server(server) → creates an object    That object is stored in io
// the above socket import line says that - Go inside the exported object and take the property named Server.  hence import statement me Server keyword likhna hi pdega.


  //  Server_____________________________________________________________________________ 
  const PORT = process.env.PORT || 3000;
  
// create http server manully and tells it to use your express app to handle requests , earlier i was using only express where http is i built in , but for socket we need full access to http directly
const server = http.createServer(app);

//_________________________________________________________________________________________
// it means Create a Socket.IO server and attach it to the existing HTTP server, with some configuration (like CORS).____________________________________________
// first "Server" keyword is socket class , second "server" keyword is  http server.
// here we are saying that  Use this same HTTP server to also accept WebSocket connections.
//io is now the main socket manager.It will: listen for users connecting create rooms send messages broadcast events .  later i will use it as  io.on("connection", (socket) => {})
// CORS = Cross Origin Resource Sharing. Means:Which frontend is allowed to connect to this backend?  currently origin is "* " .   it means any front end can connect to my backend , but later i will  proper address - Frontend → http://localhost:5173
const io = new Server(server, {
  cors: {
    origin: "*",   // change to frontend URL in production
    methods: ["GET", "POST"]
  }
});

//We are storing the socket server (io) inside the Express app so that it can be accessed anywhere (controllers, routes, etc.).
//app is an Express object. Express allows you to store global values inside it using: app.set(key, value) and later retrieve them using: app.get(key)
app.set("io", io);  


// here first we are connecting user with socket then 
//  io is whole server  , connection is built in event , socket is individual connected user
// this runs when front end does - socket.connect  which triggers socket.js -    const socket = io("http://localhost:3000");
// connection, joinChat, disconnect — all are events.  but connection and disconnect are built in socket evers and joinChat is customized event created by me.
// join chat is a custom event , it will trigger when front end does - socket.emit("joinChat", 123);
io.on("connection", (socket) => {
  console.log("User connected:", socket.id); // every user gets unique ID automatically 

  socket.on("registerRole", (role) => {
    socket.userRole = role; // store role in socket
  });

  // socket.on("joinChat") listens for a chat selection event, and socket.join() adds that user’s connection into a specific chat room so messages can be broadcast only to that chat.
  // when front end do - socket.emit("joinChat", 123);  then this this below line runs.-  socket.on("joinChat", ...)
  // what is socket.join()- it is saying  Put this user inside room named chat_123. , So later you can send message only to that room.
  socket.on("joinChat", (chatId) => {
    socket.join(`chat_${chatId}`);
     socket.currentChat = chatId; // 🔥 track current chat
  });

  socket.on("leaveChat", (chatId) => {
  socket.leave(`chat_${chatId}`);
   socket.currentChat = null;
});


  //  NEW , message  counter and message seen logic
  socket.on ( "messagesSeen", async (chatId) => {
    try {
   const { ChatMessage } = require("./models");

    //  Update the database , make unread message as read
    const [updatedRows] = await ChatMessage.update(
      { isRead: true },
      {
        where: {
          chatId,
          senderType: "USER",
          isRead: false
        }
      }
    );


    // Notice it says io.emit (to everyone) and not socket.emit (to just one person). mtlv ki if you have opened admin panel in phone and laptop both  and if in lapto you read some chat then it will be istatnly visible in your phone also
    //  Only emit if something actually changed 
    // This prevents unnecessary refresh
  
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
});





  //   This runs automatically when:user closes browser internet drops refresh page So this tells you when user leaves.
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

  // database_+ server start--_________________________________________________
  db.sequelize.authenticate()
    .then(() => {
      console.log("Database connected");
  
     
      //     if (process.env.NODE_ENV === "development") {
      //   db.sequelize.sync({ force: true });
      // }

         // if (process.env.NODE_ENV === "development") {
      //   db.sequelize.sync({ alter: true });
      // }
  
  
       if (process.env.NODE_ENV === "development") {
          db.sequelize.sync({alter: false });
       }
  //______________________________________________________________________________________
       server.listen(PORT, () => {  // using server.listen , earlier it was app.listen
      console.log(`Server running on http://localhost:${PORT}`);
    });
    })
    .catch((err) => {
      console.error(" DB connection failed:", err);
    });