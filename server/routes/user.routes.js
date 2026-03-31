const express = require("express");
const router = express.Router();

const userController = require("../controller/user.controller");
const { checkRole } = require("../middleware/role.middleware");
const { verifyToken } = require("../middleware/auth.middleware");


router.get("/getAllUsers", verifyToken, checkRole("ADMIN"), userController.getAllUsers); // before check role verifyToken must run first because it CREATES req.user, and all other auth logic DEPENDS on req.user.   No req.user means no role = no permissions.

router.get("/getUserById/:id"  ,verifyToken , checkRole("ADMIN") , userController.getUserById);

router.get("/getMyprofile"  ,verifyToken  , userController.getMyProfile);

router.put("/updateUser/:id" ,verifyToken ,   checkRole("ADMIN") ,userController.updateUser);
router.put("/updateMyProfile/" ,verifyToken  ,userController.updateMyProfile);

router.delete("/softDeleteUser/:id" ,verifyToken, checkRole("ADMIN" , "USER")   ,userController.deleteUser);

router.delete("/deleteUser/:id" , verifyToken, checkRole("ADMIN") , userController.permanentDeleteUser);


module.exports = router;
