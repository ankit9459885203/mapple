const { CMS } = require("../models");

/**
 * CREATE CMS PAGE________________________________________________________________________________________________________________________
 */
exports.createCMS = async (req, res) => {
  try {
    const { slug, title, content, status } = req.body;

    // validation
    if (!slug || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "slug, title and content are required"
      });
    }

    // prevent duplicate slug
    const existingPage = await CMS.findOne({ where: { slug } });
    if (existingPage) {
      return res.status(409).json({
        success: false,
        message: "CMS page with this slug already exists"
      });
    }

    const page = await CMS.create({
      slug,
      title,
      content,
      status
    });

    return res.status(201).json({
      success: true,
      message: "CMS page created successfully",
      page
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create CMS page",
      error: error.message
    });
  }
};

/**
 * GET ALL CMS PAGES_________________________________________________________________________________________________________________________
 */
exports.getAllCMS = async (req, res) => {
  try {
    const pages = await CMS.findAll({
      order: [["createdAt", "DESC"]]
    });

    return res.status(200).json({
      success: true,
      count: pages.length,
      pages
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch CMS pages",
      error: error.message
    });
  }
};

/**
 * GET CMS PAGE BY SLUG_________________________________________________________________________________________________________________-
 * only  one  PUBLIC   
 *      
 *  using slug  to get instead of id , because its human readable ,  cant use tittle becuase
 *  tittle can be of bigger size which may include  spaces or special  characters  that is not supported by url.
 * API → /api/cms/:slug  
 */
exports.getCMSBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const page = await CMS.findOne({
      where: { slug, status: true }   // want slug whose status is true , dont want to show disable slug to users
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "CMS page not found"
      });
    }

    return res.status(200).json({
      success: true,
      page
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch CMS page",
      error: error.message
    });
  }
};

/**
 * UPDATE CMS PAGE_________________________________________________________________________________________________________________________
 */
exports.updateCMS = async (req, res) => {
  try {
    const { id } = req.params;// for updation always use id instead of slug  because  id is always unique and not even change with update operation unlike slug .  
    // but  for get operation using slug because it is human readable.
    const { slug, title, content, status } = req.body;

    // validate id
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid CMS id"
      });
    }
//find cms page
    const page = await CMS.findByPk(id);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: "CMS page not found"
      });
    }

// avoid slug collision , check  that your updated slug  page  should not be alredy existed .
        if (slug && slug !== page.slug) { // first slug tells - are we getting slug in req.body ,  then second slug is doing coparison logic, hence dot confuse
      const existingPage = await CMS.findOne({ where: { slug } });

      if (existingPage) {
        return res.status(409).json({
          success: false,
          message: "Slug already exists"
        });
      }
    }

     // if Nothing to update  , fields empty
    if (
      slug === undefined &&
      title === undefined &&
      content === undefined &&
      status === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update"
      });
    }

// update cms page
    await page.update({
      slug,
      title,
      content,
      status
    });

    return res.status(200).json({
      success: true,
      message: "CMS page updated successfully",
      page
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update CMS page",
      error: error.message
    });
  }
};

/**
 * SOFT DELETE CMS PAGE_______________________________________________________________________________________________________________________
 */
exports.deleteCMS = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await CMS.findByPk(id);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: "CMS page not found"
      });
    }

    await page.destroy();

    return res.status(200).json({
      success: true,
      message: "CMS page deleted successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete CMS page",
      error: error.message
    });
  }
};

/**
 * PERMANENT DELETE CMS PAGE______________________________________________________________________________________________________________________
 */
exports.permanentDeleteCMS = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await CMS.findByPk(id, { paranoid: false });
    if (!page) {
      return res.status(404).json({
        success: false,
        message: "CMS page not found"
      });
    }

    await page.destroy({ force: true });

    return res.status(200).json({
      success: true,
      message: "CMS page permanently deleted"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to permanently delete CMS page",
      error: error.message
    });
  }
};
