const { BrowsingHistory, Product } = require("../models");

// addOrUpdateHistory_____________________________________________________________________________________________________
exports.addOrUpdateHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "productId is required",
      });
    }

    // doing find by one  instead of findById because of unique constraint (userId + productId)
    const history = await BrowsingHistory.findOne({
      where: { userId, productId },
    });

    if (history) {
      // product already viewed → just update viewedAt
      history.viewedAt = new Date();
      await history.save();

      return res.status(200).json({
        message: "Browsing history updated",
        data: history,
      });
    }

    // first time view → create new record
    const newHistory = await BrowsingHistory.create({
      userId,
      productId,
      viewedAt: new Date(),
    });

    res.status(201).json({
      message: "Browsing history added",
      data: newHistory,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};



//get history____________________________________________________________________________________________________________________________

exports.getMyBrowsingHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await BrowsingHistory.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: "product",
        },
      ],
      order: [["viewedAt", "DESC"]],
    });

    res.status(200).json({
      count: history.length, // giving total number of product registered in history.
      data: history,  // getting history array of object
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};




//remove a item from history ___________________________________________________________________________________________________________________________

exports.removeFromHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const history = await BrowsingHistory.findOne({
      where: { userId, productId },
    });

    if (!history) {
      return res.status(404).json({
        message: "History record not found",
      });
    }

    await history.destroy();

    res.status(200).json({
      message: "Browsing history item removed",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


 //Clear all browsing history of user, here dont need product id_________________________________________________________________________________
 
 
exports.clearHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    await BrowsingHistory.destroy({
      where: { userId },
    });

    res.status(200).json({
      message: "Browsing history cleared",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
