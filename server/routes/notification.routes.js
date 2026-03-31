const express = require("express")
const router = express.Router();

const  notificationController = require("../controller/notification.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");




// two are for admin , two are public.
router.post("/createNotification",verifyToken, checkRole("ADMIN") ,notificationController.createNotification);
router.delete("/delete/:id", verifyToken , checkRole("ADMIN") ,notificationController.permanentDeleteNotification);
router.get("/getNotificationById/:id", verifyToken ,notificationController.getMyNotificationsById);
router.delete("/softDelete/:id", verifyToken ,notificationController.softDelete);






module.exports = router;
