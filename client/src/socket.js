import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
  autoConnect: false,
});
/*
this is frontend version of socket.io.
in bakckned we have socket.io ,  in front end we have  socket.io.client   , i got these imports  from  installation command
>  io is a function provided by socket.io-client. It is used to create a connection to the backend socket server.
const socket = io(...) // this line creates a socket instance
> "http://localhost:3000" This must match your backend server. it connects to our backend
> auto connect is false so to connect , we need to do  socket.connect();

🔥 Why Use autoConnect: false?

Usually used when: You want to connect only after login ,You want to wait for token ,You want to control connection timing

Example:

useEffect(() => {
  socket.connect();
}, []);
*/






// 🔥 Very Important

// This socket on frontend is DIFFERENT from backend socket.

// Frontend socket = connection to server

// Backend: socket = one connected user

// Same word, different side.