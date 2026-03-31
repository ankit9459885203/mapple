const express = require("express");
const router = express.Router();
const chatController = require("../controller/chat.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");// middleware for uploading a image

// user api
router.post("/createChat", verifyToken, chatController.createChat);
router.get("/getUserChat/:chatId", verifyToken, chatController.getUserChat);
router.post( "/sendUserMessage/:chatId",verifyToken,upload.single("image"),chatController.sendUserMessage); // user can send both message and image



// // admin api
router.get("/getAdminChats", verifyToken,checkRole("ADMIN"), chatController.getAllChatsForAdmin);
router.post("/adminSendMessage/:chatId", verifyToken,checkRole("ADMIN"),  upload.single("image"), chatController.sendAdminMessage); // admin can send both message and image
module.exports = router;




/*
multer provides different methods depending on how many files you expect:

.single('key'): One single file. Populates req.file.
.array('key', 5): Multiple files (up to 5) under the same key. Populates req.files.
.fields([...]): Multiple files under different keys (e.g., an 'avatar' and a 'coverPhoto'). Populates req.files.

*/