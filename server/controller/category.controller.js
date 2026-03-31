// note:-  go to users  table there i have commneted  things in brief , in rest model i only commneted new things which were not in users model

const { Category } = require("../models");

// CREATE CATEGORY _______________________________________________________________________________________________________________________
exports.createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;

    // validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    // prevent duplicate category
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists"
      });
    }

    const category = await Category.create({
      name,
      image
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message
    });
  }
};



// GET ALL CATEGORIES___________________________________________________________________________________________________________________
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["createdAt", "DESC"]]
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message
    });
  }
};



//  GET CATEGORY BY ID_____________________________________________________________________________________________________________________-
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id"
      });
    }

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    return res.status(200).json({
      success: true,
      category
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message
    });
  }
};



// UPDATE CATEGORY______________________________________________________________________________________________________________________
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;

    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id"
      });
    }

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // nothing to update
    if (name === undefined && image === undefined) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update"
      });
    }

    await category.update({
      name,
      image
    });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message
    });
  }
};



// SOFT DELETE CATEGORY (paranoid: true) _______________________________________________________________________________________________________
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id"
      });
    }

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    await category.destroy(); // soft delete

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message
    });
  }
};



// PERMANENT DELETE _________________________________________________________________________________________-
exports.permanentDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      paranoid: false
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    await category.destroy({ force: true }); // permanent delete

    return res.status(200).json({
      success: true,
      message: "Category permanently deleted"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to permanently delete category",
      error: error.message
    });
  }
};
