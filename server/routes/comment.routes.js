const express = require ('express');
 const router =  express.Router();
 const commentController =require("../controller/comment.controller");

 const  {verifyToken}  = require("../middleware/auth.middleware");
const  {checkRole}  = require("../middleware/role.middleware");


// public 
router.post("/addComment" , verifyToken , commentController.createComment);
router.delete("/deleteComment/:id", verifyToken , commentController.deleteComment );
router.put("/editComment/:id", verifyToken , commentController.editComment );





module.exports = router;