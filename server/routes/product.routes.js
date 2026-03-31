const express = require("express")
const router = express.Router();

const  productController = require("../controller/product.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");



//admin only
router.post("/createProducts", verifyToken, checkRole("ADMIN"),  upload.single("image"), productController.createProduct);
router.delete("/softDelete/:id" , verifyToken ,checkRole("ADMIN") ,productController.softDelete);
router.delete("/delete/:id" , verifyToken ,checkRole("ADMIN"), productController.delete);

// public
router.get("/getAllProducts" , verifyToken , productController.getAllProducts);
router.get("/getProductById/:id" , verifyToken , productController.getProductById);




module.exports = router;
