const { Chat, ChatMessage, User } = require("../models");

// user  create chat session , eg.  whats app chat support box where he can type anything.(not crio vala) _____________________________________________________________________________________________________________________________

exports.createChat = async (req, res) => {
  try {
    const userId = req.user.id;

    //  find ANY open chat including soft deleted
    let chat = await Chat.findOne({
      where: { userId, status: "OPEN" },
      paranoid: false,
    });

    // if found but soft-deleted → restore it
    if (chat && chat.deletedAt) {
      await chat.restore();
    }

    if (chat) {
      return res.status(200).json({
        message: "Chat already exists",
        chat,
      });
    }

    // create new only if none exists
    chat = await Chat.create({ userId });

    res.status(201).json({
      message: "Chat created",
      chat,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed" });
  }
};

// user sends a message , this go directly in  admin chat screen message list_______________________________________________________________________________________________________________________________
exports.sendUserMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { message } = req.body;
    const file = req.file; // req.file  is a multer object , it receives the uploaded image , save it to  public/ chat image (which is a computer disk storage) , as it was chaging the real name of image in middlreware for security purspose , here it attaches those new file information to req.file

    let imageUrl = null; // initially  i am assuming that there is no image, coz sending  image in chat is optional.
    // but if the req.file  exists then teh below line will execute
    // Here we create the URL that will be stored in databse and frontend will use to load the image., we are storing url instead of file , and actual image statys in public/chat-images (computer storage).

    if (file) {
      imageUrl = `/public/chat-images/${file.filename}`;
    }

    // message exists, so it's safe to call .trim() which removes extra spaces from start and end
    if (!message?.trim() && !file) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const chat = await Chat.findOne({
      where: { id: chatId, userId }, // checking if the  chat belongs to this specific user
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const io = req.app.get("io");

    // saving to database
    // Every user message is unread by default. , isRead: false
    const chatMessage = await ChatMessage.create({
      chatId,
      senderType: "USER",
      senderUserId: userId,
      message,
      imageUrl,
      isRead: false,
    });

    await chat.update({ updatedAt: new Date() });

    // here i will get a live message  quickly (without refreshing) if user sends to admin or vice versa
    io.to(`chat_${chatId}`).emit("receiveMessage", chatMessage);

    // Notify  in side bar that new message has arrived , but this do not calculate how many messages, that is done admin page with useEffect which calls backend method getAdminChats()
    io.emit("newChatMessage", {
      chatId,
      userId,
      message: chatMessage.message,
    });

    res.status(201).json({
      message: "Message sent",
      data: chatMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

/* =====================================================
    it will open on admin side where he can see users chat ,  and users side also
===================================================== */
exports.getUserChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // USER access check
    if (req.user.role !== "ADMIN" && chat.userId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await ChatMessage.findAll({
      where: { chatId },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: User,
          as: "userSender",
          attributes: ["id", "full_name", "role"],
        },
      ],
    });

    res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

/* =====================================================
   ADMIN: Get All Chats (Admin Inbox)
===================================================== */
exports.getAllChatsForAdmin = async (req, res) => {
  // first fetching from database
  // also we want that data in sorted order
  try {
    const chats = await Chat.findAll({
      where: { status: "OPEN" },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "full_name", "email"],
        },

        {
          model: ChatMessage,
          as: "messages",
          attributes: ["id", "isRead", "senderType"],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    // chats.map  is entering in to  chat column ,  the next line is filtering  and then counting the chat messages inside that column
    // only the message if it is send by user and message has not been read yet
    // .length is calculating the number of all that messages which is stored in  variable const unreadCount
    const formattedChats = chats.map((chat) => {
      const unreadCount = chat.messages.filter(
        (msg) => msg.senderType === "USER" && msg.isRead === false,
      ).length;

      return {
        id: chat.id,
        status: chat.status,
        updatedAt: chat.updatedAt,
        user: chat.user,
        unreadCount, // ye toh upr vala hai count ,
      };
    });

    res.status(200).json({ chats: formattedChats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

/* =====================================================
   ADMIN: Send Message
===================================================== */
exports.sendAdminMessage = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { chatId } = req.params;
    const { message } = req.body;

    const file = req.file;

    let imageUrl = null;

    if (file) {
      imageUrl = `/public/chat-images/${file.filename}`;
    }

    if (!message?.trim() && !file) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const chat = await Chat.findOne({
      where: { id: chatId, status: "OPEN" },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found or closed" });
    }

    const chatMessage = await ChatMessage.create({
      chatId,
      senderType: "ADMIN",
      senderAdminId: adminId,
      message,
      imageUrl,
    });

    await chat.update({ updatedAt: new Date() }); // So chat moves to top in admin inbox.

    // ================= SOCKET EMIT ADD THIS =================
    const io = req.app.get("io"); // get socket instance
    io.to(`chat_${chatId}`).emit("receiveMessage", chatMessage);
    // ========================================================

    res.status(201).json({
      message: "Message sent",
      data: chatMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send message" });
  }
};
