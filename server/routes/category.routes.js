const express = require("express");
const router = express.Router();

const categoryController = require("../controller/category.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");


// ADMIN ROUTES
router.post("/addCategory",verifyToken,  checkRole("ADMIN"), categoryController.createCategory);

router.put("/updateCategory/:id",verifyToken,checkRole("ADMIN"),categoryController.updateCategory);

router.delete("softDelete/:id", verifyToken, checkRole("ADMIN"),categoryController.deleteCategory);

router.delete("/delete/:id",verifyToken,checkRole("ADMIN"),categoryController.permanentDeleteCategory);


// PUBLIC ROUTES
router.get("/getCategory", categoryController.getAllCategories);
router.get("/getCategoryById/:id", categoryController.getCategoryById);

module.exports = router;
