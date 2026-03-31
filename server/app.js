const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

/* here app dedicates to express framework , it konws hot to handle routes , middleware and controller ,but it doest not create a real network server by itself.
// for that purpose on server side we do  app.liten(port)  .  internally i do steps to create http server
const http = require("http");
const server = http.createServer(app);
server.listen(3000);

but for socket use we need to create it manually, socket.io needs direct access , in as you can see in server side instead of app.listen(port) iam doing server.listen(port).
*/
const app = express();

// Middleware______________________________________________________________________________________________
app.use(cors()); // its a permission that tells " * "   . this symbol means all ,   actually our front end and backend runs on diffrent ports ,
// browser treats it as two diffrent website and as per rule  one website cant fetch data from another website,  hence this cors give that permision
// and now front-end can get data from back-end   and vice versa.
app.use(morgan("dev"));
app.use(express.json());     // parses API JSON bodies. given by client in req.body
app.use(express.urlencoded({ extended: true })); //parses HTML coming from front end

//routes____________________________________________________________________________________________________________
app.use("/api/v1/auth", require("./routes/auth.routes"));
app.use("/api/v1/users", require("./routes/user.routes"));
app.use("/api/v1/product", require("./routes/product.routes"));
app.use("/api/v1/category", require("./routes/category.routes"));
app.use("/api/v1/comment", require("./routes/comment.routes"));
app.use("/api/v1/review" , require("./routes/review.routes"))
app.use("/api/v1/cms", require("./routes/cms.routes"));
app.use("/api/v1/notification", require("./routes/notification.routes"));
app.use("/api/v1/like", require("./routes/like.routes"));
app.use("/api/v1/favourite", require("./routes/favourite.routes"));
app.use("/api/v1/history", require("./routes/history.routes"));
app.use("/api/v1/chat", require("./routes/chat.routes"));


// app.use("/chat-images", express.static("public/chat-images"));
// see the above line , this is how we give access of images, but we need to give it sepratly for every function 
// for example the above one is for chat , but if we wnat to upload product image then agian we need to create this serpatly with 
// product-image  address, and vice versa for user-image .  
// to avoid this taks, i have mentioned the parent folder public in one time , i will work for everyone
// http://localhost:3000/public/chat-images/123.png
app.use("/public", express.static("public"));

// route test ________________________________________________________________________________________________________
app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working 🚀"
  });
});



module.exports = app;  // app.js is required in server.js , because in app.js we create the app and runs it in server.js





