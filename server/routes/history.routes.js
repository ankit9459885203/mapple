const express = require ('express');
 const router =  express.Router();
 const historyController =require("../controller/history.controller");
 const  {verifyToken}  = require("../middleware/auth.middleware");



// public 
router.post("/addOrUpdate" , verifyToken , historyController.addOrUpdateHistory);
router.post("/getHistory" , verifyToken ,historyController.getMyBrowsingHistory);
router.delete("/removeProductById/:productId" , verifyToken ,historyController.removeFromHistory);
router.delete("/clearHistory" , verifyToken ,historyController.clearHistory)




module.exports = router;