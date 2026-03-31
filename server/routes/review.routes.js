const express = require("express")
const router = express.Router();

const  reviewController = require("../controller/review.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");





router.post("/addReview", verifyToken ,reviewController.addReview);



module.exports = router;
