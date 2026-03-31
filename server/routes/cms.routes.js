const express = require("express");
const router = express.Router();

const cmsController = require("../controller/cms.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");


// ADMIN ROUTES ONLY
router.post("/createCms",verifyToken,  checkRole("ADMIN"), cmsController.createCMS);
router.get("/getAllCms",verifyToken,  checkRole("ADMIN"), cmsController.getAllCMS);
router.put("/update/:id",verifyToken,  checkRole("ADMIN"), cmsController.updateCMS); // update should be based on id , not based on slug
router.delete("/softDelete/:id",verifyToken,  checkRole("ADMIN"), cmsController.deleteCMS);
router.delete("/delete/:id",verifyToken,  checkRole("ADMIN"), cmsController.permanentDeleteCMS);

// public route 
router.get("/getBySlug/:slug",verifyToken , cmsController.getCMSBySlug);


module.exports = router;
