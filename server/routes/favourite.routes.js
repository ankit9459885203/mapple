const express = require ('express');
 const router =  express.Router();
 const favouriteController =require("../controller/favourite.controller");
 const  {verifyToken}  = require("../middleware/auth.middleware");



// public 
router.post("/addFavourite" , verifyToken , favouriteController.addToFavorite);
router.delete("/removeFavProduct/:productId", verifyToken , favouriteController.removeFromFavorite );
router.get("/getAllFavourite", verifyToken , favouriteController.getMyFavorites);





module.exports = router;