const express = require ('express');
 const router =  express.Router();
 const likeController =require("../controller/like.controller");

 const  {verifyToken}  = require("../middleware/auth.middleware");


// public 
router.post("/toggleLike/:productId" , verifyToken , likeController.toggleLike); // here  instead of id we need to mention the prdcutId ,
//  because this was the keyword mentioned in the  req.params .
// when its query  then we can write here any refrence keyword , eg.  id.     but for req.params  we have to match the exact name.

router.get("/countLikes/:productId" , verifyToken , likeController.getLikeCount);



module.exports = router;